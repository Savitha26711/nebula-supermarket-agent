const db = require("../database/db");

const {
    createDraftBill,
    addItemToBill,
    removeItemFromBill,
    getBill
} = require("./billingTools");

try {
    // 1. Create bill
    const bill = createDraftBill();

    console.log("\n🧾 Draft created:");
    console.log(bill);

    // 2. Find Maggi
    const product = db
        .prepare("SELECT * FROM products WHERE name = ?")
        .get("Maggi 70g");

    // 3. Add 2 Maggi
    console.log("\n➕ Adding 2 Maggi...");

    addItemToBill({
        billId: bill.billId,
        productId: product.id,
        quantity: 2
    });

    console.log(getBill(bill.billId));

    // 4. Check stock
    const stockAfterAdd = db
        .prepare("SELECT quantity FROM products WHERE id = ?")
        .get(product.id);

    console.log("\n📦 Stock while bill is still draft:");
    console.log(stockAfterAdd.quantity);

    // 5. Add 3 more Maggi
    console.log("\n➕ Adding 3 more Maggi...");

    addItemToBill({
        billId: bill.billId,
        productId: product.id,
        quantity: 3
    });

    console.log(getBill(bill.billId));

    // 6. Remove Maggi
    console.log("\n❌ Removing Maggi...");

    removeItemFromBill({
        billId: bill.billId,
        productId: product.id
    });

    console.log(getBill(bill.billId));

    // 7. Check stock again
    const finalStock = db
        .prepare("SELECT quantity FROM products WHERE id = ?")
        .get(product.id);

    console.log("\n📦 Stock after editing draft:");
    console.log(finalStock.quantity);

} catch (error) {

    console.error("\n❌ Error:", error.message);

} finally {

    db.close();
}