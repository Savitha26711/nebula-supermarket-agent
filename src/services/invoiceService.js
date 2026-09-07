const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const db = require("../database/db");

const INVOICE_DIR = path.join(__dirname, "../../generated/invoices");

function ensureInvoiceDirectory() {
    if (!fs.existsSync(INVOICE_DIR)) {
        fs.mkdirSync(INVOICE_DIR, { recursive: true });
    }
}

function money(value) {
    return Number(value || 0).toFixed(2);
}

function generateInvoice(billId) {
    ensureInvoiceDirectory();

    // Get finalized bill
    const bill = db.prepare(`
        SELECT *
        FROM bills
        WHERE id = ?
          AND status = 'FINALIZED'
    `).get(billId);

    if (!bill) {
        throw new Error("Finalized bill not found.");
    }

    // Get bill items + product information
    const items = db.prepare(`
        SELECT
            bi.id,
            bi.bill_id,
            bi.product_id,
            bi.quantity,
            bi.unit_price,
            bi.gst_rate,
            bi.cgst,
            bi.sgst,
            bi.line_total,
            p.name,
            p.unit,
            p.hsn_code
        FROM bill_items bi
        JOIN products p ON p.id = bi.product_id
        WHERE bi.bill_id = ?
        ORDER BY bi.id
    `).all(billId);

    if (items.length === 0) {
        throw new Error("Cannot generate invoice: bill has no items.");
    }

    const fileName = `${bill.bill_number}.pdf`;
    const filePath = path.join(INVOICE_DIR, fileName);

    const doc = new PDFDocument({
        size: "A4",
        margin: 40
    });

    const stream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
        stream.on("finish", () => {
            resolve({
                success: true,
                billId: bill.id,
                billNumber: bill.bill_number,
                filePath
            });
        });

        stream.on("error", reject);

        doc.pipe(stream);

        // =========================
        // HEADER
        // =========================

        doc
            .fontSize(22)
            .font("Helvetica-Bold")
            .text("NEBULA SUPERMARKET", { align: "center" });

        doc
            .fontSize(10)
            .font("Helvetica")
            .text("GST TAX INVOICE", { align: "center" });

        doc.moveDown();

        // Horizontal line
        doc
            .moveTo(40, doc.y)
            .lineTo(555, doc.y)
            .stroke();

        doc.moveDown();

        // =========================
        // BILL DETAILS
        // =========================

        const detailsY = doc.y;

        doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Invoice No:", 40, detailsY);

        doc
            .font("Helvetica")
            .text(bill.bill_number, 110, detailsY);

        doc
            .font("Helvetica-Bold")
            .text("Date:", 380, detailsY);

        doc
            .font("Helvetica")
            .text(new Date(bill.created_at).toLocaleString("en-IN"), 415, detailsY);

        doc.moveDown(1.5);

        doc
            .font("Helvetica-Bold")
            .text("Customer:");

        doc
            .font("Helvetica")
            .text(bill.customer_name || "Walk-in Customer");

        doc.moveDown();

        // =========================
        // TABLE HEADER
        // =========================

        const tableTop = doc.y;

        doc.rect(40, tableTop, 515, 25).fill("#eeeeee");

        doc
            .fillColor("black")
            .font("Helvetica-Bold")
            .fontSize(8);

        doc.text("Item", 45, tableTop + 8, { width: 100 });
        doc.text("HSN", 145, tableTop + 8, { width: 60 });
        doc.text("Qty", 205, tableTop + 8, { width: 35 });
        doc.text("Rate", 240, tableTop + 8, { width: 55 });
        doc.text("GST", 295, tableTop + 8, { width: 45 });
        doc.text("CGST", 340, tableTop + 8, { width: 55 });
        doc.text("SGST", 395, tableTop + 8, { width: 55 });
        doc.text("Total", 450, tableTop + 8, { width: 100 });

        // =========================
        // TABLE ROWS
        // =========================

        let y = tableTop + 32;

        doc.font("Helvetica").fontSize(8);

        for (const item of items) {
            const rowHeight = 28;

            doc
                .moveTo(40, y - 5)
                .lineTo(555, y - 5)
                .strokeColor("#cccccc")
                .stroke();

            doc.strokeColor("black");

            doc.text(item.name, 45, y, { width: 95 });
            doc.text(item.hsn_code || "-", 145, y, { width: 55 });
            doc.text(String(item.quantity), 205, y, { width: 30 });
            doc.text(`₹${money(item.unit_price)}`, 240, y, { width: 50 });
            doc.text(`${money(item.gst_rate)}%`, 295, y, { width: 40 });
            doc.text(`₹${money(item.cgst)}`, 340, y, { width: 50 });
            doc.text(`₹${money(item.sgst)}`, 395, y, { width: 50 });
            doc.text(`₹${money(item.line_total)}`, 450, y, { width: 95 });

            y += rowHeight;

            // New page if required
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
        }

        // =========================
        // TOTALS
        // =========================

        y += 10;

        doc
            .moveTo(350, y)
            .lineTo(555, y)
            .stroke();

        y += 15;

        doc
            .font("Helvetica")
            .fontSize(10)
            .text("Subtotal:", 380, y);

        doc
            .text(`₹${money(bill.subtotal)}`, 480, y, {
                width: 70,
                align: "right"
            });

        y += 20;

        doc.text("CGST:", 380, y);

        doc.text(`₹${money(bill.cgst)}`, 480, y, {
            width: 70,
            align: "right"
        });

        y += 20;

        doc.text("SGST:", 380, y);

        doc.text(`₹${money(bill.sgst)}`, 480, y, {
            width: 70,
            align: "right"
        });

        y += 20;

        doc
            .font("Helvetica-Bold")
            .text("Total GST:", 380, y);

        doc.text(`₹${money(bill.total_gst)}`, 480, y, {
            width: 70,
            align: "right"
        });

        y += 25;

        doc
            .fontSize(13)
            .text("GRAND TOTAL:", 360, y);

        doc.text(`₹${money(bill.total)}`, 470, y, {
            width: 80,
            align: "right"
        });

        // =========================
        // PAYMENT DETAILS
        // =========================

        y += 45;

        doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Payment Details", 40, y);

        y += 18;

        doc
            .font("Helvetica")
            .text(
                `Payment Mode: ${bill.payment_mode || "PENDING"}`,
                40,
                y
            );

        y += 15;

        doc.text(
            `Payment Reference: ${bill.payment_reference || "-"}`,
            40,
            y
        );

        // =========================
        // FOOTER
        // =========================

        doc
            .fontSize(9)
            .fillColor("#555555")
            .text(
                "Thank you for shopping with Nebula Supermarket!",
                40,
                760,
                {
                    align: "center",
                    width: 515
                }
            );

        doc.end();
    });
}

module.exports = {
    generateInvoice
};