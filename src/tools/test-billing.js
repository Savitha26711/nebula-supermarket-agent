const db = require("../database/db");

const {
    createDraftBill,
    addItemToBill,
    removeItemFromBill,
    getBill,
    finalizeBill
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
        // 8. Create a fresh bill for finalize test
    console.log("\n🧾 Creating bill for finalize test...");

    const finalizeTestBill = createDraftBill();

    addItemToBill({
        billId: finalizeTestBill.billId,
        productId: product.id,
        quantity: 2
    });

    const stockBeforeFinalize = db
        .prepare("SELECT quantity FROM products WHERE id = ?")
        .get(product.id);

    console.log("\n📦 Stock before finalize:");
    console.log(stockBeforeFinalize.quantity);

    // 9. First finalize
    console.log("\n💳 First finalize...");

    const finalized = finalizeBill({
        billId: finalizeTestBill.billId,
        paymentMode: "UPI",
        paymentReference: "TEST-UPI-001"
    });

    console.log(finalized);

    const stockAfterFirstFinalize = db
        .prepare("SELECT quantity FROM products WHERE id = ?")
        .get(product.id);

    console.log("\n📦 Stock after first finalize:");
    console.log(stockAfterFirstFinalize.quantity);

    // 10. Second finalize - should be refused
    console.log("\n🚫 Second finalize attempt...");

    try {
        finalizeBill({
            billId: finalizeTestBill.billId,
            paymentMode: "UPI",
            paymentReference: "TEST-UPI-002"
        });

        console.log("❌ ERROR: Duplicate finalize was accepted!");
    } catch (error) {
        console.log("✅ Duplicate finalize refused:");
        console.log(error.message);
    }

    const stockAfterSecondFinalize = db
        .prepare("SELECT quantity FROM products WHERE id = ?")
        .get(product.id);

    console.log("\n📦 Stock after second finalize:");
    console.log(stockAfterSecondFinalize.quantity);

} catch (error) {

    console.error("\n❌ Error:", error.message);

} finally {

    db.close();
}