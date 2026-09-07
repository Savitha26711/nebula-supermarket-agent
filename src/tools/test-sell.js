const db = require("../database/db");

const {
    sellStock,
    getProduct
} = require("./inventoryTools");

try {

    console.log("Current stock:");

    const before = getProduct("Maggi");
    console.log(before.quantity);


    console.log("\n🛒 Selling 10 Maggi...");

    const sale = sellStock({
        productId: before.id,
        quantity: 10
    });

    console.log(sale);


    console.log("\n📦 Stock after sale:");

    const after = getProduct("Maggi");
    console.log(after.quantity);


    console.log("\n🚨 Testing oversell...");

    sellStock({
        productId: before.id,
        quantity: 100
    });

} catch (error) {

    console.error("❌", error.message);

} finally {

    db.close();

}