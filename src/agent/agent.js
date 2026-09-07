const inventoryTools = require("../tools/inventoryTools");
const billingTools = require("../tools/billingTools");
const khataTools = require("../tools/khataTools");
const preferenceTools = require("../tools/preferenceTools");

const {
    generateInvoice
} = require("../services/invoiceService");

const {
    generateReport
} = require("../services/reportService");


const tools = {

    // =========================================================
    // INVENTORY
    // =========================================================

    add_product: async ({
        name,
        unit,
        costPrice,
        sellPrice,
        mrp,
        gstRate,
        hsnCode,
        reorderLevel
    }) => {

        return inventoryTools.addProduct({
            name,
            unit,
            costPrice,
            sellPrice,
            mrp,
            gstRate,
            hsnCode,
            reorderLevel
        });
    },


    get_product: async ({ name }) => {

        const product = inventoryTools.getProduct(name);

        if (!product) {
            throw new Error(`Product "${name}" not found.`);
        }

        return product;
    },


    get_all_products: async () => {

        return inventoryTools.getAllProducts();
    },


    receive_stock: async ({
        productId,
        quantity,
        costPrice,
        mrp
    }) => {

        return inventoryTools.receiveStock({
            productId,
            quantity,
            costPrice,
            mrp
        });
    },


    sell_stock: async ({
        productId,
        quantity
    }) => {

        return inventoryTools.sellStock({
            productId,
            quantity
        });
    },


    get_low_stock: async () => {

        return inventoryTools.getLowStock();
    },


    // =========================================================
    // BILLING
    // =========================================================

    create_draft_bill: async () => {

        return billingTools.createDraftBill();
    },


    add_item_to_bill: async ({
        billId,
        productId,
        quantity
    }) => {

        return billingTools.addItemToBill({
            billId,
            productId,
            quantity
        });
    },


    remove_item_from_bill: async ({
        billId,
        productId
    }) => {

        return billingTools.removeItemFromBill({
            billId,
            productId
        });
    },


    get_bill: async ({ billId }) => {

        return billingTools.getBill(billId);
    },


    finalize_bill: async ({
        billId,
        paymentMode,
        paymentReference
    }) => {

        return billingTools.finalizeBill({
            billId,
            paymentMode,
            paymentReference
        });
    },


    // =========================================================
    // KHATA
    // =========================================================

    create_customer: async ({
        name,
        phone
    }) => {

        return khataTools.createCustomer({
            name,
            phone
        });
    },


    get_customer: async ({ name }) => {

        return khataTools.getCustomer({
            name
        });
    },


    add_khata_credit: async ({
        customerName,
        amount,
        description
    }) => {

        return khataTools.addCredit({
            customerName,
            amount,
            description
        });
    },


    record_khata_payment: async ({
        customerName,
        amount,
        description
    }) => {

        return khataTools.recordPayment({
            customerName,
            amount,
            description
        });
    },


    get_khata_balance: async ({
        customerName
    }) => {

        return khataTools.getKhataBalance({
            customerName
        });
    },


    get_khata_history: async ({
        customerName
    }) => {

        return khataTools.getKhataHistory({
            customerName
        });
    },


    // =========================================================
    // PREFERENCES / MEMORY
    // =========================================================

    save_preference: async ({
        key,
        value
    }) => {

        return preferenceTools.savePreference(
            key,
            value
        );
    },


    get_preference: async ({
        key
    }) => {

        return preferenceTools.getPreference(
            key
        );
    },


    get_preferences: async () => {

        return preferenceTools.getPreferences();
    },


    // =========================================================
    // DOCUMENT GENERATION
    // =========================================================

    generate_invoice: async ({
        billId
    }) => {

        return generateInvoice(billId);
    },


    generate_report: async () => {

        return generateReport();
    }

};


module.exports = tools;