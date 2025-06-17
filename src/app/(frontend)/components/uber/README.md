# Uber Delivery Driver Page Components

This directory contains all the components for the Uber delivery driver page (`/uber`).

## Structure

```sh
uber/
├── README.md           # This file
├── types.ts           # TypeScript interfaces for Uber components
├── forms/             # Form components and schemas
│   ├── schemas.ts     # Zod validation schemas
│   └── UberCommentForm.tsx  # Customer review form
└── sections/          # Section components
    ├── index.ts       # Exports all section components
    ├── HeroSection.tsx      # Hero section with typing animation
    ├── StatsSection.tsx     # Delivery statistics display
    ├── GearSection.tsx      # Professional gear showcase
    ├── CommentsSection.tsx  # Customer reviews and ratings
    ├── LiveCameraSection.tsx # Live streaming integration
    ├── CommentFormSection.tsx # Customer review form section
    └── CTASection.tsx       # Call-to-action section
```

## Page Structure

The Uber page (`/uber/page.tsx`) is a server component that imports a client component (`/uber/UberClient.tsx`) which contains:

1. **Hero Section** - Introduction with typing animation
2. **Floating Car Image** - Animated pixel art car
3. **Stats Section** - Key delivery statistics (2000+ deliveries, 98% rating, 0% cancellation)
4. **Floating Delivery Bag Image** - Animated briefcase pixel art
5. **Gear Section** - Professional delivery equipment showcase
6. **Floating Live Camera Image** - Animated monitor pixel art
7. **Live Camera Section** - Twitch/YouTube streaming integration
8. **Floating Comments Image** - Animated chat pixel art
9. **Comments Section** - Customer reviews with star ratings
10. **Floating Form Image** - Animated form pixel art
11. **Comment Form Section** - Customer review submission form
12. **CTA Section** - Call-to-action with Uber Eats link

## Features

- **Professional Statistics**: Showcases 2000+ deliveries, 98% customer rating, and 0% cancellation rate
- **Gear Showcase**: Displays professional delivery equipment with placeholder for image uploads
- **Live Streaming Integration**: Ready for Twitch/YouTube live camera feeds with platform detection
- **Customer Reviews**: Demo customer reviews with star ratings and responsive layout
- **Interactive Review Form**: Customer feedback submission with name, delivery type, comment, and star rating
- **Star Rating System**: Interactive 0.5-step rating input (0-5 stars)
- **Form Validation**: Zod schema validation for all form inputs
- **Responsive Design**: Mobile-first design with pixel art aesthetic
- **SEO Optimized**: Proper metadata and semantic HTML structure
- **Floating Animations**: Smooth CSS animations for visual appeal

## Demo Data

The page currently uses demo data for:

- Customer reviews and ratings
- Gear specifications
- Statistics (based on real achievements)

## Future Enhancements

- Real customer review API integration (form is ready for backend)
- Gear image upload functionality
- Dynamic statistics from delivery platform APIs
- Live streaming URL integration (Twitch/YouTube embed ready)
- Real-time delivery tracking showcase
- Comment moderation system
- Rating analytics dashboard
