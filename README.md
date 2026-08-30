# ShopNest Client (onwear)

The frontend client application for **ShopNest**, a premium full-stack e-commerce platform built with Next.js, React, TailwindCSS, and Lucide Icons.

## Features

- **Premium Reveal Hero Component**: A visually stunning landing section featuring interactive product hotspots, premium imagery, and smooth scroll transitions.
- **Dynamic Category Hover Hero Banners**: Engaging hero sections that dynamically change based on user hovers and selections.
- **Sales Analytics Dashboard**: Built-in Admin dashboard with custom SVG-rendered line area charts for sales overviews and conversion analytics.
- **Responsive Layout**: Pixel-perfect grid consistency across mobile, tablet, and desktop views.
- **Authentication Pages**: Built-in interactive routes for login, registration, and user profiles.
- **Wishlist & Cart Management**: Real-time cart calculations, checkout flows, and wishlist sync.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **State & Data Fetching**: React Hooks & Context API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- ShopNest Backend Server running locally

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

## Directory Structure

- `src/app`: Page routes and layouts.
- `src/components`: Reusable UI elements (Headers, Footers, Charts, Heros, etc.).
- `src/context`: React Context providers for Auth, Cart, and Global State.
- `src/styles`: Main styles and Tailwind configurations.
