const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");
const db = require("../database/db");

const REPORT_DIR = path.join(__dirname, "../../generated/reports");

function ensureReportDirectory() {
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
}

function formatMoney(value) {
    return Number(value || 0).toFixed(2);
}

function generateReport() {
    ensureReportDirectory();

    // =========================================================
    // 1. SALES SUMMARY
    // =========================================================

    const sales = db.prepare(`
        SELECT
            COUNT(*) AS total_bills,
            COALESCE(SUM(subtotal), 0) AS subtotal,
            COALESCE(SUM(cgst), 0) AS cgst,
            COALESCE(SUM(sgst), 0) AS sgst,
            COALESCE(SUM(total_gst), 0) AS total_gst,
            COALESCE(SUM(total), 0) AS total_sales
        FROM bills
        WHERE status = 'FINALIZED'
    `).get();

    // =========================================================
    // 2. TOP SELLING PRODUCTS
    // =========================================================

    const topProducts = db.prepare(`
        SELECT
            p.name,
            SUM(bi.quantity) AS quantity_sold,
            SUM(bi.line_total) AS revenue
        FROM bill_items bi
        JOIN bills b
            ON b.id = bi.bill_id
        JOIN products p
            ON p.id = bi.product_id
        WHERE b.status = 'FINALIZED'
        GROUP BY bi.product_id
        ORDER BY quantity_sold DESC
        LIMIT 10
    `).all();

    // =========================================================
    // 3. INVENTORY
    // =========================================================

    // NOTE:
    // Your products table uses "quantity", not "stock_quantity".
    const inventory = db.prepare(`
        SELECT
            name,
            unit,
            quantity,
            reorder_level,
            sell_price,
            gst_rate
        FROM products
        ORDER BY quantity ASC
    `).all();

    // Products at or below reorder level
    const lowStock = inventory.filter(
        item =>
            Number(item.quantity) <= Number(item.reorder_level)
    );

    // =========================================================
    // 4. KHATA SUMMARY
    // =========================================================

    const customers = db.prepare(`
        SELECT
            id,
            name,
            phone
        FROM customers
        ORDER BY name
    `).all();

    const khata = customers.map(customer => {
        const row = db.prepare(`
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'CREDIT' THEN amount
                            WHEN type = 'PAYMENT' THEN -amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS balance
            FROM khata_transactions
            WHERE customer_id = ?
        `).get(customer.id);

        return {
            name: customer.name,
            phone: customer.phone,
            balance: Number(row.balance || 0)
        };
    });

    // =========================================================
    // 5. CREATE POWERPOINT
    // =========================================================

    const pptx = new PptxGenJS();

    pptx.layout = "LAYOUT_WIDE";

    pptx.author = "Nebula Supermarket Agent";
    pptx.company = "Nebula Supermarket";
    pptx.subject = "Supermarket Operations Analysis";
    pptx.title = "Nebula Supermarket Operations Report";
    pptx.lang = "en-IN";

    // =========================================================
    // SLIDE 1 - TITLE
    // =========================================================

    let slide = pptx.addSlide();

    slide.addText("NEBULA SUPERMARKET", {
        x: 0.7,
        y: 1.5,
        w: 11,
        h: 0.7,
        fontSize: 28,
        bold: true,
        align: "center"
    });

    slide.addText("Operations & Sales Analysis", {
        x: 1,
        y: 2.35,
        w: 10.3,
        h: 0.5,
        fontSize: 20,
        align: "center"
    });

    slide.addText(
        `Generated: ${new Date().toLocaleString("en-IN")}`,
        {
            x: 2,
            y: 3.15,
            w: 8.3,
            h: 0.4,
            fontSize: 12,
            align: "center"
        }
    );

    // =========================================================
    // SLIDE 2 - SALES OVERVIEW
    // =========================================================

    slide = pptx.addSlide();

    slide.addText("Sales Overview", {
        x: 0.6,
        y: 0.4,
        w: 5,
        h: 0.5,
        fontSize: 24,
        bold: true
    });

    slide.addText(
        `Finalized Bills: ${sales.total_bills}`,
        {
            x: 0.8,
            y: 1.4,
            w: 4,
            h: 0.5,
            fontSize: 18
        }
    );

    slide.addText(
        `Subtotal: ₹${formatMoney(sales.subtotal)}`,
        {
            x: 0.8,
            y: 2.1,
            w: 4,
            h: 0.5,
            fontSize: 18
        }
    );

    slide.addText(
        `CGST: ₹${formatMoney(sales.cgst)}`,
        {
            x: 0.8,
            y: 2.8,
            w: 4,
            h: 0.5,
            fontSize: 18
        }
    );

    slide.addText(
        `SGST: ₹${formatMoney(sales.sgst)}`,
        {
            x: 0.8,
            y: 3.5,
            w: 4,
            h: 0.5,
            fontSize: 18
        }
    );

    slide.addText(
        `Total GST: ₹${formatMoney(sales.total_gst)}`,
        {
            x: 6,
            y: 1.4,
            w: 4,
            h: 0.5,
            fontSize: 18
        }
    );

    slide.addText(
        `TOTAL SALES: ₹${formatMoney(sales.total_sales)}`,
        {
            x: 6,
            y: 2.2,
            w: 5,
            h: 0.7,
            fontSize: 22,
            bold: true
        }
    );

    // =========================================================
    // SLIDE 3 - TOP SELLING PRODUCTS
    // =========================================================

    slide = pptx.addSlide();

    slide.addText("Top Selling Products", {
        x: 0.6,
        y: 0.4,
        w: 6,
        h: 0.5,
        fontSize: 24,
        bold: true
    });

    const productRows = [
        [
            {
                text: "Product",
                options: { bold: true }
            },
            {
                text: "Qty Sold",
                options: { bold: true }
            },
            {
                text: "Revenue",
                options: { bold: true }
            }
        ]
    ];

    for (const product of topProducts) {
        productRows.push([
            product.name,
            String(product.quantity_sold),
            `₹${formatMoney(product.revenue)}`
        ]);
    }

    if (topProducts.length === 0) {
        productRows.push([
            "No sales yet",
            "-",
            "₹0.00"
        ]);
    }

    slide.addTable(productRows, {
        x: 0.7,
        y: 1.2,
        w: 11.2,
        h: 4.8,
        fontSize: 13,
        border: {
            pt: 1,
            color: "888888"
        },
        margin: 0.08
    });

    // =========================================================
    // SLIDE 4 - INVENTORY STATUS
    // =========================================================

    slide = pptx.addSlide();

    slide.addText("Inventory Status", {
        x: 0.6,
        y: 0.4,
        w: 6,
        h: 0.5,
        fontSize: 24,
        bold: true
    });

    slide.addText(
        `Total Products: ${inventory.length}`,
        {
            x: 0.8,
            y: 1.05,
            w: 4,
            h: 0.4,
            fontSize: 16
        }
    );

    slide.addText(
        `Low Stock Products: ${lowStock.length}`,
        {
            x: 5,
            y: 1.05,
            w: 5,
            h: 0.4,
            fontSize: 16,
            bold: true
        }
    );

    const inventoryRows = [
        [
            {
                text: "Product",
                options: { bold: true }
            },
            {
                text: "Unit",
                options: { bold: true }
            },
            {
                text: "Stock",
                options: { bold: true }
            },
            {
                text: "Reorder",
                options: { bold: true }
            },
            {
                text: "Price",
                options: { bold: true }
            }
        ]
    ];

    for (const item of inventory.slice(0, 12)) {
        inventoryRows.push([
            item.name,
            item.unit,
            String(item.quantity),
            String(item.reorder_level),
            `₹${formatMoney(item.sell_price)}`
        ]);
    }

    if (inventory.length === 0) {
        inventoryRows.push([
            "No products",
            "-",
            "0",
            "-",
            "₹0.00"
        ]);
    }

    slide.addTable(inventoryRows, {
        x: 0.6,
        y: 1.6,
        w: 11.6,
        h: 4.8,
        fontSize: 12,
        border: {
            pt: 1,
            color: "888888"
        },
        margin: 0.07
    });

    // =========================================================
    // SLIDE 5 - LOW STOCK ALERTS
    // =========================================================

    slide = pptx.addSlide();

    slide.addText("Low Stock Alerts", {
        x: 0.6,
        y: 0.4,
        w: 6,
        h: 0.5,
        fontSize: 24,
        bold: true
    });

    if (lowStock.length === 0) {

        slide.addText(
            "No products currently require reordering.",
            {
                x: 1,
                y: 2,
                w: 10,
                h: 0.6,
                fontSize: 20,
                align: "center"
            }
        );

    } else {

        const lowStockRows = [
            [
                {
                    text: "Product",
                    options: { bold: true }
                },
                {
                    text: "Current Stock",
                    options: { bold: true }
                },
                {
                    text: "Reorder Level",
                    options: { bold: true }
                }
            ]
        ];

        for (const item of lowStock) {
            lowStockRows.push([
                item.name,
                String(item.quantity),
                String(item.reorder_level)
            ]);
        }

        slide.addTable(lowStockRows, {
            x: 1,
            y: 1.5,
            w: 10,
            fontSize: 14,
            border: {
                pt: 1,
                color: "888888"
            },
            margin: 0.1
        });
    }

    // =========================================================
    // SLIDE 6 - KHATA SUMMARY
    // =========================================================

    slide = pptx.addSlide();

    slide.addText("Customer Khata Summary", {
        x: 0.6,
        y: 0.4,
        w: 7,
        h: 0.5,
        fontSize: 24,
        bold: true
    });

    const khataRows = [
        [
            {
                text: "Customer",
                options: { bold: true }
            },
            {
                text: "Phone",
                options: { bold: true }
            },
            {
                text: "Balance",
                options: { bold: true }
            }
        ]
    ];

    for (const customer of khata) {
        khataRows.push([
            customer.name,
            customer.phone || "-",
            `₹${formatMoney(customer.balance)}`
        ]);
    }

    if (khata.length === 0) {

        slide.addText(
            "No customer khata records found.",
            {
                x: 1,
                y: 2,
                w: 10,
                h: 0.5,
                fontSize: 18,
                align: "center"
            }
        );

    } else {

        slide.addTable(khataRows, {
            x: 0.8,
            y: 1.3,
            w: 10.8,
            h: 4.8,
            fontSize: 13,
            border: {
                pt: 1,
                color: "888888"
            },
            margin: 0.08
        });
    }

    // =========================================================
    // SLIDE 7 - OPERATIONAL INSIGHTS
    // =========================================================

    slide = pptx.addSlide();

    slide.addText("Operational Insights", {
        x: 0.6,
        y: 0.4,
        w: 7,
        h: 0.5,
        fontSize: 24,
        bold: true
    });

    const insights = [
        `• Finalized bills: ${sales.total_bills}`,
        `• Total sales: ₹${formatMoney(sales.total_sales)}`,
        `• Total GST collected: ₹${formatMoney(sales.total_gst)}`,
        `• Products in inventory: ${inventory.length}`,
        `• Products at/below reorder level: ${lowStock.length}`,
        `• Customers with Khata records: ${khata.length}`
    ];

    slide.addText(
        insights.join("\n"),
        {
            x: 0.9,
            y: 1.4,
            w: 10.5,
            h: 3.5,
            fontSize: 18,
            valign: "mid"
        }
    );

    // =========================================================
    // SAVE PPTX
    // =========================================================

    const filePath = path.join(
        REPORT_DIR,
        `supermarket-analysis-${Date.now()}.pptx`
    );

    return pptx.writeFile({
        fileName: filePath
    }).then(() => {

        return {
            success: true,
            filePath,
            totalBills: sales.total_bills,
            totalSales: sales.total_sales,
            totalGST: sales.total_gst,
            lowStockCount: lowStock.length,
            totalProducts: inventory.length,
            totalCustomers: khata.length
        };
    });
}

module.exports = {
    generateReport
};