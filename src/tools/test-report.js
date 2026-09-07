const { generateReport } = require("../services/reportService");

async function test() {
    try {
        console.log("📊 Generating supermarket analysis report...");

        const result = await generateReport();

        console.log("✅ PPTX report generated:");
        console.log(result);
    } catch (error) {
        console.error("❌ Report generation failed:");
        console.error(error.message);
    }
}

test();