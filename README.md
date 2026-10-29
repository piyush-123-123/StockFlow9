# StockFlow — Inventory Management System

StockFlow is a web-based inventory management application built with React and Firebase. It helps organizations manage products, monitor stock levels, and identify low-stock items.

## Features

- User registration and login
- Organization-specific inventory
- Add, edit, search, and delete products
- Duplicate SKU prevention within an organization
- Dashboard with inventory statistics
- Low-stock alerts
- Configurable default low-stock threshold

## Tech Stack

- React
- Vite
- JavaScript
- Firebase Authentication
- Cloud Firestore
- CSS

## Getting Started

### Prerequisites

- Node.js and npm
- A Firebase project

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/piyush-123-123/StockFlow9.git
cd StockFlow9
npm install
```

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Enable Email/Password authentication in Firebase, create a Firestore database, and configure the Firestore security rules.

Start the development server:

```bash
npm run dev
```

## Security

- Local environment files are excluded from Git.
- Firestore rules restrict access to organization data.
- SKU indexing is used to prevent duplicate product SKUs.

## Project Status

Core authentication, inventory management, dashboard, and settings features have been implemented.
