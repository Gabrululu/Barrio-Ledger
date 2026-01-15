# 📱 Barrio Ledger - PWA

Progressive Web App para que los bodegueros registren ventas fácilmente.

---

## 🚀 Quick Start

### 1. Instalación

```bash
# Clonar proyecto
cd score-de-barrio-app

# Instalar dependencias
npm install
```

### 2. Configuración

Crear `.env`:

```bash
VITE_API_URL=http://localhost:3000/api
```

Para producción:
```bash
VITE_API_URL=https://api.scoredebarrio.com/api
```

### 3. Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:3001
```

### 4. Build para Producción

```bash
# Build optimizado
npm run build

# Preview del build
npm run preview
```

---

## 📂 Estructura del Proyecto

```
src/
├── components/
│   ├── RegisterForm.jsx    # Registro inicial
│   ├── Dashboard.jsx       # Pantalla principal
│   ├── SaleForm.jsx        # Formulario de venta
│   └── SalesList.jsx       # Historial de ventas
├── services/
│   ├── api.js              # API calls al backend
│   └── storage.js          # localStorage manager
├── App.jsx                 # Componente raíz
├── main.jsx                # Entry point
└── index.css               # Tailwind + custom styles
```

---

## 🎯 Funcionalidades

### ✅ Implementadas

**Registro de Comercio**
- Input de teléfono, nombre y ubicación
- Validación de campos
- Guardado automático de API key

**Dashboard Principal**
- Total de ventas del día
- Score placeholder (78)
- Últimas 20 ventas

**Registro de Ventas**
- Botones grandes Efectivo/Digital
- Input de monto con teclado numérico
- Botones rápidos (S/ 5, 10, 20, 50)
- Feedback visual de éxito

**Historial**
- Lista de últimas ventas
- Iconos por método de pago
- Tiempo relativo (hace X min)
- Estado de sincronización

**PWA**
- Instalable en home screen
- Funciona offline (próximamente)
- Service worker para cache

---

## 🎨 Diseño

### Mobile-First
Diseñado específicamente para teléfonos móviles de los bodegueros.

### Botones Grandes
Todos los botones tienen mínimo 44x44px para fácil toque.

### Colores
- **Verde (#10b981)**: Primary, éxito
- **Naranja (#f59e0b)**: Efectivo
- **Azul (#3b82f6)**: Digital

### Fuentes
- Títulos: 24px, bold
- Montos: 32px, bold
- Texto normal: 14-16px

---

## 📱 Testing en Móvil

### Opción 1: Ngrok (Recomendado)

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto local
ngrok http 3001

# Usar URL https://xxx.ngrok.io en tu móvil
```

### Opción 2: IP Local

```bash
# Iniciar con host
npm run dev -- --host

# Abrir desde móvil
# http://TU_IP_LOCAL:3001
```

### Opción 3: Deploy a Vercel

```bash
npm install -g vercel
vercel
```

---

## 🔧 Configuración Avanzada

### Cambiar URL del Backend

Editar `.env`:
```bash
VITE_API_URL=https://tu-backend.com/api
```

### Personalizar Colores

Editar `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#tu-color',
    },
  },
}
```

### Agregar Analytics

En `src/App.jsx`:
```javascript
import { analytics } from './services/analytics';

useEffect(() => {
  analytics.track('page_view');
}, []);
```

---

## 🚀 Deploy a Producción

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configurar variables de entorno en Vercel dashboard
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
# Conectar repo en dashboard.cloudflare.com
# Build command: npm run build
# Build output: dist
```

---

## 📊 PWA Features

### Instalación

Los usuarios pueden "Agregar a pantalla de inicio":

**Android:**
1. Abrir en Chrome
2. Menú → Agregar a pantalla de inicio
3. Ícono aparece en home

**iOS:**
1. Abrir en Safari
2. Compartir → Agregar a inicio
3. Ícono aparece en home

### Service Worker

```javascript
// Caching strategy
workbox.routing.registerRoute(
  /^https:\/\/api\./,
  new workbox.strategies.NetworkFirst()
);
```

### Offline Support (Próximamente)

- Cache de ventas en IndexedDB
- Sync automático cuando vuelva internet
- Badge de "pendiente" en ventas offline

---

## 🧪 Testing

### Test Manual

```bash
# 1. Registrar comercio
curl -X POST http://localhost:3001/api/merchants \
  -H "Content-Type: application/json" \
  -d '{"phone":"+51999888777","businessName":"Test","location":"Lima"}'

# 2. Usar apiKey en la app

# 3. Registrar 5 ventas

# 4. Verificar que aparezcan en historial

# 5. Verificar total del día
```

### Performance

```bash
# Lighthouse score objetivo
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90
- PWA: ✓
```

---

## 🐛 Troubleshooting

### "API key invalid"
- Verifica que el backend esté corriendo
- Verifica que la URL en `.env` sea correcta
- Limpia localStorage y vuelve a registrar

### "Venta no se registra"
- Abre DevTools → Network
- Verifica que POST a `/api/sales` devuelva 201
- Verifica que el apiKey esté en headers

### "No aparece en home screen"
- Verifica que sea HTTPS (o localhost)
- Verifica que manifest.json esté accesible
- Verifica que los iconos existan

### "Teclado no es numérico"
- Verifica que el input tenga `type="number"`
- Verifica que tenga `inputMode="decimal"`

---

## 📈 Roadmap

**v1.0 (Actual)**
- ✅ Registro de comercio
- ✅ Registro de ventas
- ✅ Historial
- ✅ PWA básica

**v1.1 (Próximo mes)**
- [ ] Offline support completo
- [ ] Gráficos de ventas
- [ ] Notificaciones push
- [ ] Estadísticas semanales

**v2.0 (Futuro)**
- [ ] Múltiples usuarios
- [ ] Inventario básico
- [ ] Integración QR
- [ ] Reportes PDF

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

## 📚 Recursos

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PWA Docs](https://web.dev/progressive-web-apps/)
- [Lucide Icons](https://lucide.dev/)

---

**¿Problemas?** Abre un issue en GitHub.