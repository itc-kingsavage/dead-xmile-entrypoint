# DEAD-XMILE ENTRYPOINT  
### WhatsApp Session Scanner (MD-Based)  
A lightweight entrypoint repository responsible for generating and exporting a WhatsApp Web session that will be used by the main bot.  
This repo **does not contain bot features** — only the secure session scanner.

---

## 🚀 Features
- Web-based QR scanner  
- Secure session export  
- Auto-save & auto-validate session  
- Minimal UI with “terminal/hacker-style” theme  
- Compatible with any WhatsApp MD bot  
- Simple to deploy (Node.js / Vercel / Docker)

---

## 📁 Repository Structure
dead-xmile-entrypoint/
│
├── README.md
├── package.json
├── package-lock.json
├── .gitignore
│
├── src/
│ ├── index.js
│ ├── server.js
│ ├── qr/
│ │ ├── generate.js
│ │ └── display.js
│ │
│ ├── session/
│ │ ├── save.js
│ │ ├── load.js
│ │ ├── delete.js
│ │ └── validate.js
│ │
│ ├── utils/
│ │ ├── logger.js
│ │ ├── colors.js
│ │ ├── banners.js
│ │ └── response.js
│ │
│ └── routes/
│ ├── qr.js
│ └── session.js
│
├── public/
│ ├── css/style.css
│ ├── js/app.js
│ ├── img/logo.png
│ └── index.html
│
├── temp/
│ └── session.json
│
└── deploy/
├── dockerfile
├── ecosystem.config.js
└── vercel.json

