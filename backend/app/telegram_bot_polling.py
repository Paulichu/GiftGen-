"""
Optional standalone Telegram Bot Polling runner.
Usage:
    python -m app.telegram_bot_polling
"""
import asyncio
import logging
from app.config import settings
from app.services.persistent_agent import run_persistent_agent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("telegram_bot_polling")


async def start_polling():
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN is not set. Polling cannot start.")
        return

    try:
        from telegram import Update
        from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
    except ImportError:
        logger.error("python-telegram-bot is not installed. Install via pip install python-telegram-bot==21.6")
        return

    async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        if update.message:
            await update.message.reply_text(
                "Cześć! Jestem Twoim 24/7 asystentem Emergent Studio. "
                "Możesz zapytać o wolne terminy lub zarezerwować wizytę."
            )

    async def message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not update.message or not update.message.text:
            return
        user_text = update.message.text
        logger.info(f"Received Telegram message: {user_text}")

        reply_text, _ = await run_persistent_agent(user_text)
        await update.message.reply_text(reply_text)

    app = ApplicationBuilder().token(token).build()
    app.add_handler(CommandHandler("start", start_handler))
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), message_handler))

    logger.info("Starting Telegram Bot Polling (24/7)...")
    await app.run_polling()


if __name__ == "__main__":
    asyncio.run(start_polling())
