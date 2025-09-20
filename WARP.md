# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Bharat Breed Rakshask** is a comprehensive cattle and buffalo breed management system for Indian farmers. It combines AI-powered breed classification with complete livestock management, breeding tracking, and farmer support services.

### Key Features
- **AI Breed Classification**: Google Vision API + custom models for 78 Indian cattle/buffalo breeds
- **Animal Profile Management**: Complete livestock records with health, breeding, vaccination tracking
- **Breeding Management**: Pregnancy tracking, breeding cycles, offspring records with calendar integration
- **Multilingual Support**: English and Hindi with voice input
- **Offline Capability**: Works without internet, syncs when reconnected
- **Government Integration**: Schemes information, veterinary contacts, health tips
- **Accessibility**: Large buttons, voice feedback, screen reader support for farmers

## Tech Stack

### Frontend (Web)
- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Redux Toolkit + Redux Persist
- **Offline Sync**: Redux Offline / WatermelonDB for mobile
- **Theme**: Cyber-farm (green + yellow palette) with accessibility features

### Backend
- **Runtime**: Node.js with NestJS/Express
- **APIs**: GraphQL + REST endpoints
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Firebase Auth (Phone OTP + optional Aadhaar)
- **Storage**: AWS S3 (compressed local, original cloud)

### AI & ML
- **Breed Classification**: Google Vision API
- **ATC Scoring**: Vision model + pose/landmark detection (OpenCV + PyTorch)
- **Mock Services**: Initially implemented, then real model integration

### Additional Services
- **Notifications**: Firebase Cloud Messaging
- **Analytics**: Chart.js/Recharts for admin dashboard
- **Internationalization**: next-intl (English/Hindi)
- **Mobile Conversion**: PWA + Capacitor for native apps

## Development Commands

### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Add shadcn/ui components
npx shadcn@latest add [component-name]

# Run type checking
npm run type-check
```

### Backend Development
```bash
# Navigate to backend directory (when created)
cd backend

# Install dependencies
npm install

# Start development server
npm run start:dev

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed database
npm run db:seed

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

### Database Operations
```bash
# Start PostgreSQL (Docker)
docker run --name bharat-breed-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Connect to database
psql -h localhost -U postgres -d bharat_breed

# Backup database
pg_dump bharat_breed > backup.sql

# Restore database
psql bharat_breed < backup.sql
```

### Mobile Development
```bash
# Add Capacitor (when ready for mobile)
npm install @capacitor/core @capacitor/cli
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

## Project Architecture

### Frontend Structure
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Navigation, header, footer
│   │   ├── features/           # Feature-specific components
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   ├── classify/       # AI classification UI
│   │   │   ├── profile/        # Animal profile management
│   │   │   ├── breeding/       # Breeding management
│   │   │   └── admin/          # Admin dashboard
│   │   └── common/             # Shared components
│   ├── lib/
│   │   ├── api/                # API clients (GraphQL, REST)
│   │   ├── store/              # Redux store configuration
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   ├── types/              # TypeScript definitions
│   │   └── constants/          # App constants, breed data
│   ├── styles/                 # Global styles
│   ├── assets/                 # Images, icons
│   └── locales/                # i18n files (en, hi)
└── public/                     # Static assets
```

### Key Data Models
- **Breed**: 78 Indian cattle/buffalo breeds with detailed characteristics
- **Animal**: Individual livestock profiles with health, breeding status
- **User**: Farmers, admins with authentication and farm association
- **BreedingRecord**: Mating, pregnancy, offspring tracking
- **HealthRecord**: Vaccination, illness, treatment history
- **Farm**: Location, ownership, animal count
- **Notification**: Breeding reminders, health alerts

### State Management
- **Auth**: User authentication, profile management
- **Animals**: Livestock inventory, filtering, selection
- **Breeds**: Breed database, classification results
- **Breeding**: Pregnancy tracking, calendar events
- **Offline**: Sync status, pending actions

## Breed Database

The system includes a comprehensive database of 78 Indian cattle and buffalo breeds:
- **47 Cattle Breeds**: Including Gir, Sahiwal, Red Sindhi, etc.
- **31 Buffalo Breeds**: Including Murrah, Nili Ravi, Bhadawari, etc.
- **Detailed Attributes**: Physical characteristics, milk yield, disease resistance, government programs

Data source: `data/breeds-database.json` (converted from Excel)

## AI Classification Features

### Breed Detection
- Google Vision API integration
- Confidence scoring
- Bounding box detection
- Landmark identification

### ATC (Animal Type Classification) Scoring
- Body structure analysis
- Udder conformation
- Leg structure
- Overall dairy potential
- Breeding recommendations

### Camera UI
- Live camera feed
- Overlay guides
- Heatmap toggle
- Real-time feedback

## Accessibility Features

- **Large Touch Targets**: 48px minimum button size
- **Voice Feedback**: Screen reader support
- **High Contrast**: Cyber-farm theme with sufficient contrast ratios
- **Keyboard Navigation**: Full app navigable via keyboard
- **Language Support**: Hindi and English with voice input
- **Offline Support**: Essential features work without internet

## Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled, comprehensive typing
- **ESLint + Prettier**: Consistent code formatting
- **Component Structure**: Functional components with hooks
- **Error Handling**: Comprehensive error boundaries and API error handling
- **Testing**: Unit tests for utilities, integration tests for components
- **Documentation**: JSDoc for complex functions, README for features

### Performance
- **Image Optimization**: Next.js Image component, WebP format
- **Code Splitting**: Dynamic imports for heavy components
- **Offline Storage**: IndexedDB via Redux Persist
- **API Caching**: Apollo Client cache, SWR for REST
- **Bundle Analysis**: Regular bundle size monitoring

### Security
- **Authentication**: Firebase Auth with phone verification
- **API Security**: JWT tokens, rate limiting
- **Data Validation**: Zod schemas for forms and API
- **File Upload**: Secure S3 upload with size/type validation
- **Privacy**: GDPR compliance, data encryption at rest

## Deployment

### Development
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Heroku
- **Database**: Supabase/PlanetScale
- **Storage**: AWS S3/Cloudinary

### Production
- **Frontend**: Vercel Pro/AWS CloudFront
- **Backend**: AWS ECS/Google Cloud Run
- **Database**: AWS RDS/Google Cloud SQL
- **CDN**: CloudFlare
- **Monitoring**: Sentry, LogRocket

## Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_CONFIG={...}
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=...
NEXT_PUBLIC_AWS_S3_BUCKET=...

# Backend (.env)
DATABASE_URL=postgresql://...
FIREBASE_SERVICE_ACCOUNT={...}
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
GOOGLE_VISION_API_KEY=...
```

## Government Schemes Integration

- **Breeding Programs**: State-specific cattle improvement schemes
- **Health Insurance**: Livestock insurance programs
- **Subsidies**: Feed, equipment, infrastructure subsidies
- **Training**: Farmer education and skill development
- **Contact Information**: Local veterinary officers, extension services

## Future Enhancements

- **IoT Integration**: Collar sensors, health monitoring devices
- **Blockchain**: Breeding certificates, supply chain tracking
- **Satellite Data**: Pasture monitoring, weather integration
- **Market Prices**: Real-time livestock pricing
- **Social Features**: Farmer community, knowledge sharing
- **Advanced Analytics**: Predictive breeding, disease outbreak alerts
