# 🏪 BArrio Ledger

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mantle Network](https://img.shields.io/badge/Built%20on-Mantle-green)](https://mantle.xyz)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev)

---

## 📋 Descripción

**Barrio Ledger** es una plataforma fintech descentralizada que transforma las ventas diarias de pequeños comercios (bodegas, tiendas de barrio) en un historial crediticio verificable e inmutable usando la blockchain de **Mantle L2**.

El objetivo es **incluir financieramente** a negocios no bancarizados, permitiéndoles acceder a créditos justos basados en su comportamiento real de ventas, eliminando intermediarios costosos y reduciendo el riesgo de fraude.

### 🎯 Propuesta de Valor

| Stakeholder | Beneficio |
|-------------|-----------|
| 🛒 **Bodeguero** | Herramienta sencilla para registrar ventas y construir un score financiero digital verificable |
| 🏦 **Fintech/Banco** | Acceso a datos de ventas certificados on-chain, reduciendo riesgo de fraude y costos de adquisición |
| ⛓️ **Blockchain** | Caso de uso real en L2 (Mantle) demostrando escalabilidad y eficiencia de costos |

---

## 🏗️ Arquitectura del Sistema

Score de Barrio se compone de **4 capas independientes pero integradas**:

```
┌─────────────────────────────────────────────────────────┐
│                   DASHBOARD B2B (Next.js)                │
│              Analytics, Maps, Risk Management             │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│              BACKEND API (Node.js + Express)             │
│         Scoring Engine, Relayer, Data Management         │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│          SMART CONTRACTS (Mantle L2 Sepolia)            │
│   MerchantRegistry, SalesEventLog, Scoring Verification │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│            APP PWA (React + Vite + Tailwind)            │
│         Point of Sale, Real-time Sales Registration      │
└─────────────────────────────────────────────────────────┘
```

### 📍 Componentes Detallados

#### 1. **Smart Contracts** (`/score-de-barrio`)
Solidity contracts en **Mantle Sepolia** que actúan como fuente de verdad inmutable.

```solidity
// MerchantRegistry.sol
- Registro de comercios únicos
- Administración de claves públicas
- Historial de actividad on-chain

// SalesEventLog.sol
- Almacenamiento de agregaciones de ventas (buckets)
- Verificación de firmas del Relayer
- Eventos inmutables de transacciones
```

**Direcciones Desplegadas:**
- `MerchantRegistry`: `0x2bd8AbEB2F5598f8477560C70c742aFfc22912de`
- `SalesEventLog`: `0x7007508b1420e719D7a7A69B98765F60c7Aae759`
- **Red:** Mantle Sepolia (Chain ID: 5003)

#### 2. **Backend Relayer** (`/backend`)
Motor central que procesa ventas, calcula scores y sincroniza con blockchain.

**Características:**
- ✅ **API REST** para registro de bodegas y ventas
- ✅ **Scoring Engine**: Algoritmo dinámico de puntuación
- ✅ **Automated Relayer**: Agrega ventas en buckets de 15 min y las firma
- ✅ **Cache SQLite**: Almacenamiento local para sincronización
- ✅ **PostgreSQL**: Persistencia de scores y estadísticas

**Endpoints Principales:**
```
POST   /api/merchants              # Registrar nueva bodega
POST   /api/sales                  # Registrar venta (requiere API Key)
GET    /api/stats/:merchantId      # Consultar score y métricas
GET    /api/merchants              # Listar bodegas registradas
GET    /api/sales/:merchantId      # Historial de ventas
```

#### 3. **App PWA** (`/app`)
Aplicación ultra-ligera para punto de venta optimizada para conexiones lentas.

**Características:**
- 📱 Funciona como app nativa (PWA)
- 🔴 Soporte offline completo
- ⚡ Registro de venta en 2-3 taps
- 💾 Sincronización automática cuando hay conexión
- 🎨 Diseño responsive mobile-first

#### 4. **Dashboard B2B** (`/dashboard`)
Panel administrativo para instituciones financieras e instituciones de crédito.

**Características:**
- 📊 Visualización de scores por comercio
- 🗺️ Mapa interactivo de riesgo por distrito
- 📈 Analytics avanzados y tendencias
- ⛓️ Verificación directa contra blockchain
- 🔐 Autenticación segura

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| **Blockchain** | Mantle Network (L2), Solidity 0.8.19 | Inmutabilidad y seguridad |
| **Smart Contracts** | Foundry, OpenZeppelin Contracts | Testing y desarrollo |
| **Backend** | Node.js 18+, Express.js | API y lógica de negocio |
| **Base de Datos Local** | SQLite | Cache y sincronización |
| **Base de Datos Persistente** | PostgreSQL + Prisma | Scores y estadísticas |
| **Frontend App** | React 18, Vite, Tailwind CSS | PWA ligera |
| **Frontend Dashboard** | Next.js 14, TypeScript | Admin panel moderno |
| **Monitoreo** | PM2 | Gestión de procesos |
| **DevOps** | GitHub Codespaces, Docker | Desarrollo y despliegue |

---

## 📊 Algoritmo de Scoring

El **Score de Barrio** (0-100) se calcula dinámicamente basado en:

```
SCORE FINAL = (40% VOLUMEN) + (30% CONSISTENCIA) + (30% DIGITALIZACIÓN)
```

### Desglose:

| Factor | Peso | Cálculo |
|--------|------|---------|
| 📊 **Volumen** | 40% | Monto total de ventas normalizadas |
| 📅 **Consistencia** | 30% | Días seguidos de actividad registrada |
| 💳 **Digitalización** | 30% | % de ventas con métodos digitales |

**Ejemplo:**
- Bodeguero con 5,000 soles en ventas mensuales
- 20 días de actividad consecutiva
- 60% de ventas digitales
- **Score Resultante:** 78/100 ✅

---

## 🚀 Instalación y Configuración

### Requisitos Previos

```bash
# Verificar versiones
node --version  # v18 o superior
npm --version   # v8 o superior
```

- Billetera MetaMask o compatible con Mantle Sepolia
- Fondos en Mantle Sepolia para el Relayer (0.5 MNT mínimo)
- PostgreSQL corriendo localmente

### 1️⃣ Configurar Backend

```bash
cd backend
npm install

# Copiar y configurar variables de entorno
cp .env.example .env

# Editar .env con:
# - RELAYER_PRIVATE_KEY (billetera del Relayer)
# - DATABASE_URL (conexión PostgreSQL)
# - MANTLE_RPC_URL

# Inicializar base de datos
npx prisma generate
npx prisma db push

# Iniciar servidor
npm run dev
# ✅ Backend corriendo en http://localhost:3000
```

### 2️⃣ Lanzar App PWA

```bash
cd app
npm install
npm run dev
# ✅ App disponible en http://localhost:5173
```

### 3️⃣ Iniciar Dashboard B2B

```bash
cd dashboard
npm install
npx prisma generate
npm run dev
# ✅ Dashboard disponible en http://localhost:3001
```

### 4️⃣ Desplegar Smart Contracts (Opcional)

```bash
cd score-de-barrio
# Instalar Foundry si no lo tienes: curl -L https://foundry.paradigm.xyz | bash
source $HOME/.bashrc

# Compilar contratos
forge build

# Desplegar a Mantle Sepolia
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.sepolia.mantle.xyz \
  --private-key <YOUR_PRIVATE_KEY> \
  --broadcast
```

---

## 📝 Casos de Uso

### Caso 1: Bodeguero Registra Ventas Diarias
1. Abre la app Score de Barrio
2. Toca "Registrar Venta"
3. Selecciona Efectivo/Digital
4. Ingresa monto (50, 100, 200 soles)
5. ✅ Venta sincronizada (offline si es necesario)
6. Su score se actualiza en tiempo real

### Caso 2: Banco Consulta Riesgo Crediticio
1. Accede al Dashboard como institución financiera
2. Busca bodega por ubicación o nombre
3. Visualiza score, tendencias, historial
4. **Verifica on-chain** que los datos son auténticos
5. Toma decisión de crédito basada en datos reales

### Caso 3: Análisis Regional de Riesgo
1. Gerente de riesgos abre Dashboard
2. Activa filtro por distrito (ej: "Miraflores")
3. Visualiza mapa de calor con scores
4. Identifica oportunidades de cartera de crédito
5. Exporta reportes analíticos

---

## 🔐 Seguridad

### Medidas Implementadas

✅ **Firmas Criptográficas**: Relayer firma agregaciones con clave privada  
✅ **On-chain Verification**: Todos los datos verificables contra blockchain  
✅ **Rate Limiting**: 100 requests/minuto por API Key  
✅ **HTTPS Obligatorio**: En producción, todas las conexiones encriptadas  
✅ **Auditoría de Transacciones**: Logs inmutables en blockchain  

---

## 📈 Roadmap

### ✅ Fase 1 (Completada)
- [x] Smart Contracts en Mantle Sepolia
- [x] Backend API con Scoring Engine
- [x] App PWA funcional
- [x] Dashboard B2B básico
- [x] Sincronización On-chain automática

### 🔄 Fase 2 (En Desarrollo)
- [ ] Integración con pasarelas de pago QR
- [ ] Scoring ML basado en patrones históricos
- [ ] Multi-chain (expandir a otras L2s)

### 🎯 Fase 3 (Roadmap)
- [ ] DeFi Lending Pool: Préstamos automáticos via Smart Contracts
- [ ] Marketplace de datos: Venta de insights agregados
- [ ] Tokenización: MNT rewards por buen comportamiento crediticio
- [ ] Integración bancaria nativa

---

## 📱 URLs de Despliegue

| Componente | URL |
|-----------|-----|
| **App PWA** | https://barrio-ledger-app.vercel.app |
| **Dashboard** | https://barrio-ledger-dashboard.vercel.app |
| **Backend API** | https://barrio-ledger-backend.up.railway.app |
| **Blockchain (Mantle)** | https://sepolia.mantlescan.xyz |

---

## 📧 Contacto y Soporte

- **GitHub**: [@Gabrululu](https://github.com/Gabrululu)
- **Issues**: [Reporta bugs aquí](https://github.com/Gabrululu/Barrio-Ledger/issues)
- **Documentación**: [Ver Wiki](https://github.com/Gabrululu/Barrio-Ledger/wiki)

---

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para detalles.

---

**Desarrollado para el Mantle Global Hackathon** 🚀

*Transformando bodegas en activos financieros verificables*
