# 🎉 Score de Barrio

**Fecha:** Enero, 2026  
**Network:** Mantle Sepolia Testnet (Chain ID: 5003)  
**Deployer:** `0x3B0eB4BD67d7243a4DBe684e9c922D9c3919AFbf`

---

## 📝 Contratos Deployados

### 1. MerchantRegistry
**Address:** `0x2bd8AbEB2F5598f8477560C70c742aFfc22912de`  
**Transaction:** `0x467d7fa0d03a95d23258e0ef1e34095a64b5c48cc99ba94f843a3c16113ebc33`  
**Block:** 33367597  
**Gas Used:** 2,664,790,635 gas  
**Cost:** 0.0536 MNT

**Explorer:**
```
https://sepolia.mantlescan.xyz/address/0x2bd8AbEB2F5598f8477560C70c742aFfc22912de
```

---

### 2. SalesEventLog
**Address:** `0x7007508b1420e719D7a7A69B98765F60c7Aae759`  
**Transaction:** `0x3d7bb3ab0d3d16ede4a0bed20fb4d72422581d3ec9631e30e65ac05118044290`  
**Block:** 33367599  
**Gas Used:** 2,747,095,049 gas  
**Cost:** 0.0552 MNT

**Explorer:**
```
https://sepolia.mantlescan.xyz/address/0x7007508b1420e719D7a7A69B98765F60c7Aae759
```

---

## 🏪 Comercios de Prueba Registrados

### Merchant 1: Bodega Don Pepe
**ID:** `0x2656351973460bed76c490c9f68544c55766ecb607108c75b7838f91320fdd62`  
**Ubicación:** Miraflores, Lima  
**Transaction:** `0x5250ea05b4bea58e503b6f3390535cec72f9f518dd5b664928f347e644f065d4`  
**Block:** 33367601

**Ventas Registradas:** 3 buckets
- Bucket 1964755: $50.00 (8 transacciones, 60% cash, 40% digital)
- Bucket 1964754: $35.00 (6 transacciones)
- Bucket 1964753: $42.00 (7 transacciones)

**Total:** $127.00 en 21 transacciones

---

### Merchant 2: Minimarket El Sol
**ID:** `0x2af4dce4d5c460d05f4f97082fe9d3291b9979f151fc62338f248640ad5048ef`  
**Ubicación:** San Isidro, Lima  
**Transaction:** `0x7b4197e3849f1d6c654f36d24b12255e6a87fba96d08277d63d3fc6d594cfc6d`  
**Block:** 33367604

---

### Merchant 3: Bodega La Esquina
**ID:** `0xec96807dd5076540cc85a99f4d3b497cff2935c1e5a11fe4cebefc9f950e0abb`  
**Ubicación:** Barranco, Lima  
**Transaction:** `0xcab89a9762b0d30f5b37b2151e543262e821aaf95a644b1dd46edaffdd287699`  
**Block:** 33367606

---

## 💰 Costo Total del Deploy

| Operación | Gas Used | Cost (MNT) | TX Hash |
|-----------|----------|------------|---------|
| Deploy MerchantRegistry | 2,664,790,635 | 0.0536 | 0x467d7fa... |
| Deploy SalesEventLog | 2,747,095,049 | 0.0552 | 0x3d7bb3a... |
| Register Merchant 1 | 679,970,968 | 0.0137 | 0x5250ea0... |
| Register Merchant 2 | 623,715,955 | 0.0125 | 0x7b4197e... |
| Register Merchant 3 | 623,582,246 | 0.0125 | 0xcab89a9... |
| Record Sales (3x) | 1,549,844,628 | 0.0312 | 0x64b942c... |
| **TOTAL** | **8,888,999,481** | **0.1787 MNT** | |

**Gas Price:** 0.0201 gwei  
**Total Cost:** ~$0.003 USD (estimado)

---

## 📊 Estado Actual On-Chain

### Total de Comercios Registrados: 3
- ✅ Bodega Don Pepe (Miraflores)
- ✅ Minimarket El Sol (San Isidro)
- ✅ Bodega La Esquina (Barranco)

### Total de Ventas Registradas: 3 buckets
- Merchant 1: 3 períodos de ventas ($127.00 total)
- Merchant 2: Sin ventas aún
- Merchant 3: Sin ventas aún

---

## 🔗 Links Importantes

### Explorers
```bash
# MerchantRegistry
https://sepolia.mantlescan.xyz/address/0x2bd8AbEB2F5598f8477560C70c742aFfc22912de

# SalesEventLog
https://sepolia.mantlescan.xyz/address/0x7007508b1420e719D7a7A69B98765F60c7Aae759

# Deployer Address
https://sepolia.mantlescan.xyz/address/0x3B0eB4BD67d7243a4DBe684e9c922D9c3919AFbf
```

### Transaction Files
```bash
# Broadcast data
/workspaces/Barrio-Ledger/score-de-barrio/broadcast/Deploy.s.sol/5003/run-latest.json

# Sensitive data (cache)
/workspaces/Barrio-Ledger/score-de-barrio/cache/Deploy.s.sol/5003/run-latest.json
```

---

## 🧪 Testing Quick Commands

### Read Operations (Free)
```bash
# Get total merchants
cast call 0x2bd8AbEB2F5598f8477560C70c742aFfc22912de \
  "getTotalMerchants()" \
  --rpc-url https://rpc.sepolia.mantle.xyz

# Get merchant info
cast call 0x2bd8AbEB2F5598f8477560C70c742aFfc22912de \
  "getMerchantInfo(bytes32)" \
  0x2656351973460bed76c490c9f68544c55766ecb607108c75b7838f91320fdd62 \
  --rpc-url https://rpc.sepolia.mantle.xyz

# Get sales bucket
cast call 0x7007508b1420e719D7a7A69B98765F60c7Aae759 \
  "getSalesBucket(bytes32,uint256)" \
  0x2656351973460bed76c490c9f68544c55766ecb607108c75b7838f91320fdd62 \
  1964755 \
  --rpc-url https://rpc.sepolia.mantle.xyz
```

### Write Operations (Costs Gas)
```bash
# Register a new merchant
cast send 0x2bd8AbEB2F5598f8477560C70c742aFfc22912de \
  "register(bytes32,string,string)" \
  $(cast keccak "my-bodega-$(date +%s)") \
  "Mi Bodega Nueva" \
  "Lima Centro" \
  --rpc-url https://rpc.sepolia.mantle.xyz \
  --private-key $PRIVATE_KEY \
  --legacy

# Record sales
cast send 0x7007508b1420e719D7a7A69B98765F60c7Aae759 \
  "recordSales(bytes32,uint256,uint256,uint256,uint256,uint8)" \
  0x2656351973460bed76c490c9f68544c55766ecb607108c75b7838f91320fdd62 \
  $(date +%s) \
  10000 \
  6000 \
  4000 \
  15 \
  --rpc-url https://rpc.sepolia.mantle.xyz \
  --private-key $PRIVATE_KEY \
  --legacy
```

---

## 📚 Recursos

- **Mantle Docs:** https://docs.mantle.xyz
- **Explorer:** https://sepolia.mantlescan.xyz
- **RPC:** https://rpc.sepolia.mantle.xyz
- **GitHub:** https://github.com/Gabrululu/Barrio-Ledger

---

## 🎓 Lecciones del Deploy

1. ✅ **Gas muy económico en Mantle:** ~0.18 MNT para todo el deploy
2. ✅ **Foundry es poderoso:** Deploy + setup en un solo comando
3. ✅ **Datos de prueba útiles:** Tener comercios pre-registrados facilita testing
4. ✅ **Logs detallados:** Los scripts con console.log ayudan mucho

---

**¡Felicitaciones!** 🎉 Tu proyecto Score de Barrio está vivo en Mantle Sepolia.