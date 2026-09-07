const tools = require("./tools");

async function test() {
    try {

        console.log("🔧 Testing agent tool registry...\n");

        console.log("1️⃣ Get product:");
        const product = await tools.get_product({
            name: "Maggi"
        });
        console.log(product);

        console.log("\n2️⃣ Get low stock:");
        const lowStock = await tools.get_low_stock();
        console.log(lowStock);

        console.log("\n3️⃣ Create draft bill:");
        const bill = await tools.create_draft_bill();
        console.log(bill);

        console.log("\n✅ Agent tools are working.");

    } catch (error) {
        console.error("\n❌ Tool test failed:");
        console.error(error.message);
    }
}

test();