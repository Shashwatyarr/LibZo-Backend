const { Bot } = require("grammy");
const User = require("../models/User");

const bot = new Bot(process.env.AUTH_BOT_TOKEN);

// ───── LINKING ─────
bot.command("start", async (ctx) => {
  const libzoUsername = ctx.match?.trim();

  if (!libzoUsername) {
    return ctx.reply(
      "Please open Telegram from LIBZO app to connect your account.",
    );
  }

  const chatId = ctx.chat.id;

  const telegramUsername = ctx.from.username || null;

  // 👉 LIBZO account me telegram data save
  await User.updateOne(
    { username: libzoUsername },
    {
      telegram: {
        chatId: chatId.toString(),
        telegramUsername: telegramUsername,
        linkedAt: new Date(),
      },
    },
  );

  await ctx.reply(
    `✅ LIBZO Connected!

LIBZO Account: ${libzoUsername}
Telegram: @${telegramUsername || "private"}

Now OTP will arrive here automatically.`,
  );
});

bot.start();

// ───── OTP SENDER ─────

exports.sendOtpTelegram = async (libzoUsername, otp) => {
  const user = await User.findOne({ username: libzoUsername });

  if (!user?.telegram?.chatId) {
    throw new Error("Telegram not connected with this LIBZO account");
  }

  await bot.api.sendMessage(
    user.telegram.chatId,
    `🔐 LIBZO OTP

Code: ${otp}

Valid for 5 minutes.
Do NOT share with anyone.`,
  );
};

bot.command("start", async (ctx) => {
  const libzoUsername = ctx.match?.trim();

  const chatId = ctx.chat.id;

  await User.updateOne(
    { username: libzoUsername },
    {
      "telegram.chatId": chatId.toString(),
      "telegram.linkedAt": new Date(),
    },
  );

  await ctx.reply("Connected! Ab OTP yahin aayega.");
});
