import os
import re
import logging
import random

import httpx
import markovify
from telegram import Update
from telegram.constants import ChatAction
from telegram.ext import (
    Application,
    ApplicationBuilder,
    ContextTypes,
    MessageHandler,
    CommandHandler,
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
WEBHOOK_URL = os.environ.get("WEBHOOK_URL")  # мыс: https://your-app.onrender.com
PORT = int(os.environ.get("PORT", 10000))

RANDOM_REPLY_CHANCE = float(os.environ.get("RANDOM_REPLY_CHANCE", "0.05"))
MIN_WORDS_FOR_GENERATION = 30

# ------------------------------------------------------------------
# Триггер сөздер — хабарламада осы сөздердің бірі кездессе, бот
# автоматты жауап қайтарады. Керек болса осы сөздікке өзіңіз
# қосымша жол қосыңыз ("кілт сөз": "жауап").
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

# Supabase
SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
TABLE = "chatbot_messages"
REST_URL = f"{SUPABASE_URL}/rest/v1/{TABLE}"
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# ------------------------------------------------------------------
# Дерекқор (Supabase REST / PostgREST арқылы)
# ------------------------------------------------------------------
async def save_message(chat_id: int, text: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            REST_URL,
            headers={**SUPABASE_HEADERS, "Prefer": "return=minimal"},
            json={"chat_id": chat_id, "text": text},
            timeout=10,
        )
        if resp.status_code >= 300:
            logger.warning("Supabase insert failed: %s %s", resp.status_code, resp.text)


async def get_all_text(chat_id: int) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            REST_URL,
            headers=SUPABASE_HEADERS,
            params={"chat_id": f"eq.{chat_id}", "select": "text"},
            timeout=10,
        )
        resp.raise_for_status()
        rows = resp.json()
        return "\n".join(r["text"] for r in rows)


async def count_messages(chat_id: int) -> int:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            REST_URL,
            headers={**SUPABASE_HEADERS, "Prefer": "count=exact"},
            params={"chat_id": f"eq.{chat_id}", "select": "id"},
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


# ------------------------------------------------------------------
# Хендлерлер
# ------------------------------------------------------------------
async def start_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not is_group_chat(update):
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
        "/stats — қанша хабарлама жиналғанын көрсету"
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


async def on_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.text:
        return
    if not is_group_chat(update):
        return
    text = update.message.text
    chat_id = update.effective_chat.id

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
