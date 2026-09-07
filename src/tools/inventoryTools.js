const db = require("../database/db");

// Add a new product
function addProduct({
    name,
    unit,
    costPrice,
    sellPrice,
    mrp,
    gstRate,
    hsnCode,
    reorderLevel = 5
}) {
    if (!name || !unit || !hsnCode) {
        throw new Error("Product name, unit and HSN code are required.");
    }

    if (costPrice < 0 || sellPrice < 0 || mrp < 0) {
        throw new Error("Prices cannot be negative.");
    }

    if (sellPrice < costPrice) {
        throw new Error("Cannot sell a product below its cost price.");
    }

    const existing = db
        .prepare("SELECT id FROM products WHERE name = ?")
        .get(name);

    if (existing) {
        throw new Error(`Product already exists: ${name}`);
    }

    const result = db.prepare(`
        INSERT INTO products
        (name, unit, cost_price, sell_price, mrp, gst_rate, hsn_code, reorder_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        name,
        unit,
        costPrice,
        sellPrice,
        mrp,
        gstRate,
        hsnCode,
        reorderLevel
    );

    return {
        success: true,
        productId: result.lastInsertRowid,
        message: `Product added: ${name}`
    };
}


// Receive stock
// Receive stock
function receiveStock({ productId, quantity }) {
    if (quantity <= 0) {
        throw new Error("Stock quantity must be greater than zero.");
    }

    const result = db.prepare(`
        UPDATE products
        SET quantity = quantity + ?
        WHERE id = ?
    `).run(quantity, productId);

    if (result.changes === 0) {
        throw new Error("Product not found.");
    }

    const product = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(productId);

    return {
        success: true,
        product: product.name,
        addedQuantity: quantity,
        newStock: product.quantity
    };
}



// Get one product
function getProduct(name) {
    return db
        .prepare(`
            SELECT *
            FROM products
            WHERE name LIKE ?
        `)
        .get(`%${name}%`);
}


// Get all products
function getAllProducts() {
    return db
        .prepare(`
            SELECT *
            FROM products
            ORDER BY name
        `)
        .all();
}


// Check low stock
function getLowStock() {
    return db
        .prepare(`
            SELECT *
            FROM products
            WHERE quantity <= reorder_level
            ORDER BY quantity ASC
        `)
        .all();
}

// Sell stock safely
function sellStock({ productId, quantity }) {
    if (quantity <= 0) {
        throw new Error("Sale quantity must be greater than zero.");
    }

    // Atomic update:
    // Stock is reduced ONLY when enough quantity exists.
    const result = db.prepare(`
        UPDATE products
        SET quantity = quantity - ?
        WHERE id = ?
        AND quantity >= ?
    `).run(quantity, productId, quantity);

    if (result.changes === 0) {
        const product = db
            .prepare("SELECT name, quantity FROM products WHERE id = ?")
            .get(productId);

        if (!product) {
            throw new Error("Product not found.");
        }

        throw new Error(
            `Oversell refused. ${product.name} has only ${product.quantity} in stock.`
        );
    }

    const product = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(productId);

    return {
        success: true,
        product: product.name,
        soldQuantity: quantity,
        remainingStock: product.quantity
    };
}

module.exports = {
    addProduct,
    receiveStock,
    sellStock,
    getProduct,
    getAllProducts,
    getLowStock
};