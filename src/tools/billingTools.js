const db = require("../database/db");


// Create a draft bill
function createDraftBill() {

    const billNumber =
        "BILL-" +
        Date.now();

    const result = db.prepare(`
        INSERT INTO bills
        (
            bill_number,
            subtotal,
            cgst,
            sgst,
            total_gst,
            total,
            payment_mode,
            status
        )
        VALUES (?, 0, 0, 0, 0, 0, 'PENDING', 'DRAFT')
    `).run(billNumber);

    return {
        billId: result.lastInsertRowid,
        billNumber
    };
}


// Add item to draft bill
function addItemToBill({
    billId,
    productId,
    quantity
}) {

    if (quantity <= 0) {
        throw new Error("Quantity must be greater than zero.");
    }

    const bill = db.prepare(`
        SELECT *
        FROM bills
        WHERE id = ?
        AND status = 'DRAFT'
    `).get(billId);

    if (!bill) {
        throw new Error("Draft bill not found.");
    }

    const product = db.prepare(`
        SELECT *
        FROM products
        WHERE id = ?
    `).get(productId);

    if (!product) {
        throw new Error("Product not found.");
    }

    // Check available stock,
    // BUT DO NOT DECREASE IT YET.
    const existingItem = db.prepare(`
        SELECT quantity
        FROM bill_items
        WHERE bill_id = ?
        AND product_id = ?
    `).get(billId, productId);

    const newQuantity =
        (existingItem ? existingItem.quantity : 0) + quantity;

    if (newQuantity > product.quantity) {
        throw new Error(
            `Not enough stock. ${product.name} has ${product.quantity} available.`
        );
    }

    if (existingItem) {

        db.prepare(`
            UPDATE bill_items
            SET quantity = ?
            WHERE bill_id = ?
            AND product_id = ?
        `).run(
            newQuantity,
            billId,
            productId
        );

    } else {

        db.prepare(`
            INSERT INTO bill_items
            (
                bill_id,
                product_id,
                quantity,
                unit_price,
                gst_rate,
                cgst,
                sgst,
                line_total
            )
            VALUES (?, ?, ?, ?, ?, 0, 0, 0)
        `).run(
            billId,
            productId,
            quantity,
            product.sell_price,
            product.gst_rate
        );
    }

    return getBill(billId);
}


// Remove an item from a draft bill
function removeItemFromBill({
    billId,
    productId
}) {

    const bill = db.prepare(`
        SELECT *
        FROM bills
        WHERE id = ?
        AND status = 'DRAFT'
    `).get(billId);

    if (!bill) {
        throw new Error("Draft bill not found.");
    }

    const result = db.prepare(`
        DELETE FROM bill_items
        WHERE bill_id = ?
        AND product_id = ?
    `).run(
        billId,
        productId
    );

    if (result.changes === 0) {
        throw new Error("Item is not present in this bill.");
    }

    return getBill(billId);
}


// Get current draft bill
function getBill(billId) {

    const bill = db.prepare(`
        SELECT *
        FROM bills
        WHERE id = ?
    `).get(billId);

    if (!bill) {
        throw new Error("Bill not found.");
    }

    const items = db.prepare(`
        SELECT
            bi.*,
            p.name,
            p.unit,
            p.mrp,
            p.hsn_code
        FROM bill_items bi
        JOIN products p
            ON p.id = bi.product_id
        WHERE bi.bill_id = ?
        ORDER BY bi.id
    `).all(billId);

    // Calculate the current draft totals from the actual
    // product price and GST rate.
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    const calculatedItems = items.map(item => {

        const lineSubtotal =
            Number(item.quantity) * Number(item.unit_price);

        const gstAmount =
            lineSubtotal * (Number(item.gst_rate) / 100);

        const cgst =
            Math.round((gstAmount / 2) * 100) / 100;

        const sgst =
            Math.round((gstAmount / 2) * 100) / 100;

        const lineTotal =
            Math.round(
                (lineSubtotal + cgst + sgst) * 100
            ) / 100;

        subtotal += lineSubtotal;
        totalCgst += cgst;
        totalSgst += sgst;

        return {
            ...item,
            calculated_subtotal:
                Math.round(lineSubtotal * 100) / 100,
            calculated_cgst: cgst,
            calculated_sgst: sgst,
            calculated_line_total: lineTotal
        };
    });

    subtotal =
        Math.round(subtotal * 100) / 100;

    totalCgst =
        Math.round(totalCgst * 100) / 100;

    totalSgst =
        Math.round(totalSgst * 100) / 100;

    const totalGst =
        Math.round(
            (totalCgst + totalSgst) * 100
        ) / 100;

    const total =
        Math.round(
            (subtotal + totalGst) * 100
        ) / 100;

    return {
        ...bill,

        // Use calculated values for the draft display.
        subtotal,
        cgst: totalCgst,
        sgst: totalSgst,
        total_gst: totalGst,
        total,

        items: calculatedItems
    };
}
function finalizeBill({ billId, paymentMode, paymentReference = null }) {
    const transaction = db.transaction(() => {

        const bill = db.prepare(`
            SELECT *
            FROM bills
            WHERE id = ?
            AND status = 'DRAFT'
        `).get(billId);

        if (!bill) {
            throw new Error("Draft bill not found or already finalized.");
        }

        const items = db.prepare(`
            SELECT
                bi.*,
                p.name,
                p.quantity AS available_stock,
                p.cost_price,
                p.hsn_code
            FROM bill_items bi
            JOIN products p
                ON p.id = bi.product_id
            WHERE bi.bill_id = ?
        `).all(billId);

        if (items.length === 0) {
            throw new Error("Cannot finalize an empty bill.");
        }

        let subtotal = 0;
        let totalCgst = 0;
        let totalSgst = 0;

        // Calculate GST for every item
        for (const item of items) {

            // Final stock check
            if (item.quantity > item.available_stock) {
                throw new Error(
                    `Oversell refused. ${item.name} has only ${item.available_stock} in stock.`
                );
            }

            // Don't sell below cost
            if (item.unit_price < item.cost_price) {
                throw new Error(
                    `Cannot sell ${item.name} below cost price.`
                );
            }

            const lineSubtotal =
                item.quantity * item.unit_price;

            const gstAmount =
                lineSubtotal * (item.gst_rate / 100);

            const cgst =
                Math.round((gstAmount / 2) * 100) / 100;

            const sgst =
                Math.round((gstAmount / 2) * 100) / 100;

            const lineTotal =
                Math.round(
                    (lineSubtotal + cgst + sgst) * 100
                ) / 100;

            db.prepare(`
                UPDATE bill_items
                SET
                    cgst = ?,
                    sgst = ?,
                    line_total = ?
                WHERE id = ?
            `).run(
                cgst,
                sgst,
                lineTotal,
                item.id
            );

            subtotal += lineSubtotal;
            totalCgst += cgst;
            totalSgst += sgst;
        }

        subtotal =
            Math.round(subtotal * 100) / 100;

        totalCgst =
            Math.round(totalCgst * 100) / 100;

        totalSgst =
            Math.round(totalSgst * 100) / 100;

        const totalGst =
            Math.round(
                (totalCgst + totalSgst) * 100
            ) / 100;

        const total =
            Math.round(
                (subtotal + totalGst) * 100
            ) / 100;

        // Atomic stock decrement
        for (const item of items) {

            const result = db.prepare(`
                UPDATE products
                SET quantity = quantity - ?
                WHERE id = ?
                AND quantity >= ?
            `).run(
                item.quantity,
                item.product_id,
                item.quantity
            );

            if (result.changes !== 1) {
                throw new Error(
                    `Stock changed while finalizing ${item.name}. Please retry.`
                );
            }
        }

        // Finalize bill
        db.prepare(`
            UPDATE bills
            SET
                subtotal = ?,
                cgst = ?,
                sgst = ?,
                total_gst = ?,
                total = ?,
                payment_mode = ?,
                payment_reference = ?,
                status = 'FINALIZED'
            WHERE id = ?
            AND status = 'DRAFT'
        `).run(
            subtotal,
            totalCgst,
            totalSgst,
            totalGst,
            total,
            paymentMode,
            paymentReference,
            billId
        );

        return getBill(billId);
    });

    return transaction();
}


module.exports = {
    createDraftBill,
    addItemToBill,
    removeItemFromBill,
    getBill,
    finalizeBill
};