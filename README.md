# 🥗 RestroSaaS - Digital Menu Kit
**Launch your own Digital Menu Agency in minutes.**

This is a complete SaaS solution built with **Next.js 15**, **Tailwind CSS**, **TypeScript** and **Supabase**.

## 📂 Features
* **Menu Builder:** Drag-and-drop interface for restaurants.
* **QR Code Ready:** Auto-generates unique links for each restaurant.
* **Supabase Backend:** Zero-maintenance database.
* **Responsive Design:** Looks perfect on all mobile devices.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Open your terminal in this folder and run:
```bash
npm install
# or
yarn install

2. Set Up the Database (Supabase)
This project uses Supabase (Free Tier is sufficient).

  1. Go to Supabase.com and create a new project.

  2. Go to the SQL Editor (on the left sidebar).

  3. Open the file schema.sql provided in this folder.

  4. Copy ALL the text and paste it into the Supabase SQL Editor.

  5. Click Run.

  This automatically creates your Tables, Policies, and Storage Buckets.

3. Connect Environment Variables:

  1. Rename the file .env.example to .env.local.

  2. Go to your Supabase Dashboard -> Settings -> API.

  3. Copy your Project URL and Anon Key.

  4. Paste them into your .env.local file.

4. Run the APP
npm run dev

Open http://localhost:3000 to see your app!

🛠️ Deployment (Go Live)
We recommend Vercel for hosting (it's free and fast).

  1.Push this code to a Private GitHub repository.

  2.Go to Vercel.com -> Add New Project.

  3.Import your repository.

  4.Important: In Vercel "Environment Variables", add the same keys you  put in .env.local:

  NEXT_PUBLIC_SUPABASE_URL

  NEXT_PUBLIC_SUPABASE_ANON_KEY

  NEXT_PUBLIC_SITE_URL (Set this to your Vercel domain, e.g., https://my-menu-app.vercel.app)

  5. Click Deploy.

