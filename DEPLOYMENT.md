# Mall Platform - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Step 1: Get PostgreSQL Database

1. Go to **https://neon.tech** (FREE)
2. Sign up with GitHub or Google
3. Click "Create a project"
4. Name it: `mall-platform`
5. Copy the connection string

**Your connection string looks like:**
```
postgresql://mall-platform_owner:AbCdEf123456@ep-cool-darkness-123456.us-east-1.aws.neon.tech/mall-platform?sslmode=require
```

---

### ✅ Step 2: Update .env File

Replace the placeholder values with your actual connection string:

```env
DATABASE_URL="your-connection-string-here"
DIRECT_URL="your-connection-string-here"
```

**Both DATABASE_URL and DIRECT_URL should be the SAME value.**

---

### ✅ Step 3: Initialize Database Locally

Run these commands:

```bash
# Generate Prisma client
bun run db:generate

# Push database schema
bun run db:push

# Seed initial data (admin user, products, etc.)
bun run db:seed
```

---

### ✅ Step 4: Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Mall Platform"

# Create repo on GitHub first: https://github.com/new
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/mall-platform.git
git branch -M main
git push -u origin main
```

---

### ✅ Step 5: Deploy on Vercel

1. Go to **https://vercel.com**
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Select `mall-platform` repository
5. Click "Import"

---

### ✅ Step 6: Add Environment Variables

In Vercel, before clicking Deploy:

1. Expand "Environment Variables"
2. Add:

| Variable | Value |
|----------|-------|
| DATABASE_URL | your-postgresql-connection-string |
| DIRECT_URL | your-postgresql-connection-string |

3. Click "Deploy"

---

### ✅ Step 7: After Deployment

Your site will be live at: `https://your-project.vercel.app`

**Admin Panel:** `https://your-project.vercel.app/admin`
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the admin password after first login!

---

## 🔧 Troubleshooting

### Error: "Prisma Client initialization error"
- Make sure DATABASE_URL and DIRECT_URL are set in Vercel
- Redeploy after adding environment variables

### Error: "Database connection failed"
- Check your connection string is correct
- Make sure your database is not paused (Neon pauses inactive databases)

### Error: "Table does not exist"
- Run `bun run db:push` locally first
- The schema needs to be pushed to your database

---

## 📱 Features

- ✅ User Registration with Invite Code
- ✅ VIP Level System (based on balance)
- ✅ Product Purchase with Commission
- ✅ 3-Level Referral Commission (10%/5%/2%)
- ✅ Deposit/Withdrawal System
- ✅ Admin Panel

---

## 🆘 Need Help?

1. Check Vercel deployment logs
2. Check your database provider dashboard
3. Make sure all environment variables are set
