# 🐾 RescuePaws – Stray Animal Rescue Map System

A fully functional Next.js web application for reporting and tracking stray animals in your community. Built with Firebase, Leaflet maps, and a clean, modern UI.

![RescuePaws Preview](https://img.shields.io/badge/Status-Production_Ready-success)

## ✨ Features

- 🔐 **Authentication**: Email/password login and registration with Firebase Auth
- 🗺️ **Interactive Map**: Click anywhere to report stray animals with Leaflet.js
- 📝 **Report System**: Submit detailed reports with animal type, condition, description, and photos
- 📷 **Image Upload**: Upload photos to Firebase Storage
- 🎯 **Rescue Tracking**: Mark animals as rescued to update their status
- 📊 **Real-time Updates**: Firestore integration for live data synchronization
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🎨 **Beautiful UI**: Custom design with Fraunces & Nunito fonts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Firebase project (free tier works perfectly)

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up Firebase**

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com):

- Enable **Authentication** → Sign-in method → Email/Password
- Create a **Firestore Database** (start in test mode)
- Enable **Storage** (start in test mode)
- Get your Firebase config from Project Settings

3. **Configure environment variables**

Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Structure

### Firestore Collection: `reports`

```typescript
{
  id: string;              // Auto-generated document ID
  userId: string;          // Firebase Auth UID
  animalType: "dog" | "cat" | "other";
  condition: "injured" | "hungry" | "sick";
  description: string;     // User description
  imageUrl?: string;       // Firebase Storage URL (optional)
  latitude: number;        // Map coordinates
  longitude: number;       // Map coordinates
  status: "pending" | "rescued";
  createdAt: Timestamp;    // Firebase Timestamp
}
```

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage
- **Maps**: Leaflet.js + React-Leaflet
- **Fonts**: Fraunces (display) + Nunito (body)

## 🎨 Design Features

- **Custom Color Palette**: Amber accents with stone neutrals
- **Typography**: Fraunces for headings, Nunito for body text
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach
- **Accessibility**: Semantic HTML and keyboard navigation

## 📁 Project Structure

```
rescuepaws/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Registration page
│   ├── map/page.tsx            # Main map interface
│   ├── layout.tsx              # Root layout with auth provider
│   ├── page.tsx                # Home redirect
│   └── globals.css             # Global styles
├── components/
│   ├── MapComponent.tsx        # Leaflet map wrapper
│   ├── ReportForm.tsx          # Report submission form
│   └── ReportDetail.tsx        # Report detail modal
├── lib/
│   ├── firebase.ts             # Firebase configuration
│   ├── AuthContext.tsx         # Auth state provider
│   └── types.ts                # TypeScript interfaces
└── public/                     # Static assets
```

## 🔒 Security Rules (Firebase)

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Build for Production

```bash
npm run build
npm start
```

## 🎯 Usage Guide

1. **Register an account** at `/register`
2. **Login** at `/login`
3. **Click on the map** to report a stray animal
4. **Fill in the form** with animal details and optional photo
5. **View reports** in the sidebar or click map markers
6. **Mark as rescued** when an animal is helped

## 🤝 Contributing

This is a beginner-friendly MVP. Feel free to:
- Add new features (search, filters, user profiles)
- Improve the UI/UX
- Optimize performance
- Add tests

## 📝 License

MIT License - feel free to use this project for learning or production!

## 🐛 Troubleshooting

**Map not loading?**
- Check if Leaflet CSS is loaded in `globals.css`
- Ensure you're using dynamic import for MapComponent

**Firebase errors?**
- Verify all environment variables are set correctly
- Check Firebase console for authentication/database status
- Ensure Firestore and Storage are enabled

**Build errors?**
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for animal rescue communities**

🐶 🐱 Together we save more lives!
