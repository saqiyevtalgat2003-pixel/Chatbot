import os
import re
import logging
import random

import httpx
import markovify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.constants import ChatAction
from telegram.ext import (
    Application,
    ApplicationBuilder,
    ContextTypes,
    MessageHandler,
    CommandHandler,
    CallbackQueryHandler,
    ChatMemberHandler,
    filters,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Config (Render-де Environment Variables арқылы беріледі)
# ------------------------------------------------------------------
BOT_TOKEN = os.environ["BOT_TOKEN"]
WEBHOOK_URL = os.environ.get("WEBHOOK_URL")
PORT = int(os.environ.get("PORT", 10000))

RANDOM_REPLY_CHANCE = float(os.environ.get("RANDOM_REPLY_CHANCE", "0.05"))
MIN_WORDS_FOR_GENERATION = 30

# Боттың негізгі жаратушысының Telegram user ID-і.
# Мысалы @userinfobot арқылы өз ID-іңізді біліп, осында саны түрінде қойыңыз.
_owner_raw = os.environ.get("OWNER_ID", "")
OWNER_ID = int(_owner_raw) if _owner_raw.strip().lstrip("-").isdigit() else None

# Supabase
SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}
MESSAGES_URL = f"{SUPABASE_URL}/rest/v1/chatbot_messages"
SETTINGS_URL = f"{SUPABASE_URL}/rest/v1/chatbot_settings"
GROUPS_URL = f"{SUPABASE_URL}/rest/v1/chatbot_groups"

URL_RE = re.compile(r"(https?://|www\.|t\.me/|telegram\.me/)\S+", re.IGNORECASE)

# ------------------------------------------------------------------
# Триггер сөздер
# ------------------------------------------------------------------
TRIGGERS = {
    "сәлем": "Сәлем! 👋",
    "салем": "Сәлем! 👋",
    "қалайсың": "Жақсымын, рахмет! Ал сен қалайсың? 😊",
    "калайсын": "Жақсымын, рахмет! Ал сен қалайсың? 😊",
    "рахмет": "Оқасы жоқ! 🙌",
    "сау бол": "Сау бол! 👋",
    "бот": "Мен осындамын, тыңдап тұрмын 🤖",
}


def find_trigger_reply(text: str) -> str | None:
    lowered = text.lower()
    for keyword, reply in TRIGGERS.items():
        if keyword in lowered:
            return reply
    return None


def is_group_chat(update: Update) -> bool:
    return update.effective_chat.type in ("group", "supergroup")


def contains_link(text: str) -> bool:
    return bool(URL_RE.search(text))


# ------------------------------------------------------------------
# Дерекқор (Supabase REST / PostgREST арқылы)
# ------------------------------------------------------------------
async def save_message(chat_id: int, text: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            MESSAGES_URL,
            headers={**SUPABASE_HEADERS, "Prefer": "return=minimal"},
            json={"chat_id": chat_id, "text": text},
            timeout=10,
        )
        if resp.status_code >= 300:
            logger.warning("Supabase insert failed: %s %s", resp.status_code, resp.text)


async def get_all_text(chat_id: int) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            MESSAGES_URL,
            headers=SUPABASE_HEADERS,
            params={"chat_id": f"eq.{chat_id}", "select": "text"},
            timeout=10,
        )
        resp.raise_for_status()
        rows = resp.json()
        return "\n".join(r["text"] for r in rows)


async def count_messages(chat_id: int | None = None) -> int:
    params = {"select": "id"}
    if chat_id is not None:
        params["chat_id"] = f"eq.{chat_id}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            MESSAGES_URL,
            headers={**SUPABASE_HEADERS, "Prefer": "count=exact"},
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        content_range = resp.headers.get("content-range", "*/0")
        total = content_range.split("/")[-1]
        return int(total) if total.isdigit() else 0


DEFAULT_SETTINGS = {
    "delete_links": False,
    "force_sub_enabled": False,
    "force_sub_target": None,
}


async def get_settings(chat_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            SETTINGS_URL,
            headers=SUPABASE_HEADERS,
            params={"chat_id": f"eq.{chat_id}", "select": "*"},
            timeout=10,
        )
        resp.raise_for_status()
        rows = resp.json()
        if not rows:
            return dict(DEFAULT_SETTINGS)
        return {**DEFAULT_SETTINGS, **rows[0]}


async def upsert_settings(chat_id: int, **fields):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            SETTINGS_URL,
            headers={
                **SUPABASE_HEADERS,
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
            json={"chat_id": chat_id, **fields},
            timeout=10,
        )
        if resp.status_code >= 300:
            logger.warning("Supabase settings upsert failed: %s %s", resp.status_code, resp.text)


async def upsert_group(chat_id: int, title: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            GROUPS_URL,
            headers={
                **SUPABASE_HEADERS,
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
            json={"chat_id": chat_id, "chat_title": title},
            timeout=10,
        )
        if resp.status_code >= 300:
            logger.warning("Supabase group upsert failed: %s %s", resp.status_code, resp.text)


async def count_groups() -> int:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GROUPS_URL,
            headers={**SUPABASE_HEADERS, "Prefer": "count=exact"},
            params={"select": "chat_id"},
            timeout=10,
        )
        resp.raise_for_status()
        content_range = resp.headers.get("content-range", "*/0")
        total = content_range.split("/")[-1]
        return int(total) if total.isdigit() else 0


# ------------------------------------------------------------------
# Көмекші функциялар
# ------------------------------------------------------------------
def is_junk(text: str) -> bool:
    if not text:
        return True
    if text.startswith("/"):
        return True
    if len(text.strip()) < 2:
        return True
    return False


def clean_text(text: str) -> str:
    text = re.sub(r"http\S+|www\.\S+", "", text)
    return text.strip()


async def generate_reply(chat_id: int) -> str | None:
    corpus = await get_all_text(chat_id)
    if not corpus:
        return None
    try:
        text_model = markovify.NewlineText(corpus, state_size=1, well_formed=False)
        sentence = text_model.make_sentence(tries=50)
        if not sentence:
            sentence = text_model.make_short_sentence(200, tries=50)
        return sentence
    except Exception as e:
        logger.warning(f"Generation failed: {e}")
        return None


async def is_chat_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
    chat = update.effective_chat
    user = update.effective_user
    try:
        member = await context.bot.get_chat_member(chat.id, user.id)
        return member.status in ("administrator", "creator")
    except Exception as e:
        logger.warning("Admin check failed: %s", e)
        return False


async def is_subscribed(context: ContextTypes.DEFAULT_TYPE, target: str, user_id: int) -> bool:
    try:
        member = await context.bot.get_chat_member(chat_id=target, user_id=user_id)
        return member.status in ("member", "administrator", "creator")
    except Exception as e:
        # Баптау дұрыс емес болса (бот сол арнада админ емес т.б.) — топты
        # бітеп тастамау үшін рұқсат береміз, тек логқа жазамыз.
        logger.warning("Force-sub check failed for %s: %s", target, e)
        return True


# ------------------------------------------------------------------
# Топ баптаулары панелі
# ------------------------------------------------------------------
def settings_keyboard(chat_id: int, settings: dict) -> InlineKeyboardMarkup:
    links_label = "🔗 Сілтеме өшіру: ✅" if settings.get("delete_links") else "🔗 Сілтеме өшіру: ❌"
    forcesub_label = "📢 Міндетті жазылым: ✅" if settings.get("force_sub_enabled") else "📢 Міндетті жазылым: ❌"
    target = settings.get("force_sub_target") or "орнатылмаған"
    rows = [
        [InlineKeyboardButton(links_label, callback_data=f"set:links:{chat_id}")],
        [InlineKeyboardButton(forcesub_label, callback_data=f"set:forcesub:{chat_id}")],
        [InlineKeyboardButton(f"📌 Арна/топ орнату ({target})", callback_data=f"set:target:{chat_id}")],
    ]
    return InlineKeyboardMarkup(rows)


async def settings_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_group_chat(update):
        return
    if not await is_chat_admin(update, context):
        await update.message.reply_text("Бұл команда тек топ әкімшілеріне рұқсат етілген 🔒")
        return
    chat_id = update.effective_chat.id
    settings = await get_settings(chat_id)
    await update.message.reply_text(
        "⚙️ Топ баптаулары:",
        reply_markup=settings_keyboard(chat_id, settings),
    )


async def settings_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    _, action, chat_id_str = query.data.split(":")
    chat_id = int(chat_id_str)
    user = update.effective_user

    try:
        member = await context.bot.get_chat_member(chat_id, user.id)
        if member.status not in ("administrator", "creator"):
            await query.answer("Тек әкімшілерге рұқсат бар 🔒", show_alert=True)
            return
    except Exception:
        await query.answer("Тексеру мүмкін болмады 🔒", show_alert=True)
        return

    settings = await get_settings(chat_id)

    if action == "links":
        new_val = not settings.get("delete_links", False)
        await upsert_settings(chat_id, delete_links=new_val)
        settings["delete_links"] = new_val
        await query.answer("Сақталды ✅")
        await query.edit_message_reply_markup(reply_markup=settings_keyboard(chat_id, settings))

    elif action == "forcesub":
        new_val = not settings.get("force_sub_enabled", False)
        if new_val and not settings.get("force_sub_target"):
            await query.answer("Алдымен арна/топты орнатыңыз 📌", show_alert=True)
            return
        await upsert_settings(chat_id, force_sub_enabled=new_val)
        settings["force_sub_enabled"] = new_val
        await query.answer("Сақталды ✅")
        await query.edit_message_reply_markup(reply_markup=settings_keyboard(chat_id, settings))

    elif action == "target":
        context.chat_data["awaiting_forcesub_target"] = user.id
        await query.answer()
        await query.message.reply_text(
            "Арна немесе топтың @username-ін осы чатқа жіберіңіз (мыс. @mychannel).\n\n"
            "⚠️ Бот сол арна/топта әкімші болуы керек, әйтпесе мүшелікті тексере алмайды."
        )


async def checksub_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    chat_id = int(query.data.split(":")[1])
    user = update.effective_user
    settings = await get_settings(chat_id)
    target = settings.get("force_sub_target")
    if not target:
        await query.answer("Баптау табылмады", show_alert=True)
        return
    if await is_subscribed(context, target, user.id):
        await query.answer("Рахмет! Енді топта жаза аласыз ✅", show_alert=True)
        try:
            await query.message.delete()
        except Exception:
            pass
    else:
        await query.answer("Әлі қосылмағансыз ❌", show_alert=True)


# ------------------------------------------------------------------
# Бот иесінің админ панелі
# ------------------------------------------------------------------
def owner_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([[InlineKeyboardButton("📊 Жалпы статистика", callback_data="owner:stats")]])


async def owner_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    user = update.effective_user
    if not OWNER_ID or user.id != OWNER_ID:
        await query.answer("Рұқсат жоқ 🔒", show_alert=True)
        return
    if query.data == "owner:stats":
        groups = await count_groups()
        messages = await count_messages()
        await query.answer()
        await query.edit_message_text(
            "👑 Админ панель\n\n"
            f"📊 Статистика:\n"
            f"— Топтар саны: {groups}\n"
            f"— Жиналған хабарлама: {messages}",
            reply_markup=owner_keyboard(),
        )


# ------------------------------------------------------------------
# Хендлерлер
# ------------------------------------------------------------------
async def start_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_group_chat(update):
        user = update.effective_user
        if OWNER_ID and user.id == OWNER_ID:
            await update.message.reply_text(
                "👑 Админ панель\n\nБотты осы жерден басқарасыз.",
                reply_markup=owner_keyboard(),
            )
        else:
            await update.message.reply_text(
                "Бұл бот тек топтарда (группада) жұмыс істейді. "
                "Мені топқа қосып, сол жерден пайдаланыңыз 👥"
            )
        return
    await update.message.reply_text(
        "Сәлем! Мен топтағы жазылған сөздерді жинап, содан жаңа сөйлемдер "
        "құрастыратын ботпын.\n\n"
        "Командалар:\n"
        "/generate — жиналған сөздерден жаңа сөйлем жасау\n"
        "/stats — қанша хабарлама жиналғанын көрсету\n"
        "/settings — топ баптаулары (тек әкімшілерге)"
    )


async def stats_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_group_chat(update):
        return
    n = await count_messages(update.effective_chat.id)
    await update.message.reply_text(f"Осы чатта {n} хабарлама жиналды.")


async def generate_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_group_chat(update):
        return
    chat_id = update.effective_chat.id
    if await count_messages(chat_id) < MIN_WORDS_FOR_GENERATION:
        await update.message.reply_text(
            f"Әзірге жеткілікті мәлімет жиналмады "
            f"(кемінде {MIN_WORDS_FOR_GENERATION} хабарлама керек)."
        )
        return
    await context.bot.send_chat_action(chat_id=chat_id, action=ChatAction.TYPING)
    reply = await generate_reply(chat_id)
    if reply:
        await update.message.reply_text(reply)
    else:
        await update.message.reply_text("Әзірге сөйлем құрастыра алмадым 🤔")


async def welcome_new_member(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_group_chat(update) or not update.message.new_chat_members:
        return
    for member in update.message.new_chat_members:
        if member.is_bot:
            continue
        name = member.first_name or member.username or "қонақ"
        await update.message.reply_text(f"Қош келдің, {name}! 👋 Топқа қош келдіңіз.")


async def on_bot_membership_change(update: Update, context: ContextTypes.DEFAULT_TYPE):
    result = update.my_chat_member
    if not result:
        return
    chat = result.chat
    if chat.type not in ("group", "supergroup"):
        return
    if result.new_chat_member.status in ("member", "administrator"):
        await upsert_group(chat.id, chat.title or "")


async def on_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.text:
        return
    if not is_group_chat(update):
        return

    text = update.message.text
    chat_id = update.effective_chat.id
    user = update.effective_user

    # Әкімші "Арна/топ орнату" батырмасын басып, жаңа мәнді осы хабарламамен
    # жіберіп жатса — оны баптау ретінде сақтап, қалыпты өңдеуді өткіземіз.
    if context.chat_data.get("awaiting_forcesub_target") == user.id:
        target = text.strip()
        if not (target.startswith("@") or target.lstrip("-").isdigit()):
            await update.message.reply_text("Дұрыс емес пішін. @username түрінде жіберіңіз.")
            return
        await upsert_settings(chat_id, force_sub_target=target)
        context.chat_data.pop("awaiting_forcesub_target", None)
        await update.message.reply_text(f"Сақталды: {target} ✅. Енді /settings арқылы қосыңыз.")
        return

    settings = await get_settings(chat_id)

    # Сілтемелерді авто-өшіру
    if settings.get("delete_links") and contains_link(text):
        try:
            await update.message.delete()
        except Exception as e:
            logger.warning("Link message delete failed: %s", e)
        return

    # Міндетті жазылым
    if settings.get("force_sub_enabled") and settings.get("force_sub_target"):
        target = settings["force_sub_target"]
        if not await is_subscribed(context, target, user.id):
            try:
                await update.message.delete()
            except Exception as e:
                logger.warning("Force-sub message delete failed: %s", e)
            buttons = []
            if target.startswith("@"):
                buttons.append([InlineKeyboardButton("📢 Қосылу", url=f"https://t.me/{target.lstrip('@')}")])
            buttons.append([InlineKeyboardButton("✅ Тексеру", callback_data=f"checksub:{chat_id}")])
            mention = f"@{user.username}" if user.username else user.first_name
            await context.bot.send_message(
                chat_id=chat_id,
                text=f"{mention}, топта жазу үшін алдымен арнаға/топқа қосылыңыз.",
                reply_markup=InlineKeyboardMarkup(buttons),
            )
            return

    if not is_junk(text):
        await save_message(chat_id, clean_text(text))

    trigger_reply = find_trigger_reply(text)
    if trigger_reply:
        await update.message.reply_text(trigger_reply)
        return

    if random.random() < RANDOM_REPLY_CHANCE:
        if await count_messages(chat_id) >= MIN_WORDS_FOR_GENERATION:
            reply = await generate_reply(chat_id)
            if reply:
                await update.message.reply_text(reply)


# ------------------------------------------------------------------
# Іске қосу
# ------------------------------------------------------------------
def main():
    app: Application = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start_cmd))
    app.add_handler(CommandHandler("stats", stats_cmd))
    app.add_handler(CommandHandler("generate", generate_cmd))
    app.add_handler(CommandHandler("settings", settings_cmd))
    app.add_handler(CallbackQueryHandler(settings_callback, pattern=r"^set:"))
    app.add_handler(CallbackQueryHandler(checksub_callback, pattern=r"^checksub:"))
    app.add_handler(CallbackQueryHandler(owner_callback, pattern=r"^owner:"))
    app.add_handler(ChatMemberHandler(on_bot_membership_change, ChatMemberHandler.MY_CHAT_MEMBER))
    app.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, welcome_new_member))
    app.add_handler(MessageHandler(filters.TEXT, on_message))

    if WEBHOOK_URL:
        logger.info("Starting in webhook mode on port %s", PORT)
        app.run_webhook(
            listen="0.0.0.0",
            port=PORT,
            url_path=BOT_TOKEN,
            webhook_url=f"{WEBHOOK_URL}/{BOT_TOKEN}",
        )
    else:
        logger.info("Starting in polling mode (local test)")
        app.run_polling()


if __name__ == "__main__":
    main()
