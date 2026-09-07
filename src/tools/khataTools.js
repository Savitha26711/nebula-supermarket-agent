const db = require("../database/db");

// Create customer
function createCustomer({ name, phone = null }) {
    if (!name || !name.trim()) {
        throw new Error("Customer name is required.");
    }

    const existing = db.prepare(`
        SELECT *
        FROM customers
        WHERE LOWER(name) = LOWER(?)
    `).get(name.trim());

    if (existing) {
        return {
            success: true,
            customer: existing,
            message: "Customer already exists."
        };
    }

    const result = db.prepare(`
        INSERT INTO customers (name, phone)
        VALUES (?, ?)
    `).run(name.trim(), phone);

    const customer = db.prepare(`
        SELECT *
        FROM customers
        WHERE id = ?
    `).get(result.lastInsertRowid);

    return {
        success: true,
        customer
    };
}


// Get customer
function getCustomer({ name }) {
    const customer = db.prepare(`
        SELECT *
        FROM customers
        WHERE LOWER(name) = LOWER(?)
    `).get(name.trim());

    if (!customer) {
        throw new Error(`Customer "${name}" not found.`);
    }

    return customer;
}


// Add credit
function addCredit({
    customerName,
    amount,
    description = "Credit purchase"
}) {
    if (amount <= 0) {
        throw new Error("Credit amount must be greater than zero.");
    }

    let customer;

    try {
        customer = getCustomer({
            name: customerName
        });
    } catch (error) {
        customer = createCustomer({
            name: customerName
        }).customer;
    }

    db.prepare(`
        INSERT INTO khata_transactions
        (
            customer_id,
            type,
            amount,
            reference
        )
        VALUES (?, 'CREDIT', ?, ?)
    `).run(
        customer.id,
        amount,
        description
    );

    return getKhataBalance({
        customerName
    });
}


// Record payment
function recordPayment({
    customerName,
    amount,
    description = "Khata payment"
}) {
    if (amount <= 0) {
        throw new Error("Payment amount must be greater than zero.");
    }

    const customer = getCustomer({
        name: customerName
    });

    const balance = getKhataBalance({
        customerName
    });

    if (balance.balance <= 0) {
        throw new Error(
            `${customer.name} has no outstanding khata balance.`
        );
    }

    if (amount > balance.balance) {
        throw new Error(
            `Payment ₹${amount} is greater than outstanding balance ₹${balance.balance}.`
        );
    }

    db.prepare(`
        INSERT INTO khata_transactions
        (
            customer_id,
            type,
            amount,
            reference
        )
        VALUES (?, 'PAYMENT', ?, ?)
    `).run(
        customer.id,
        amount,
        description
    );

    return getKhataBalance({
        customerName
    });
}


// Get balance
function getKhataBalance({ customerName }) {
    const customer = getCustomer({
        name: customerName
    });

    const credits = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM khata_transactions
        WHERE customer_id = ?
        AND type = 'CREDIT'
    `).get(customer.id).total;

    const payments = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM khata_transactions
        WHERE customer_id = ?
        AND type = 'PAYMENT'
    `).get(customer.id).total;

    const balance =
        Math.round((credits - payments) * 100) / 100;

    return {
        customerId: customer.id,
        customerName: customer.name,
        totalCredit: credits,
        totalPaid: payments,
        balance
    };
}


// Get transaction history
function getKhataHistory({ customerName }) {
    const customer = getCustomer({
        name: customerName
    });

    return db.prepare(`
        SELECT
            id,
            type,
            amount,
            reference,
            created_at
        FROM khata_transactions
        WHERE customer_id = ?
        ORDER BY id ASC
    `).all(customer.id);
}


module.exports = {
    createCustomer,
    getCustomer,
    addCredit,
    recordPayment,
    getKhataBalance,
    getKhataHistory
};