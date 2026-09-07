\# 🤖 Nebula Supermarket Agent



An AI-powered supermarket management agent that automates \*\*inventory, billing, GST calculation, customer Khata, invoices, sales reports, and Telegram-based operations\*\* using an LLM-driven tool-calling architecture.



\## 🚀 Overview



Nebula Supermarket Agent is designed to simplify day-to-day supermarket operations through a conversational AI interface.



Instead of manually performing database operations, the user can interact with the agent through Telegram using natural-language commands such as:



\* Create a bill

\* Add a Maggi

\* Show the bill

\* Finalize the bill with UPI

\* Show low stock products

\* Check balance



The AI agent identifies the user's request and invokes the appropriate backend tool to perform the operation safely.



\## ✨ Key Features



\* 🧾 \*\*Billing Management\*\*



&#x20; \* Create draft bills

&#x20; \* Add and remove products

&#x20; \* View bill details

&#x20; \* Finalize bills

&#x20; \* Support payment modes such as UPI



\* 📦 \*\*Inventory Management\*\*



&#x20; \* Add products

&#x20; \* Check product details

&#x20; \* Receive stock

&#x20; \* Sell stock

&#x20; \* Monitor low-stock products

&#x20; \* Automatically deduct stock after bill finalization



\* 🧮 \*\*GST Calculation\*\*



&#x20; \* Automatic GST calculation

&#x20; \* CGST and SGST calculation

&#x20; \* Accurate subtotal and final total



\* 👥 \*\*Customer \& Khata Management\*\*



&#x20; \* Create customers

&#x20; \* Record credit transactions

&#x20; \* Record payments

&#x20; \* Check customer balances

&#x20; \* View Khata transaction history



\* 🤖 \*\*AI Agent\*\*



&#x20; \* Natural-language interaction

&#x20; \* LLM-based tool calling

&#x20; \* Multi-step task execution

&#x20; \* Context-aware active bill handling



\* 📱 \*\*Telegram Integration\*\*



&#x20; \* Conversational supermarket operations

&#x20; \* Multi-turn billing workflow

&#x20; \* Per-user active bill sessions



\* 📄 \*\*Invoice Generation\*\*



&#x20; \* Generate PDF invoices for finalized bills



\* 📊 \*\*Sales Reporting\*\*



&#x20; \* Generate sales analysis reports

&#x20; \* Export reports as PowerPoint presentations



\* ⚙️ \*\*Preferences\*\*



&#x20; \* Save and retrieve user preferences



\## 🏗️ System Architecture





&#x20;                   User

&#x20;                     │

&#x20;                     ▼

&#x20;              Telegram Bot

&#x20;                     │

&#x20;                     ▼

&#x20;               Gemini LLM

&#x20;                     │

&#x20;                     ▼

&#x20;             Tool Calling Layer

&#x20;                     │

&#x20;       ┌─────────────┼─────────────┐

&#x20;       ▼             ▼             ▼

&#x20;   Inventory       Billing       Khata

&#x20;    Tools          Tools         Tools

&#x20;       │             │             │

&#x20;       └─────────────┼─────────────┘

&#x20;                     ▼

&#x20;               SQLite Database

&#x20;                     │

&#x20;         ┌───────────┼───────────┐

&#x20;         ▼           ▼           ▼

&#x20;      Invoice      Reports     Response

&#x20;         │           │           │

&#x20;         └───────────┴───────────┘

&#x20;                     ▼

&#x20;               Telegram User





\## 🔄 Working Flow



\### Example: Creating and Finalizing a Bill





User: Create a bill

&#x20;       ↓

Create Draft Bill

&#x20;       ↓

User: Add a Maggi

&#x20;       ↓

Find Product

&#x20;       ↓

Add Product to Bill

&#x20;       ↓

Calculate Subtotal + GST

&#x20;       ↓

User: Finalize the bill with UPI

&#x20;       ↓

Validate Stock

&#x20;       ↓

Finalize Bill

&#x20;       ↓

Deduct Stock

&#x20;       ↓

Update Payment Status

&#x20;       ↓

Clear Active Bill Session

&#x20;       ↓

Send Final Bill Details to User





\### Example Result





Subtotal: ₹14.00

GST:      ₹1.68

Total:    ₹15.68

Payment:  UPI

Status:   FINALIZED





\## 🛠️ Technology Stack



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

| Git \& GitHub | Version control          |



\## 📁 Project Structure





&#x20;                ┌──────────────────────────┐

&#x20;                │  🤖 Nebula Supermarket   │

&#x20;                │          Agent           │

&#x20;                └────────────┬─────────────┘

&#x20;                             │

&#x20;            ┌────────────────┼────────────────┐

&#x20;            │                │                │

&#x20;            ▼                ▼                ▼

&#x20;      ┌──────────┐     ┌──────────┐     ┌──────────┐

&#x20;      │  Agent   │     │ Telegram │     │ Database │

&#x20;      │          │     │   Bot    │     │  SQLite  │

&#x20;      └────┬─────┘     └──────────┘     └────┬─────┘

&#x20;           │                                  │

&#x20;    ┌──────┴──────┐                    ┌──────┴──────┐

&#x20;    ▼             ▼                    ▼             ▼

&#x20;   llmAgent.js   tools.js              bills        products

&#x20;                                     │

&#x20;                        ┌────────────┼────────────┐

&#x20;                        ▼            ▼            ▼

&#x20;                   Inventory      Khata        GST/Billing



\## ⚙️ Installation



Clone the repository:





git clone https://github.com/Savitha26711/nebula-supermarket-agent.git

cd nebula-supermarket-agent





Install dependencies:



bash

npm install





Create a .env file and configure the required API and Telegram credentials.



> Never commit .env or API keys to GitHub.



\## ▶️ Running the Application



Start the Telegram agent:



bash

node src/bot/test-bot.js





The bot can then process supermarket operations through Telegram.



\## 🧪 Testing



Individual modules can be tested using the test files available under:

text

src/tools/

src/services/

src/database/

src/agent/





The project was tested across database, inventory, billing, GST, Khata, invoice generation, report generation, LLM tool calling, and Telegram multi-turn workflows.



\## 🔐 Security



Sensitive configuration such as API keys and Telegram bot tokens is stored in .env and excluded from version control using .gitignore.







