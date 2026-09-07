require("dotenv").config();

const { runAgent } = require("./llmAgent");

async function main() {
  console.log("🤖 Testing multi-turn LLM supermarket agent...\n");

  let session = {};

  const messages = [
    "Create a bill",
    "Add 2 Maggi",
    "Show the bill",
    "Finalize the bill with UPI",
  ];

  for (const message of messages) {
    console.log("\n================================");
    console.log("👤 USER:", message);
    console.log("================================");

    try {
      const result = await runAgent({
        userId: "test-user",
        message,
        session,
      });

      console.log("\n🤖 AGENT:");
      console.log(result.text);

      session = result.session;

      console.log("\n📌 SESSION:");
      console.log(session);
    } catch (error) {
      console.error("\n❌ ERROR:");
      console.error(error.message);
      break;
    }
  }
}

main();