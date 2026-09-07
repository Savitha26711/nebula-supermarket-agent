const db = require("../database/db");

const {
    getProduct,
    sellStock
} = require("./inventoryTools");

try {
    console.log("🔎 Current product:");

    const product = getProduct("Maggi");

    console.log(product);

    console.log("\n🛒 Trying to sell 100 Maggi...");

    const result = sellStock({
        productId: product.id,
        quantity: 100
    });

    console.log(result);

} catch (error) {

    console.error("\n❌ Error:", error.message);

} finally {

    db.close();
}