# Pharmacy Stock & Expiry Manager

**Live demo:** https://pharmacy-app-kappa-tan.vercel.app

A web app for tracking drug stock in a pharmacy, built to replace manual stock records. Demo data only.

## Features
- Add drugs with quantity and expiry date
- Dashboard cards: total items, expired, expiring within 30 days, low stock
- Colour-coded expiry and stock status badges
- Search, edit and delete records
- Data stored live in a Supabase (PostgreSQL) database

## Built with
- React (Vite)
- Supabase (PostgreSQL database)
- Deployed on Vercel

## Run locally
1. Clone the repo and run `npm install`
2. Create a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Run `npm run dev`

## Next
- User login and row-level security
