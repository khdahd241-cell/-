# Imam Al-Jazari Quran Center Telegram Bot

A modular Node.js + Telegraf + PostgreSQL/Prisma Telegram bot starter for the Imam Al-Jazari Center for Quran Recitation & Ijazah with Sanad. It includes Arabic/Amharic/English UI, registration, packages, payment receipt review, minute-ledger accounting, session deductions, admin commands, group schedule configuration, exam reminders, restriction records, and Render deployment support.

> Important operational note: this is a substantial starter implementation, not a substitute for testing with your real Telegram groups and database. Test first with a separate PostgreSQL database and test bot. Telegram group muting requires the bot to be an administrator with Restrict Members permission. Never commit `.env` or secrets.

## 1. Requirements
- Node.js 20+
- A Telegram bot token from `@BotFather`
- PostgreSQL database
- GitHub repository
- Render Web Service

## 2. Upload to GitHub (phone or computer)
1. Extract `imam-aljazari-bot-full.zip`.
2. Create a new GitHub repository, e.g. `imam-aljazari-bot`.
3. Upload all extracted files and folders to the repository root. Do not upload the ZIP itself as the only repository file.
4. Confirm that `package.json`, `index.js`, `prisma/schema.prisma`, and `src/` are visible at the repository root.
5. Keep `.env` out of GitHub. Only `.env.example` belongs in the repository.

## 3. Configure Render
1. Render Dashboard → New + → Web Service → connect the GitHub repository.
2. Runtime: Node.
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `npx prisma migrate deploy && npm start`
5. Add Environment Variables listed below.
6. Deploy. Open Logs and check that PostgreSQL connects and the bot starts.

### Required Render Environment Variables
- `BOT_TOKEN`: token from BotFather.
- `DATABASE_URL`: PostgreSQL connection URL. If PostgreSQL is hosted on Render in the same region, use the Internal Database URL. Otherwise use the provider's connection URL and required SSL options.
- `ADMIN_IDS`: your numeric Telegram user ID, e.g. `123456789` (not your username).

### Recommended variables
Set the six group IDs, `ADMIN_GROUP_ID`, payment accounts, contact details, `TIMEZONE=Africa/Addis_Ababa`, `WELCOME_BONUS_MINUTES=30`, `MAX_LOAN_MINUTES=100`.

For multiple IDs use comma-separated numeric values. Never include spaces inside the ID itself.

## 4. Database initialization
The Render start command runs `npx prisma migrate deploy` before starting the bot. This project includes a baseline migration. For local setup:
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```
If your existing PostgreSQL database already has tables or is shared with another app, make a backup and inspect it before applying migrations. Do not run destructive commands on production.

## 5. Payments
Current payment details are configurable through Render environment variables:
- Wallet → Telebirr: `TELEBIRR_NUMBER=0990161371`
- Wallet → M-Pesa: `MPESA_NUMBER=0721009122`
- Bank → BOA: `BOA_ACCOUNT=226626646`
- Bank → CBE: `CBE_ACCOUNT=1000285374425`
- Account name: `خالد أحمد مصطفى / Khalid Ahmed Mustafa`

When a student buys a package, the bot asks Wallet or Bank, then the specific method. It sends payment instructions as plain text and includes a **copyable payment block**. The student then submits a receipt/photo/document. The request is sent to the admin group if `ADMIN_GROUP_ID` is configured; otherwise admins can review via private bot notification if Telegram permits it.

Commands:
- `/approve TOP-000001` — approve a pending payment once.
- `/reject TOP-000001 reason` — reject a pending payment.
- `/payments` — list recent pending requests (admin).

## 6. Commands
Student:
- `/start` — choose language / start registration.
- `/menu` — main menu.
- `/language` — change language.
- `/cancel` — cancel current step.

Supervisor/admin:
- `/deduct IF-000001 20` — deduct 20 minutes and record a session.
- `/balance IF-000001` — view balance.
- `/student IF-000001` — view student summary.
- `/approve TOP-000001`
- `/reject TOP-000001 [reason]`
- `/exam_done IF-000001` — mark exam completed and clear exam-overdue restriction.
- `/broadcast message` — send same message to registered bot users.
- `/stats` — operational summary.
- `/resource_add TYPE|CATEGORY|TITLE_AR|TITLE_AM|TITLE_EN|URL` — add a resource (use `|` as separator).
- `/help_admin` — admin command list.

## 7. Schedule groups
Six IDs are optional until groups are ready. Set the corresponding environment variables. Add the bot to each group as administrator. The schedule is in `src/config.js` and uses Africa/Addis_Ababa:
- Men: Tue/Wed/Thu, Morning 09:00–12:00; Afternoon 14:00–15:30; Night 21:00–23:00.
- Women: Sat/Sun/Mon, same periods.
- Friday is weekly vacation.

## 8. Audio privacy
Do not configure permanent audio storage. Telegram file IDs may be used for short-lived forwarding; the bot does not download or archive audio. If temporary audio handling is added, use an expiring queue and delete temporary files on a short schedule. Telegram messages cannot always be deleted after arbitrary time unless the bot has the appropriate rights and Telegram permits deletion.

## 9. Security checklist
- Use a private repository.
- Set secrets only in Render Environment.
- Add only trusted numeric IDs to `ADMIN_IDS` / `SUPERVISOR_IDS`.
- Keep bot token and database URL private.
- Enable database backups.
- Test payments and ledger on a separate test database before production.
- Give the bot only the Telegram group rights it needs.
- Rotate the token immediately if it leaks.

## 10. Troubleshooting
- `Missing required environment variable: DATABASE_URL`: add `DATABASE_URL` in Render → service → Environment.
- `401 Unauthorized`: check `BOT_TOKEN`.
- Bot starts but ignores groups: add bot to group and set correct group IDs; verify permissions.
- Receipt not forwarded: set `ADMIN_GROUP_ID` and ensure bot can post in that group.
- Prisma error: confirm database URL, network access, SSL requirements, and that migrations are applied.
- Render free instance sleeps: first response may be delayed; use a suitable always-on plan for reliable real-time bot operations.
