require("dotenv").config();

const { Telegraf } = require("telegraf");
const { runAgent } = require("../agent/llmAgent");

// ============================================================
// TELEGRAM BOT
// ============================================================

if (!process.env.TELEGRAM_BOT_TOKEN) {
throw new Error("TELEGRAM_BOT_TOKEN is missing in .env");
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ============================================================
// SESSION STORAGE
// ============================================================

// Keep one session for each Telegram user.
// This allows the agent to remember the current bill.

const sessions = new Map();

function getSession(userId) {


if (!sessions.has(userId)) {
    sessions.set(userId, {
        currentBillId: null
    });
}

return sessions.get(userId);


}

// ============================================================
// /START
// ============================================================

bot.start(async (ctx) => {


await ctx.reply(
    "🤖 Nebula Supermarket Agent is online!\n\n" +
    "You can ask me things like:\n" +
    "• What is the price of Maggi?\n" +
    "• How much Maggi is in stock?\n" +
    "• Show low stock products\n" +
    "• Create a bill\n"
);


});

// ============================================================
// TEXT MESSAGES
// ============================================================

bot.on("text", async (ctx) => {


const message = ctx.message.text;

// Telegram user ID
const userId = String(ctx.from.id);

console.log("\n📩 Telegram message:");
console.log("User:", userId);
console.log("Message:", message);

// Get/create session
const session = getSession(userId);

try {

    // Show typing indicator
    await ctx.sendChatAction("typing");

    // ====================================================
    // RUN NEBULA AGENT
    // ====================================================

    const result = await runAgent({
        userId,
        message,
        session
    });

    // ====================================================
    // IMPORTANT:
    // SAVE UPDATED SESSION
    // ====================================================

    if (result.session) {
        sessions.set(userId, result.session);
    }

    // ====================================================
    // SEND AGENT RESPONSE
    // ====================================================

    await ctx.reply(result.text);

    console.log("🤖 Agent response:");
    console.log(result.text);

    console.log("📌 Session:");
    console.log(sessions.get(userId));

} catch (error) {

    console.error("\n❌ Agent error:");
    console.error(error);

    await ctx.reply(
        "❌ Sorry, I couldn't process that request.\n\n" +
        "Please try again."
    );
}


});

// ============================================================
// ERROR HANDLER
// ============================================================

bot.catch((error, ctx) => {


console.error("❌ Telegram bot error:", error);

ctx.reply(
    "❌ Something went wrong. Please try again."
).catch((replyError) => {
    console.error(
        "❌ Could not send error message:",
        replyError
    );
});


});

// ============================================================
// START BOT
// ============================================================

bot.launch();

console.log(
"🚀 Nebula Supermarket Telegram Agent started!"
);

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.once("SIGINT", () => {


console.log("\n🛑 Stopping Telegram bot...");

bot.stop("SIGINT");


});

process.once("SIGTERM", () => {


console.log("\n🛑 Stopping Telegram bot...");

bot.stop("SIGTERM");


});
