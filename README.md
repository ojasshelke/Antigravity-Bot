# 🚀 Antigravity Bot

Antigravity Bot is a Telegram-controlled remote automation engine that runs on a cloud server and can dynamically operate inside any project directory.

It supports AI builds, job tracking, logging, and dynamic workspace execution.

---

## 🧠 Core Idea

Run the bot once.

Control your server remotely.

Bind it to any project folder using a single command.

---

## ⚡ Features

- AI build command (`/build`)
- Job status tracking (`/status`)
- Log inspection (`/logs`)
- Dynamic workspace support
- PM2 process management
- Cloud deployment ready
- 24/7 execution

---

## 🏗 Architecture

- Node.js
- PM2
- Ubuntu (DigitalOcean)
- Telegram Bot API
- AI build integration
- Dynamic working directory binding

---

## 🔥 Run Bot In Any Project

The bot supports dynamic workspace binding via CLI argument.

### Run in current directory:

```bash
node ~/Antigravity-Bot/index.js $(pwd)
```

### Run with PM2:

```bash
pm2 start ~/Antigravity-Bot/index.js --name dynamic-bot -- $(pwd)
```

---

## 🧩 Optional: Create Alias (Recommended)

Add this to your `~/.bashrc`:

```bash
alias runbot='pm2 start ~/Antigravity-Bot/index.js --name dynamic-bot -- $(pwd)'
```

Reload:

```bash
source ~/.bashrc
```

Now you can run:

```bash
cd any-project
runbot
```

---

## ☁️ Cloud Deployment

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/Antigravity-Bot.git
cd Antigravity-Bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Create `.env` file:

```env
BOT_TOKEN=your_telegram_token
OPENAI_API_KEY=your_openai_key
```

### 4. Start With PM2

```bash
pm2 start index.js --name antigravity-bot
pm2 save
pm2 startup
```

---

## 🔒 Security Recommendation

Restrict access to your Telegram ID inside your bot logic:

```js
if (ctx.from.id !== YOUR_TELEGRAM_ID) return;
```

Never deploy without access restriction.

---

## 📁 Project Structure

```
Antigravity-Bot/
│
├── index.js
├── config.js
├── jobManager.js
├── logger.js
├── fileWriter.js
├── jobs.json
├── gravity_state.json
├── workspace/
└── package.json
```

---

## ⚠ Warning

This bot can execute and modify code on your server.

If exposed publicly without authentication,
it becomes a remote code execution endpoint.

Always:
- Lock Telegram access
- Validate inputs
- Restrict workspace paths

---

Built by Ojas.
