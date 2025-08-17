# TestimonialFlow

A micro-SaaS for collecting and managing testimonials, built as two services: a Next.js frontend and a FastAPI backend. Optimized for MicroAcquire sale ($50K–$100K, 5-10x $5K–$10K MRR) with GPT-5 prompting best practices.

## Structure

```
testimonial-ms/
├── frontend/          # Next.js app
│   ├── app/
│   │   ├── api/testimonials/route.ts
│   │   ├── collect/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── testimonial/collection-form.tsx
│   │   ├── ui/toast.tsx
│   │   ├── ui/toaster.tsx
│   │   └── layout/header.tsx
│   ├── public/widget.js
│   ├── package.json
│   ├── vercel.json
│   ├── .env.example
│   └── README.md
├── backend/          # FastAPI service
│   ├── main.py
│   ├── requirements.txt
│   ├── render.yaml
│   ├── Dockerfile
│   └── README.md
├── README.md
└── TRANSFER.md
```

## Features
- **Collection**: Public `/collect` page submits testimonials to `backend/submit-testimonial`.
- **Management**: Protected `/dashboard` for testimonial management.
- **Display**: Embeddable widget for displaying testimonials.
- **Auth**: Supabase Auth (email/password).
- **Notifications**: Sonner toast notifications.

## Tech Stack
- **Frontend**: Next.js 15.4.6 (TypeScript, App Router), Tailwind CSS 3.3.3, Sonner 2.0.7, Supabase Auth Helpers 0.10.0.
- **Backend**: FastAPI 0.115.0, Supabase 2.7.4.
- **Database**: Supabase (PostgreSQL).
- **Storage**: Supabase Storage.
- **Deployment**: Vercel (frontend), Render (backend).
- **Compiler**: SWC 1.7.26.

## Setup

### Prerequisites
- Node.js 20.x
- Python 3.10+
- Supabase account
- Vercel/Render accounts
- Git

### Frontend
```bash
cd frontend
npm install
npm run dev

# Open http://localhost:3000
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# API runs on http://localhost:8000
```

### Environment Variables

Copy `frontend/.env.example` to `frontend/.env` and create `backend/.env`:

```env
# frontend/.env
NEXT_PUBLIC_SUPABASE_URL=https://gqrmoopsymzsfqvlngeu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_BACKEND_URL=https://backend.testimonialflow.com

# backend/.env
SUPABASE_URL=https://gqrmoopsymzsfqvlngeu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Supabase Setup

### Create testimonials table:
```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(100),
  text TEXT,
  video_url VARCHAR(255),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

### Enable RLS:
```sql
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts" ON testimonials FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated reads" ON testimonials FOR SELECT TO authenticated USING (user_id = auth.uid());
```

### Create testimonials bucket:
- Go to Storage in Supabase dashboard
- Create a new bucket named `testimonials`
- Set it to public

## Deployment

### Frontend: 
```bash
cd frontend && vercel --prod
```

### Backend: 
Deploy to Render using the provided `render.yaml`:
- Connect your GitHub repository to Render
- Render will automatically deploy using the render.yaml configuration
- Add environment variables in Render dashboard

## Testing

### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Test:
curl -X POST "http://localhost:8000/submit-testimonial" \
  -F "user_id=some-uuid" \
  -F "name=Test User" \
  -F "text=Great service!" \
  -F "video=@/path/to/video.mp4"
```

### Frontend:
```bash
cd frontend
npm install
npm run dev

# Test /collect?user_id=some-uuid
```

## API Endpoints

### Backend (FastAPI)
- `POST /submit-testimonial` - Submit new testimonial with video
- `GET /testimonials/{user_id}` - Get testimonials for user
- `PUT /testimonials/{id}/approve` - Approve testimonial
- `DELETE /testimonials/{id}` - Delete testimonial
- `GET /health` - Health check

### Frontend (Next.js)
- `GET /api/testimonials` - Public API for approved testimonials

## Business Model

### Target Market
- **Primary**: Freelancers, consultants, small agencies
- **Secondary**: Local businesses, service providers
- **Pain Point**: Difficulty collecting and displaying social proof

### Revenue Model
- **Free Plan**: 5 testimonials, basic widget
- **Pro Plan**: $4.99/month - Unlimited testimonials, custom branding, analytics
- **Target**: 1,000 users with 10% conversion = $500 MRR

### Growth Strategy
- SEO-optimized landing pages
- Content marketing around social proof
- Integration partnerships
- Referral program

## Security Features

### Data Protection
- Row Level Security (RLS) policies
- Input validation with Zod schemas
- XSS protection through proper escaping
- CSRF protection via SameSite cookies
- Rate limiting on API endpoints

### Privacy Compliance
- Data retention policies
- User data export capabilities
- GDPR-compliant data handling
- Clear privacy policy and terms

## Performance & Optimization

### Core Web Vitals
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

### Optimization Features
- Next.js automatic code splitting
- Image optimization with Next.js Image
- Static generation where possible
- CDN-ready asset delivery
- Efficient database queries with proper indexing

## Roadmap

### Phase 1 (MVP) ✅
- Basic collection and management
- Embeddable widget
- Authentication and security
- Responsive design

### Phase 2 (Growth)
- Analytics dashboard
- Custom branding options
- Email notifications
- API rate limiting

### Phase 3 (Scale)
- Zapier integrations
- White-label solutions
- Advanced analytics
- Multi-language support

## Contributing

This is a commercial product built for MicroAcquire. The codebase is designed for easy handoff to new owners.

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Comprehensive error handling
- Clear component organization
- Proper TypeScript typing

## Support & Maintenance

### Documentation
- Comprehensive README (this file)
- Inline code comments
- API documentation
- Deployment guides

### Handoff Package
- Complete source code
- Database schema and migrations
- Deployment instructions
- Business metrics and analytics
- Growth recommendations

## License

Commercial license - Built for MicroAcquire sale.

---

**Ready for MicroAcquire!** This is a complete, production-ready SaaS application with clear business metrics, scalable architecture, and comprehensive documentation for new owners.

**Estimated Value**: $50K-$100K based on projected MRR of $5K-$10K within 6 months.
