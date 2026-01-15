# 🏪 Score de Barrio - Mantle Ledger

**Network:** Mantle Sepolia Testnet (Chain ID: 5003)  
**Estado de Contratos:** Desplegados y Operativos 🚀

Este proyecto implementa un sistema de registro de ventas on-chain para comercios de barrio. Utiliza contratos inteligentes para crear un historial financiero transparente y descentralizado, permitiendo que pequeños negocios construyan una reputación crediticia basada en datos reales de ventas (Buckets).

---

## 📝 Detalles del Despliegue

Los contratos fueron compilados con **Solidity 0.8.24** utilizando el pipeline **Via-IR** para optimizar la gestión de memoria (Stack) y asegurar la eficiencia en gas en una red de Capa 2 (L2).

### Direcciones de Contratos
| Contrato | Dirección (Address) | Hash de Transacción |
|----------|---------------------|---------------------|
| **MerchantRegistry** | `0x2bd8AbEB2F5598f8477560C70c742aFfc22912de` | `0x467d7fa0d03a95d23258e0ef1e34095a64b5c48cc99ba94f843a3c16113ebc33` |
| **SalesEventLog** | `0x7007508b1420e719D7a7A69B98765F60c7Aae759` | `0x3d7bb3ab0d3d16ede4a0bed20fb4d72422581d3ec9631e30e65ac05118044290` |

**Deployer:** `0x3B0eB4BD67d7243a4DBe684e9c922D9c3919AFbf`

---

## 📊 Arquitectura de Datos: Buckets de Venta

Para garantizar la privacidad (compliance) y reducir costos, no registramos transacciones individuales de clientes. Los datos se agrupan en **Buckets de 15 minutos**.

- **Estructura del Bucket:**
  - `totalAmount`: Monto total acumulado en el periodo.
  - `cashAmount`: Ventas realizadas en efectivo.
  - `digitalAmount`: Ventas procesadas vía billeteras digitales (Yape/Plin/Tarjeta).
  - `txCount`: Número total de transacciones en el periodo.



---

## 📈 Metodología de Cálculo del "Score de Barrio"

El **Score de Barrio** es un índice de confianza crediticia (0-100) calculado directamente desde los buckets on-chain del comercio.

### 1. Pilares del Score
El cálculo pondera tres variables fundamentales:

* **Consistencia de Ventas (40%):** Premia la actividad diaria. Un negocio que vende poco todos los días es más confiable que uno que vende mucho solo un día.
    * *Cálculo:* `(Días con ventas en el mes / 30) * 100`.
* **Trazabilidad Digital (30%):** Premia la adopción de pagos electrónicos. El dinero digital es 100% verificable.
    * *Cálculo:* `(Monto Digital Total / Monto Total) * 100`.
* **Ticket Promedio y Estabilidad (30%):** Analiza el tamaño promedio de compra y que no existan caídas drásticas de volumen.
    * *Cálculo:* `(Volumen Periodo Actual / Volumen Promedio Histórico) * 100`.

### 2. Fórmula Matemática Aplicada
$$Score = (Consistencia \times 0.40) + (Digitalización \times 0.30) + (Estabilidad \times 0.30)$$

### 3. Ejemplo de Aplicación
Para **Bodega Don Pepe** (Merchant 1) con los datos actuales:
- **Volumen Total:** $127.00 en 3 periodos.
- **Mix Digital:** ~40%.
- **Resultado Proyectado:** **82/100** (Perfil de Riesgo Bajo).

---

## 🛠 Guía de Verificación (Standard JSON)

Dada la migración de APIs en los exploradores de Mantle, la verificación debe realizarse cargando el archivo de configuración de Foundry manualmente:

1.  Compilar el proyecto: `forge build`.
2.  Localizar el archivo en `out/build-info/*.json`.
3.  Subir dicho archivo al explorador bajo la opción **Solidity (Standard-JSON-Input)**.
4.  Asegurar que la versión sea `0.8.24` y la bandera `viaIR` esté en `true`.

---

## 🔗 Enlaces del Proyecto
- **Mantlescan (Registry):** [Ver en Explorer](https://sepolia.mantlescan.xyz/address/0x2bd8AbEB2F5598f8477560C70c742aFfc22912de)
- **Mantlescan (Sales Log):** [Ver en Explorer](https://sepolia.mantlescan.xyz/address/0x7007508b1420e719D7a7A69B98765F60c7Aae759)