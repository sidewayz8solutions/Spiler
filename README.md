# 🚀 Spiler - State-of-the-Art Campaign Auto-Dialer

<div align="center">
  <img src="public/assets/images/logo.svg" alt="Spiler Logo" width="200"/>
  <p>Professional fundraising dialer that uses YOUR phone number</p>
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
  [![Supabase](https://img.shields.io/badge/powered%20by-Supabase-green.svg)](https://supabase.com)
</div>

## ✨ Features

- 📱 **Uses YOUR Phone** - No Twilio fees, uses your existing number
- 🤖 **AI-Powered Scripts** - Personalized scripts for each donor
- 📊 **Real-time Analytics** - Live dashboard with conversion tracking
- 🎯 **Smart Queue** - AI prioritization and auto-dialing
- 💾 **Supabase Backend** - Scalable, real-time, secure
- 📲 **PWA Support** - Works like a native mobile app
- 🔒 **Enterprise Security** - Row-level security, encryption

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Your phone with a phone plan

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/spiler.git
cd spiler
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase db push
```

4. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

5. **Start development server**
```bash
npm run dev
```

6. **Open on your phone**
```
http://localhost:3000
```

## 📱 Mobile Installation

### iOS
1. Open Safari and navigate to your Spiler URL
2. Tap Share → Add to Home Screen
3. Name it "Spiler" and tap Add

### Android
1. Open Chrome and navigate to your Spiler URL
2. Tap menu → Add to Home Screen
3. Follow prompts to install

## 🏗️ Project Structure

```
spiler/
├── src/
│   ├── components/     # React components
│   ├── lib/            # Core libraries
│   │   └── supabase/   # Supabase client
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # Zustand state management
│   └── pages/          # Next.js pages
├── supabase/
│   ├── migrations/     # Database schema
│   └── functions/      # Edge functions
└── public/            # Static assets
```

## 🔧 Configuration

### Essential Settings
- `YOUR_PHONE_NUMBER` - Your actual phone number
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key

### Optional Features
- WebRTC calling (browser-based)
- Call recording
- AI script generation
- Email reports

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
docker build -t spiler .
docker run -p 3000:3000 spiler
```

## 📊 Database Schema

- **Organizations** - Campaign accounts
- **Donors** - Contact database with scoring
- **Calls** - Call records and outcomes
- **Queue** - Smart call queue management
- **Donations** - Donation tracking
- **Scripts** - Call scripts with AI

## 🔒 Security

- Row-level security (RLS) enabled
- Encrypted data at rest
- Secure authentication via Supabase Auth
- HTTPS only in production
- Input validation and sanitization

## 📈 Analytics

Real-time dashboards showing:
- Calls made/answered
- Conversion rates
- Total raised
- Hourly performance
- Top donors
- Team leaderboards

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 💬 Support

- Documentation: [docs.spiler.app](https://docs.spiler.app)
- Discord: [discord.gg/spiler](https://discord.gg/spiler)
- Email: support@spiler.app

## 🙏 Acknowledgments

Built with:
- [Supabase](https://supabase.com)
- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs)

---

Built with ❤️ for grassroots campaigns