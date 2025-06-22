# StudyByte - Authentication & Payment Integration Setup Guide

## 🔐 Phase 1: Supabase Authentication Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API
3. Create a service role key for backend operations

### Step 2: Database Schema Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'inactive', 'cancelled')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Step 3: Environment Variables

#### Frontend (.env)
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
VITE_APP_URL=http://localhost:5173
```

#### Backend (.env)
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
MODEL_NAME=gpt-4-turbo-preview
MAX_TOKENS=2000

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PREMIUM_PRICE_ID=your_premium_price_id
STRIPE_PRO_PRICE_ID=your_pro_price_id

# App Configuration
API_HOST=localhost
API_PORT=8000
SECRET_KEY=your_jwt_secret_key
```

### Step 4: Install Dependencies

#### Frontend
```bash
cd client
npm install @supabase/supabase-js
```

#### Backend
```bash
cd server
pip install supabase python-jose[cryptography] passlib[bcrypt]
```

### Step 5: Update App.tsx

```tsx
import { AuthProvider } from './components/AuthProvider';

export default function App() {
    return (
        <AuthProvider>
            {/* existing app content */}
        </AuthProvider>
    );
}
```

## 💳 Phase 2: Stripe Integration Setup

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your publishable and secret keys from the dashboard
3. Create webhook endpoint for your app

### Step 2: Create Subscription Products

In your Stripe dashboard:

1. **Products & Pricing**:
   - Create "StudyByte Premium" product
   - Create "StudyByte Pro" product
   - Set up monthly/yearly pricing for each
   - Note down the Price IDs

2. **Webhook Configuration**:
   - Add endpoint: `https://yourdomain.com/api/stripe-webhook`
   - Select these events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### Step 3: Install Stripe Dependencies

#### Frontend
```bash
cd client
npm install @stripe/stripe-js
```

#### Backend
```bash
cd server
pip install stripe
```

### Step 4: Frontend Stripe Integration

Create `client/src/lib/stripe.ts`:

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;
```

### Step 5: Test the Integration

1. Start your development servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   uvicorn main:app --reload --port 8000

   # Terminal 2 - Frontend  
   cd client
   npm run dev
   ```

2. Test authentication flow:
   - Sign up with a new account
   - Verify profile creation in Supabase
   - Test login/logout

3. Test payment flow:
   - Create a test checkout session
   - Use Stripe test cards for payments
   - Verify webhook handling

## 🔄 Best Practices Implemented

### Security
- ✅ JWT token validation on backend
- ✅ Row Level Security (RLS) in Supabase
- ✅ Webhook signature verification
- ✅ Environment variable protection
- ✅ CORS configuration

### User Experience
- ✅ Automatic profile creation
- ✅ Seamless authentication state management
- ✅ Loading states and error handling
- ✅ Responsive UI components
- ✅ Toast notifications

### Payment Processing
- ✅ Secure checkout with Stripe
- ✅ Webhook handling for subscription updates
- ✅ Customer portal for self-service
- ✅ Subscription status tracking
- ✅ Failed payment handling

### Performance
- ✅ Optional authentication endpoints
- ✅ Efficient database queries
- ✅ Proper error handling and logging
- ✅ Async/await patterns

## 🚀 Deployment Considerations

### Vercel Deployment
1. Add environment variables to Vercel dashboard
2. Configure webhook URLs for production
3. Update CORS settings for production domain

### Database Scaling
- Consider connection pooling for high traffic
- Implement proper indexing on frequently queried fields
- Set up database backups

### Security Checklist
- [ ] Rotate API keys regularly
- [ ] Monitor webhook failures
- [ ] Set up alerts for failed payments
- [ ] Implement rate limiting
- [ ] Add request logging

## 📝 Testing Strategy

### Unit Tests
- Authentication utilities
- Stripe client methods
- Database operations

### Integration Tests
- Full authentication flow
- Payment processing
- Webhook handling

### E2E Tests
- User registration to first subscription
- Subscription management
- Chat functionality with different user tiers

## 🔧 Troubleshooting

### Common Issues

1. **Authentication not working**:
   - Check Supabase URL and keys
   - Verify RLS policies
   - Check CORS settings

2. **Stripe payments failing**:
   - Verify webhook endpoint is accessible
   - Check webhook signature validation
   - Ensure proper error handling

3. **Database connection issues**:
   - Check service role key permissions
   - Verify connection string format
   - Monitor connection limits

### Debugging Tips
- Enable detailed logging in development
- Use Supabase dashboard for real-time logs
- Monitor Stripe dashboard for webhook delivery
- Check browser network tab for failed requests

## 📚 Next Steps

After completing this integration:

1. **Enhanced Features**:
   - Social login (Google, GitHub)
   - Two-factor authentication
   - Usage analytics and limits
   - Referral system

2. **Business Logic**:
   - Free tier limitations
   - Premium feature gating
   - Usage tracking and quotas
   - Subscription upgrade/downgrade flows

3. **Monitoring**:
   - Error tracking (Sentry)
   - Analytics (Mixpanel/PostHog)
   - Performance monitoring
   - Revenue tracking

This setup provides a production-ready foundation for authentication and payments that can scale with your application growth. 