import os
import re
import sqlite3
import logging
import random

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

# Ботты іске қосу үшін кездейсоқ жауап беру ықтималдығы (0.0 - 1.0)
RANDOM_REPLY_CHANCE = float(os.environ.get("RANDOM_REPLY_CHANCE", "0.05"))

MIN_WORDS_FOR_GENERATION = 30  # генерация жасау үшін минималды жиналған сөз саны

DB_PATH = os.environ.get("DB_PATH", "messages.db")

# ------------------------------------------------------------------
# Дерекқор
# ------------------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            text TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def save_message(chat_id: int, text: str):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO messages (chat_id, text) VALUES (?, ?)", (chat_id, text)
    )
    conn.commit()
    conn.close()


def get_all_text(chat_id: int) -> str:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT text FROM messages WHERE chat_id = ?", (chat_id,))
    rows = cur.fetchall()
    conn.close()
    return "\n".join(r[0] for r in rows)


def count_messages(chat_id: int) -> int:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM messages WHERE chat_id = ?", (chat_id,))
    n = cur.fetchone()[0]
    conn.close()
    return n


# ------------------------------------------------------------------
# Көмекші функциялар
# ------------------------------------------------------------------
def is_junk(text: str) -> bool:
    """Командаларды, тым қысқа/тек эмодзи хабарламаларды алып тастау."""
    if not text:
        return True
    if text.startswith("/"):
        return True
    if len(text.strip()) < 2:
        return True
    return False


def clean_text(text: str) -> str:
    # url-дерді алып тастау
    text = re.sub(r"http\S+|www\.\S+", "", text)
    return text.strip()


def generate_reply(chat_id: int) -> str | None:
    corpus = get_all_text(chat_id)
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
    await update.message.reply_text(
        "Сәлем! Мен топтағы жазылған сөздерді жинап, содан жаңа сөйлемдер "
        "құрастыратын ботпын.\n\n"
        "Командалар:\n"
        "/generate — жиналған сөздерден жаңа сөйлем жасау\n"
        "/stats — қанша хабарлама жиналғанын көрсету"
    )


async def stats_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    n = count_messages(update.effective_chat.id)
    await update.message.reply_text(f"Осы чатта {n} хабарлама жиналды.")


async def generate_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    if count_messages(chat_id) < MIN_WORDS_FOR_GENERATION:
        await update.message.reply_text(
            f"Әзірге жеткілікті мәлімет жиналмады "
            f"(кемінде {MIN_WORDS_FOR_GENERATION} хабарлама керек)."
        )
        return
    await context.bot.send_chat_action(chat_id=chat_id, action=ChatAction.TYPING)
    reply = generate_reply(chat_id)
    if reply:
        await update.message.reply_text(reply)
    else:
        await update.message.reply_text("Әзірге сөйлем құрастыра алмадым 🤔")


async def on_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.text:
        return
    text = update.message.text
    chat_id = update.effective_chat.id

    if not is_junk(text):
        save_message(chat_id, clean_text(text))

    # кейде өзі де кездейсоқ ретте жауап қайтарады
    if random.random() < RANDOM_REPLY_CHANCE:
        if count_messages(chat_id) >= MIN_WORDS_FOR_GENERATION:
            reply = generate_reply(chat_id)
            if reply:
                await update.message.reply_text(reply)


# ------------------------------------------------------------------
# Іске қосу
# ------------------------------------------------------------------
def main():
    init_db()

    app: Application = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start_cmd))
    app.add_handler(CommandHandler("stats", stats_cmd))
    app.add_handler(CommandHandler("generate", generate_cmd))
    app.add_handler(MessageHandler(filters.TEXT, on_message))

    if WEBHOOK_URL:
        # Render (Web Service) үшін webhook режимі
        logger.info("Starting in webhook mode on port %s", PORT)
        app.run_webhook(
            listen="0.0.0.0",
            port=PORT,
            url_path=BOT_TOKEN,
            webhook_url=f"{WEBHOOK_URL}/{BOT_TOKEN}",
        )
    else:
        # Локалда тестілеу үшін polling режимі
        logger.info("Starting in polling mode (local test)")
        app.run_polling()


if __name__ == "__main__":
    main()
