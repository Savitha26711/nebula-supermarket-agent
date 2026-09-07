
require("dotenv").config();

const {
  generateText,
  tool,
  stepCountIs,
} = require("ai");

const { google } = require("@ai-sdk/google");
const { z } = require("zod");

const agentTools = require("./tools");

/**
 * Clean tool results before returning them.
 */
function cleanResult(result) {
  if (result === undefined || result === null) {
    return null;
  }

  if (typeof result === "string") {
    return result;
  }

  return result;
}

/**
 * Main LLM Agent.
 *
 * @param {Object} params
 * @param {string|number} params.userId
 * @param {string} params.message
 * @param {Object} params.session
 */
async function runAgent({
  userId,
  message,
  session = {},
}) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is missing in .env"
    );
  }

  if (!message || !message.trim()) {
    return {
      text: "Please enter a message.",
      session,
    };
  }

  // =========================================================
  // SESSION
  // =========================================================

  const currentBillId =
    session.currentBillId || null;

  // =========================================================
  // SYSTEM PROMPT
  // =========================================================

  const systemPrompt = `
You are a supermarket / kirana store assistant.

You operate through Telegram and help the shopkeeper with:

1. Inventory management
2. Stock receiving
3. Stock selling
4. Billing
5. GST calculations
6. Customer management
7. Khata / credit management
8. Invoice generation
9. Reports
10. Persistent preferences / memory

IMPORTANT RULES:

1. Always use tools for database operations.

2. Never invent product names, prices, stock quantities,
   customers, bills, balances, or transaction results.

3. When the user asks about inventory, use the inventory tools.

4. When the user asks to add stock, use receive_stock.

5. When receiving stock, if costPrice or mrp are not provided,
   use the existing product information when the tool supports it.
   Do not invent prices.

6. Never allow stock to become negative.

7. Never bypass the stock validation.

8. For billing, create a draft bill first if there is no active bill.

9. If there is already an active bill, continue using that bill.

10. Add products to the draft bill using add_item_to_bill.

11. Do not finalize a bill unless the user clearly asks to
    finalize, complete, confirm, close, or checkout the bill.

12. "Show bill", "view bill", "check bill", or similar requests
    must NOT finalize the bill.

13. Removing an item from a draft bill must use
    remove_item_from_bill.

14. Stock should be decremented only when the bill is finalized.

15. If finalization fails, clearly explain the error.

16. Finalization must not be repeated unnecessarily.

17. After successful finalization, the application will clear
    the active bill from the session.

18. For GST, preserve the values returned by the billing tools.
    Do not manually invent GST amounts.

19. Use Indian Rupees (INR) for prices and amounts.

20. For Khata operations, always use the customer/khata tools.

21. Never invent a customer's balance.

22. For invoice requests, use generate_invoice.

23. For report requests, use generate_report.

24. Never invent saved preferences or memory.

25. When the user asks to remember or save a preference,
    use save_preference.

26. When the user asks about a saved preference,
    use get_preference.

27. When relevant, use saved preferences from get_preferences.

28. Do not save sensitive personal information as preferences.

29. Keep responses clear and concise for a Telegram chat.

30. If a tool returns an error, explain the actual error
    clearly instead of pretending the operation succeeded.

31. Ask for missing information when it is genuinely required.

32. Do not perform destructive or financial actions unless
    the user's request clearly indicates the action.

33. Current active bill ID:
    ${currentBillId || "NONE"}

34. Current user ID:
    ${String(userId)}
`;

  // =========================================================
  // AI TOOLS
  // =========================================================

  const tools = {

    // =======================================================
    // INVENTORY
    // =======================================================

    add_product: tool({
      description:
        "Add a new product to supermarket inventory.",

      inputSchema: z.object({
        name: z.string(),
        unit: z.string(),
        costPrice: z.number(),
        sellPrice: z.number(),
        mrp: z.number(),
        gstRate: z.number(),
        hsnCode: z.string(),
        reorderLevel: z.number().optional(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.add_product(args)
        );
      },
    }),

    get_product: tool({
      description:
        "Get a product from inventory by product ID or product name.",

      inputSchema: z.object({
        id: z.number().optional(),
        name: z.string().optional(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.get_product(args)
        );
      },
    }),

    get_all_products: tool({
      description:
        "Get all products in supermarket inventory.",

      inputSchema: z.object({}),

      execute: async () => {
        return cleanResult(
          await agentTools.get_all_products()
        );
      },
    }),

    receive_stock: tool({
      description:
        "Receive/add stock for an existing product. If costPrice or mrp are missing, the inventory tool may use the existing product values.",

      inputSchema: z.object({
        productId: z.number(),
        quantity: z.number().positive(),
        costPrice: z.number().optional(),
        mrp: z.number().optional(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.receive_stock(args)
        );
      },
    }),

    sell_stock: tool({
      description:
        "Sell stock and safely prevent overselling.",

      inputSchema: z.object({
        productId: z.number(),
        quantity: z.number().positive(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.sell_stock(args)
        );
      },
    }),

    get_low_stock: tool({
      description:
        "Get products whose stock is at or below the reorder level.",

      inputSchema: z.object({}),

      execute: async () => {
        return cleanResult(
          await agentTools.get_low_stock()
        );
      },
    }),

    // =======================================================
    // BILLING
    // =======================================================

    create_draft_bill: tool({
      description:
        "Create a new draft bill for the current customer/session.",

      inputSchema: z.object({
        customerName: z.string().optional(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.create_draft_bill(args)
        );
      },
    }),

    add_item_to_bill: tool({
      description:
        "Add a product and quantity to a draft bill.",

      inputSchema: z.object({
        billId: z.number(),
        productId: z.number(),
        quantity: z.number().positive(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.add_item_to_bill(args)
        );
      },
    }),

    remove_item_from_bill: tool({
      description:
        "Remove a product from a draft bill.",

      inputSchema: z.object({
        billId: z.number(),
        productId: z.number(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.remove_item_from_bill(args)
        );
      },
    }),

    get_bill: tool({
      description:
        "Get the complete details of a bill.",

      inputSchema: z.object({
        billId: z.number(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.get_bill(args)
        );
      },
    }),

    finalize_bill: tool({
      description:
        "Finalize a draft bill, calculate totals, update stock, and record payment.",

      inputSchema: z.object({
        billId: z.number(),

        paymentMode: z.enum([
          "CASH",
          "UPI",
          "CARD",
          "CREDIT",
          "PENDING",
        ]),

        paymentReference: z.string().optional(),

        customerName: z.string().optional(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.finalize_bill(args)
        );
      },
    }),

    // =======================================================
    // CUSTOMER / KHATA
    // =======================================================

    create_customer: tool({
      description:
        "Create a new supermarket customer.",

      inputSchema: z.object({
        name: z.string(),
        phone: z.string().optional(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.create_customer(args)
        );
      },
    }),

    get_customer: tool({
      description:
        "Find a customer by ID, name, or phone.",

      inputSchema: z.object({
        id: z.number().optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.get_customer(args)
        );
      },
    }),

    add_khata_credit: tool({
      description:
        "Add a credit/debt transaction to a customer's Khata.",

      inputSchema: z.object({
        customerId: z.number(),
        amount: z.number().positive(),
        description: z.string().optional(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.add_khata_credit(args)
        );
      },
    }),

    record_khata_payment: tool({
      description:
        "Record a payment made by a customer against Khata.",

      inputSchema: z.object({
        customerId: z.number(),
        amount: z.number().positive(),
        description: z.string().optional(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.record_khata_payment(args)
        );
      },
    }),

    get_khata_balance: tool({
      description:
        "Get the current outstanding Khata balance for a customer.",

      inputSchema: z.object({
        customerId: z.number(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.get_khata_balance(args)
        );
      },
    }),

    get_khata_history: tool({
      description:
        "Get the Khata transaction history of a customer.",

      inputSchema: z.object({
        customerId: z.number(),
      }),

      execute: async (args) => {
        return cleanResult(
          await agentTools.get_khata_history(args)
        );
      },
    }),

    // =======================================================
    // PREFERENCES / MEMORY
    // =======================================================

    save_preference: tool({
      description:
        "Save or update a persistent store preference such as preferred language, invoice format, or other non-sensitive preference.",

      inputSchema: z.object({
        key: z.string(),
        value: z.string(),
      }),

      execute: async ({ key, value }) => {
        return cleanResult(
          await agentTools.save_preference({
            key,
            value,
          })
        );
      },
    }),

    get_preference: tool({
      description:
        "Get one saved store preference.",

      inputSchema: z.object({
        key: z.string(),
      }),

      execute: async ({ key }) => {
        return cleanResult(
          await agentTools.get_preference({
            key,
          })
        );
      },
    }),

    get_preferences: tool({
      description:
        "Get all saved store preferences.",

      inputSchema: z.object({}),

      execute: async () => {
        return cleanResult(
          await agentTools.get_preferences()
        );
      },
    }),

    // =======================================================
    // DOCUMENTS
    // =======================================================

    generate_invoice: tool({
      description:
        "Generate a PDF invoice for a finalized bill.",

      inputSchema: z.object({
        billId: z.number(),
      }),

      execute: async ({ billId }) => {
        return cleanResult(
          await agentTools.generate_invoice({
            billId,
          })
        );
      },
    }),

    generate_report: tool({
      description:
        "Generate the supermarket sales analysis PPTX report.",

      inputSchema: z.object({}),

      execute: async () => {
        return cleanResult(
          await agentTools.generate_report()
        );
      },
    }),
  };

  // =========================================================
  // RUN MODEL
  // =========================================================

  console.log("\n==============================");
  console.log("RUNNING LLM AGENT");
  console.log("==============================");
  console.log("User ID:", String(userId));
  console.log("Message:", message);
  console.log("Active Bill:", currentBillId);

  const result = await generateText({
    model: google("gemini-3.5-flash-lite"),

    system: systemPrompt,

    prompt: message,

    tools,

    stopWhen: stepCountIs(5),
  });

  // =========================================================
  // DEBUG
  // =========================================================

  console.log("\nDEBUG RESULT:");
  console.log("Text:", result.text);

  if (result.steps) {
    console.log(
      "Steps:",
      result.steps.length
    );

    for (
      let i = 0;
      i < result.steps.length;
      i++
    ) {
      const step = result.steps[i];

      console.log(
        `Step ${i + 1}:`
      );

      if (step.toolCalls) {
        console.log(
          "Tool Calls:",
          step.toolCalls
        );
      }

      if (step.toolResults) {
        console.log(
          "Tool Results:",
          step.toolResults
        );
      }
    }
  }

  // =========================================================
  // SESSION UPDATE
  // =========================================================

  const updatedSession = {
    ...session,
  };

  if (result.steps) {
    for (const step of result.steps) {
      if (!step.toolResults) {
        continue;
      }

      for (const toolResult of step.toolResults) {

        // ---------------------------------------------------
        // FINALIZED BILL
        // ---------------------------------------------------

        if (
          toolResult.toolName === "finalize_bill"
        ) {
          const output = toolResult.output;

          if (
            output &&
            output.status === "FINALIZED"
          ) {
            updatedSession.currentBillId = null;
          }
        }

        // ---------------------------------------------------
        // NEW DRAFT BILL
        // ---------------------------------------------------

        if (
          toolResult.toolName === "create_draft_bill"
        ) {
          const output = toolResult.output;

          if (
            output &&
            output.billId
          ) {
            updatedSession.currentBillId =
              output.billId;
          }
        }
      }
    }
  }

  // =========================================================
  // FALLBACK
  // =========================================================

  const responseText =
    result.text ||
    "Done. Please check the result.";

  return {
    text: responseText,
    session: updatedSession,
  };
}

module.exports = {
  runAgent,
};

