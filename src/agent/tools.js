const inventoryTools = require("../tools/inventoryTools");
const billingTools = require("../tools/billingTools");
const khataTools = require("../tools/khataTools");
const preferenceTools = require("../tools/preferenceTools");

const {
  generateInvoice,
} = require("../services/invoiceService");

const {
  generateReport,
} = require("../services/reportService");

const agentTools = {
  // =========================================================
  // INVENTORY TOOLS
  // =========================================================

  add_product: async (args) => {
    return inventoryTools.addProduct(args);
  },

  get_product: async (args) => {
    return inventoryTools.getProduct(args);
  },

  get_all_products: async () => {
    return inventoryTools.getAllProducts();
  },

  receive_stock: async (args) => {
    return inventoryTools.receiveStock(args);
  },

  sell_stock: async (args) => {
    return inventoryTools.sellStock(args);
  },

  get_low_stock: async () => {
    return inventoryTools.getLowStock();
  },

  // =========================================================
  // BILLING TOOLS
  // =========================================================

create_draft_bill: async () => {
  return billingTools.createDraftBill();
},

  add_item_to_bill: async (args) => {
    return billingTools.addItemToBill(args);
  },

  remove_item_from_bill: async (args) => {
    return billingTools.removeItemFromBill(args);
  },

 get_bill: async ({ billId }) => {
  return billingTools.getBill(billId);
},

  finalize_bill: async (args) => {
    return billingTools.finalizeBill(args);
  },

  // =========================================================
  // KHATA / CUSTOMER TOOLS
  // =========================================================

  create_customer: async (args) => {
    return khataTools.createCustomer(args);
  },

  get_customer: async (args) => {
    return khataTools.getCustomer(args);
  },

 add_khata_credit: async (args) => {
    return khataTools.addCredit(args);
},

record_khata_payment: async (args) => {
    return khataTools.recordPayment(args);
},

  get_khata_balance: async (args) => {
    return khataTools.getKhataBalance(args);
  },

  get_khata_history: async (args) => {
    return khataTools.getKhataHistory(args);
  },

  // =========================================================
  // PREFERENCE / MEMORY TOOLS
  // =========================================================

  save_preference: async ({ key, value }) => {
    return preferenceTools.savePreference(key, value);
  },

  get_preference: async ({ key }) => {
    return preferenceTools.getPreference(key);
  },

  get_preferences: async () => {
    return preferenceTools.getPreferences();
  },

  // =========================================================
  // DOCUMENT TOOLS
  // =========================================================

  generate_invoice: async (args) => {
    return generateInvoice(args.billId);
  },

  generate_report: async () => {
    return generateReport();
  },
};

module.exports = agentTools;