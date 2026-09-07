const { SupermarketAgent } = require("./agent");

async function test() {

    const agent = new SupermarketAgent();

    console.log("\n🤖 NEBULA AGENT TEST\n");

    let result;

    result = await agent.handleMessage(
        "test-user",
        "price Maggi"
    );

    console.log("\n🤖 RESPONSE:");
    console.log(result.response);

    result = await agent.handleMessage(
        "test-user",
        "new bill"
    );

    console.log("\n🤖 RESPONSE:");
    console.log(result.response);

    result = await agent.handleMessage(
        "test-user",
        "add 2 Maggi"
    );

    console.log("\n🤖 RESPONSE:");
    console.log(result.response);

    result = await agent.handleMessage(
        "test-user",
        "show bill"
    );

    console.log("\n🤖 RESPONSE:");
    console.log(result.response);

    result = await agent.handleMessage(
        "test-user",
        "low stock"
    );

    console.log("\n🤖 RESPONSE:");
    console.log(result.response);
}

test();