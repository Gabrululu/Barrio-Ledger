# 📱 Barrio Ledger - PWA

Progressive Web App for store owners to easily record sales.
---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone project
cd neighborhood-score-app

# Install dependencies
npm install
```

### 2. Configuration

Create `.env`:

```bash
VITE_API_URL=http://localhost:3000/api
```

For production:
```bash
VITE_API_URL=https://api.scoredebarrio.com/api
```

### 3. Development

```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:3001
```

### 4. Build for Production

```bash
# Optimized build
npm run build

# Preview of the build
npm run preview
```

---

## 📂 Project Structure

```
src/
├── components/
│   ├── RegisterForm.jsx    # Initial registration
│   ├── Dashboard.jsx       # Main screen
│   ├── SaleForm.jsx        # Sales form
│   └── SalesList.jsx       # Sales history
├── services/
│   ├── api.js              # API calls to the backend
│   └── storage.js          # localStorage manager
├── App.jsx                 # Root component
├── main.jsx                # Entry point
└── index.css               # Tailwind + custom styles
```

---

## 🎯 Features

### ✅ Implemented

**Business Registration**
- Phone number, name, and location input
- Field validation
- Automatic API key saving

**Main Dashboard**
- Total sales for the day
- Score placeholder (78)
- Last 20 sales

**Sales Register**
- Large Cash/Digital buttons
- Amount input with numeric keypad
- Quick buttons (S/ 5, 10, 20, 50)
- Visual success feedback

**History**
- List of latest sales
- Icons by payment method
- Relative time (X min ago)
- Synchronization status

**PWA**
- Installable on home screen
- Works offline (coming soon)
- Service worker for cache

---

## 🎨 Design

### Mobile-First
Designed specifically for winemakers' mobile phones.

### Large Buttons
All buttons are at least 44x44px for easy tapping.

### Colors
- **Green (#10b981)**: Primary, success
- **Orange (#f59e0b)**: Cash
- **Blue (#3b82f6)**: Digital

### Fonts
- Titles: 24px, bold
- Amounts: 32px, bold
- Normal text: 14-16px

---

## 📱 Mobile Testing

### Option 1: Ngrok (Recommended)

```bash
# Install ngrok
npm install -g ngrok

# Expose local port
ngrok http 3001

# Use URL https://xxx.ngrok.io on your mobile device
```

### Option 2: Local IP

```bash
# Start with host
npm run dev -- --host

# Open from mobile device
# http://TU_IP_LOCAL:3001
```

### Option 3: Deploy to Vercel

```bash
npm install -g vercel
vercel
```

---

## 🔧 Advanced Configuration

### Change Backend URL

Edit `.env`:
```bash
VITE_API_URL=https://tu-backend.com/api
```

### Customize Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: ‘#your-color’,
    },
  },
}
```

### Add Analytics

In `src/App.jsx`:
```javascript
import { analytics } from ‘./services/analytics’;

useEffect(() => {
  analytics.track(‘page_view’);
}, []);
```

---

## 🚀 Deploy to Production

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
# VITE_API_URL = https://api.barrioledger.com/api
```

### Netlify

```bash
# Build
npm run build

# Deploy
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Cloudflare Pages

```bash
# Connect repo at dashboard.cloudflare.com
# Build command: npm run build
# Build output: dist
```

---

## 📊 PWA Features

### Installation

Users can “Add to Home Screen”:

**Android:**
1. Open in Chrome
2. Menu → Add to Home Screen
3. Icon appears on home screen

**iOS:**
1. Open in Safari
2. Share → Add to Home Screen
3. Icon appears on home screen

### Service Worker

```javascript
// Caching strategy
workbox.routing.registerRoute(
  /^https:\/\/api\./,
  new workbox.strategies.NetworkFirst()
);
```

### Offline Support (Coming soon)

- Sales cache in IndexedDB
- Automatic sync when internet connection is restored
- “Pending” badge on offline sales

---

## 🧪 Testing

### Manual Test

```bash
# 1. Register business
curl -X POST http://localhost:3001/api/merchants \
  -H “Content-Type: application/json” \
  -d '{“phone”:“+51999888777”,“businessName”:“Test”,‘location’:“Lima”}'

# 2. Use apiKey in the app

# 3. Register 5 sales

# 4. Verify that they appear in history

# 5. Verify the day's total
```

### Performance

```bash
# Target Lighthouse score
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90
- PWA: ✓
```

---

## 🐛 Troubleshooting

### “API key invalid”
- Verify that the backend is running
- Verify that the URL in `.env` is correct
- Clear localStorage and re-register

### “Sale not registered”
- Open DevTools → Network
- Verify that POST to `/api/sales` returns 201
- Verify that the apiKey is in headers

### “Does not appear on home screen”
- Verify that it is HTTPS (or localhost)
- Verify that manifest.json is accessible
- Verify that the icons exist

### “Keyboard is not numeric”
- Verify that the input has `type=“number”`
- Verify that it has `inputMode=“decimal”`

---

## 📈 Roadmap

**v1.0 (Current)**
- ✅ Trade registration
- ✅ Sales registration
- ✅ History
- ✅ Basic PWA

**v1.1 (Next month)**
- [ ] Full offline support
- [ ] Sales charts
- [ ] Push notifications
- [ ] Weekly statistics

**v2.0 (Future)**
- [ ] Multiple users
- [ ] Basic inventory
- [ ] QR integration
- [ ] PDF reports

---

## 🤝 Contribuir

```bash
# Fork del repo
git checkout -b feature/nueva-funcionalidad
git commit -m "Descripción del cambio"
git push origin feature/nueva-funcionalidad
# Crear Pull Request
```

---

## 📚 Resources
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PWA Docs](https://web.dev/progressive-web-apps/)
- [Lucide Icons](https://lucide.dev/)

---

**Problems?** Open an issue on GitHub.