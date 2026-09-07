const {
    createDraftBill,
    addItemToBill,
    getBill,
    finalizeBill
} = require("./billingTools");

const { getProduct } = require("./inventoryTools");

try {
    console.log("\n🧾 Creating draft bill...");

    const bill = createDraftBill();

    console.log("Draft bill:", bill);

    const product = getProduct("Maggi 70g");

    console.log("\n📦 Product before billing:");
    console.log(product);

    console.log("\n➕ Adding 2 Maggi...");

    addItemToBill({
        billId: bill.billId,
        productId: product.id,
        quantity: 2
    });

    console.log("\n📋 Draft bill:");
    console.log(getBill(bill.billId));

    const beforeFinalize = getProduct("Maggi 70g");

    console.log("\n📦 Stock before finalize:");
    console.log(beforeFinalize.quantity);

    console.log("\n💰 Finalizing bill...");

    const finalized = finalizeBill({
        billId: bill.billId,
        paymentMode: "UPI",
        paymentReference: "UPI-TEST-001"
    });

    console.log("\n✅ FINALIZED BILL:");
    console.dir(finalized, { depth: null });

    const afterFinalize = getProduct("Maggi 70g");

    console.log("\n📦 Stock after finalize:");
    console.log(afterFinalize.quantity);

    console.log("\n🔁 Trying to finalize same bill again...");

    try {

        finalizeBill({
            billId: bill.billId,
            paymentMode: "UPI",
            paymentReference: "UPI-TEST-001"
        });

    } catch (error) {

        console.log("✅ Second finalize blocked:");
        console.log(error.message);

    }

} catch (error) {

    console.error("\n❌ Test failed:");
    console.error(error.message);

}