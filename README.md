# 🤖 Nebula Supermarket Agent

An AI-powered supermarket management agent that automates **inventory, billing, GST calculation, customer Khata, invoices, sales reports, and Telegram-based operations** using an LLM-driven tool-calling architecture.

## 🚀 Overview

Nebula Supermarket Agent is designed to simplify day-to-day supermarket operations through a conversational AI interface.

Instead of manually performing database operations, the user can interact with the agent through Telegram using natural-language commands such as:

* Create a bill
* Add a Maggi
* Show the bill
* Finalize the bill with UPI
* Show low stock products
* Check balance

The AI agent identifies the user's request and invokes the appropriate backend tool to perform the operation safely.

## ✨ Key Features

* 🧾 **Billing Management**

  * Create draft bills
  * Add and remove products
  * View bill details
  * Finalize bills
  * Support payment modes such as UPI

* 📦 **Inventory Management**

  * Add products
  * Check product details
  * Receive stock
  * Sell stock
  * Monitor low-stock products
  * Automatically deduct stock after bill finalization

* 🧮 **GST Calculation**

  * Automatic GST calculation
  * CGST and SGST calculation
  * Accurate subtotal and final total

* 👥 **Customer & Khata Management**

  * Create customers
  * Record credit transactions
  * Record payments
  * Check customer balances
  * View Khata transaction history

* 🤖 **AI Agent**

  * Natural-language interaction
  * LLM-based tool calling
  * Multi-step task execution
  * Context-aware active bill handling

* 📱 **Telegram Integration**

  * Conversational supermarket operations
  * Multi-turn billing workflow
  * Per-user active bill sessions

* 📄 **Invoice Generation**

  * Generate PDF invoices for finalized bills

* 📊 **Sales Reporting**

  * Generate sales analysis reports
  * Export reports as PowerPoint presentations

* ⚙️ **Preferences**

  * Save and retrieve user preferences

## 🏗️ System Architecture


                    User
                      │
                      ▼
               Telegram Bot
                      │
                      ▼
                Gemini LLM
                      │
                      ▼
              Tool Calling Layer
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    Inventory       Billing       Khata
     Tools          Tools         Tools
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                SQLite Database
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Invoice      Reports     Response
          │           │           │
          └───────────┴───────────┘
                      ▼
                Telegram User


## 🔄 Working Flow

### Example: Creating and Finalizing a Bill


User: Create a bill
        ↓
Create Draft Bill
        ↓
User: Add a Maggi
        ↓
Find Product
        ↓
Add Product to Bill
        ↓
Calculate Subtotal + GST
        ↓
User: Finalize the bill with UPI
        ↓
Validate Stock
        ↓
Finalize Bill
        ↓
Deduct Stock
        ↓
Update Payment Status
        ↓
Clear Active Bill Session
        ↓
Send Final Bill Details to User


### Example Result


Subtotal: ₹14.00
GST:      ₹1.68
Total:    ₹15.68
Payment:  UPI
Status:   FINALIZED


## 🛠️ Technology Stack

| Technology   | Purpose                  |
| ------------ | ------------------------ |
| Node.js      | Backend runtime          |
| JavaScript   | Application development  |
| Gemini       | LLM / AI agent           |
| AI SDK       | LLM tool calling         |
| Zod          | Tool input validation    |
| SQLite       | Database                 |
| Telegraf     | Telegram Bot integration |
| PDFKit       | PDF invoice generation   |
| PptxGenJS    | Sales report generation  |
| Git & GitHub | Version control          |

## 📁 Project Structure


                 ┌──────────────────────────┐
                 │  🤖 Nebula Supermarket   │
                 │          Agent           │
                 └────────────┬─────────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
       ┌──────────┐     ┌──────────┐     ┌──────────┐
       │  Agent   │     │ Telegram │     │ Database │
       │          │     │   Bot    │     │  SQLite  │
       └────┬─────┘     └──────────┘     └────┬─────┘
            │                                  │
     ┌──────┴──────┐                    ┌──────┴──────┐
     ▼             ▼                    ▼             ▼
    llmAgent.js   tools.js              bills        products
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                    Inventory      Khata        GST/Billing

## ⚙️ Installation

Clone the repository:


git clone https://github.com/Savitha26711/nebula-supermarket-agent.git
cd nebula-supermarket-agent


Install dependencies:

bash
npm install


Create a .env file and configure the required API and Telegram credentials.

> Never commit .env or API keys to GitHub.

## ▶️ Running the Application

Start the Telegram agent:

bash
node src/bot/test-bot.js


The bot can then process supermarket operations through Telegram.

## 🧪 Testing

Individual modules can be tested using the test files available under:
text
src/tools/
src/services/
src/database/
src/agent/


The project was tested across database, inventory, billing, GST, Khata, invoice generation, report generation, LLM tool calling, and Telegram multi-turn workflows.

## 🔐 Security

Sensitive configuration such as API keys and Telegram bot tokens is stored in .env and excluded from version control using .gitignore.


