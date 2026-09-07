const { generateInvoice } = require("../services/invoiceService");

async function test() {
    try {
        console.log("🧾 Generating invoice...");

        const result = await generateInvoice(8);

        console.log("✅ Invoice generated:");
        console.log(result);

    } catch (error) {
        console.error("❌ Invoice generation failed:");
        console.error(error.message);
    }
}

test();