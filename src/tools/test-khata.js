const db = require("../database/db");

const {
    createCustomer,
    addCredit,
    recordPayment,
    getKhataBalance,
    getKhataHistory
} = require("./khataTools");

try {

    console.log("\n👤 Creating Ramesh...");

    console.log(
        createCustomer({
            name: "Ramesh"
        })
    );


    console.log("\n💰 Adding ₹500 credit...");

    console.log(
        addCredit({
            customerName: "Ramesh",
            amount: 500,
            description: "Grocery credit"
        })
    );


    console.log("\n💳 Ramesh pays ₹300...");

    console.log(
        recordPayment({
            customerName: "Ramesh",
            amount: 300,
            description: "Cash payment"
        })
    );


    console.log("\n📊 Ramesh balance...");

    console.log(
        getKhataBalance({
            customerName: "Ramesh"
        })
    );


    console.log("\n📜 Khata history...");

    console.dir(
        getKhataHistory({
            customerName: "Ramesh"
        }),
        { depth: null }
    );

} catch (error) {

    console.error("\n❌ Error:");
    console.error(error.message);

} finally {

    db.close();

}