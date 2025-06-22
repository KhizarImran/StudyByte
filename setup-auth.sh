#!/bin/bash

echo "🚀 Setting up StudyByte Authentication & Payment Integration..."

# Frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install @supabase/supabase-js @stripe/stripe-js

# Backend dependencies
echo "📦 Installing backend dependencies..."
cd ../server
pip install supabase python-jose[cryptography] passlib[bcrypt] stripe

echo "✅ Dependencies installed successfully!"

echo "📋 Next steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Create a Stripe account at https://stripe.com"
echo "3. Set up your environment variables (see INTEGRATION_SETUP.md)"
echo "4. Run the SQL commands in Supabase (see INTEGRATION_SETUP.md)"
echo "5. Configure your Stripe products and webhooks"

echo "🎉 Setup complete! Check INTEGRATION_SETUP.md for detailed instructions." 