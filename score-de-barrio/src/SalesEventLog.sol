// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MerchantRegistry} from "./MerchantRegistry.sol";

/**
 * @title SalesEventLog
 * @notice Registro de eventos de ventas agregados por buckets de tiempo (15 min)
 * @dev Los datos son pseudonimizados y agregados para compliance
 * 
 * Características:
 * - Agregación por buckets de 15 minutos
 * - Batch recording para eficiencia de gas
 * - Estadísticas on-chain (totales, promedios, mix cash/digital)
 * - Validaciones completas de datos
 * - Compatible con compliance (datos pseudonimizados)
 */
contract SalesEventLog {
    
    // ============ State Variables ============
    
    /// @notice Referencia al registro de comercios
    MerchantRegistry public immutable REGISTRY;
    
    /// @notice Duración de cada bucket en segundos (15 minutos)
    uint256 public constant BUCKET_DURATION = 900; // 15 * 60
    
    /// @notice Datos de ventas por comercio y bucket de tiempo
    /// @dev merchantId => bucket => SalesBucket
    mapping(bytes32 => mapping(uint256 => SalesBucket)) public salesData;
    
    /// @notice Tracking de buckets registrados por comercio para consultas
    /// @dev merchantId => array de buckets
    mapping(bytes32 => uint256[]) private merchantBuckets;
    
    // ============ Structs ============
    
    struct SalesBucket {
        uint256 totalAmount;    // Monto total en centavos (ej: $25.50 = 2550)
        uint256 cashAmount;     // Efectivo
        uint256 digitalAmount;  // Yape/Plin/tarjeta
        uint8 txCount;          // Número de transacciones
        bool exists;            // Flag para saber si el bucket fue registrado
    }
    
    struct SalesStats {
        uint256 totalSales;         // Suma de ventas en el período
        uint256 totalTransactions;  // Total de transacciones
        uint256 averageTicket;      // Ticket promedio
        uint256 cashPercentage;     // % en efectivo (0-100)
        uint256 digitalPercentage;  // % digital (0-100)
    }
    
    // ============ Events ============
    
    event SalesRecorded(
        bytes32 indexed merchantId,
        uint256 indexed timestampBucket,
        uint256 totalAmount,
        uint256 cashAmount,
        uint256 digitalAmount,
        uint8 txCount,
        uint256 recordedAt
    );
    
    // ============ Errors ============
    
    error NotMerchantOwner();
    error InvalidAmount();
    error InvalidTimestamp();
    error MerchantNotActive();
    error BucketAlreadyExists();
    
    // ============ Constructor ============
    
    constructor(MerchantRegistry _registry) {
        REGISTRY = _registry;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Registra un bucket de ventas agregadas
     * @param merchantId ID del comercio
     * @param timestamp Timestamp de referencia (se convertirá a bucket)
     * @param totalAmount Monto total en centavos
     * @param cashAmount Monto en efectivo
     * @param digitalAmount Monto digital
     * @param txCount Número de transacciones
     * 
     * @dev Validaciones:
     *      - Solo el owner del comercio puede registrar
     *      - Comercio debe estar activo
     *      - totalAmount = cashAmount + digitalAmount
     *      - timestamp no puede ser futuro
     *      - txCount > 0
     *      - No permite duplicar buckets
     */
    function recordSales(
        bytes32 merchantId,
        uint256 timestamp,
        uint256 totalAmount,
        uint256 cashAmount,
        uint256 digitalAmount,
        uint8 txCount
    ) external {
        // Validaciones
        if (REGISTRY.merchantOwner(merchantId) != msg.sender) revert NotMerchantOwner();
        if (!REGISTRY.isActive(merchantId)) revert MerchantNotActive();
        if (totalAmount != cashAmount + digitalAmount) revert InvalidAmount();
        if (timestamp > block.timestamp) revert InvalidTimestamp();
        if (txCount == 0) revert InvalidAmount();
        
        // Calcular bucket
        uint256 bucket = timestamp / BUCKET_DURATION;
        
        // Evitar duplicados
        if (salesData[merchantId][bucket].exists) revert BucketAlreadyExists();
        
        // Guardar datos
        salesData[merchantId][bucket] = SalesBucket({
            totalAmount: totalAmount,
            cashAmount: cashAmount,
            digitalAmount: digitalAmount,
            txCount: txCount,
            exists: true
        });
        
        merchantBuckets[merchantId].push(bucket);
        
        emit SalesRecorded(
            merchantId,
            bucket,
            totalAmount,
            cashAmount,
            digitalAmount,
            txCount,
            block.timestamp
        );
    }
    
    /**
     * @notice Registra múltiples buckets en una sola transacción
     * @param merchantId ID del comercio
     * @param timestamps Array de timestamps
     * @param totalAmounts Array de montos totales
     * @param cashAmounts Array de montos en efectivo
     * @param digitalAmounts Array de montos digitales
     * @param txCounts Array de conteos de transacciones
     * 
     * @dev Ahorra gas al registrar múltiples períodos de una vez
     *      Skip automático de buckets duplicados (no revierte)
     *      Todos los arrays deben tener la misma longitud
     */
    function recordSalesBatch(
        bytes32 merchantId,
        uint256[] calldata timestamps,
        uint256[] calldata totalAmounts,
        uint256[] calldata cashAmounts,
        uint256[] calldata digitalAmounts,
        uint8[] calldata txCounts
    ) external {
        if (REGISTRY.merchantOwner(merchantId) != msg.sender) revert NotMerchantOwner();
        if (!REGISTRY.isActive(merchantId)) revert MerchantNotActive();
        
        uint256 length = timestamps.length;
        require(
            length == totalAmounts.length &&
            length == cashAmounts.length &&
            length == digitalAmounts.length &&
            length == txCounts.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < length; i++) {
            if (totalAmounts[i] != cashAmounts[i] + digitalAmounts[i]) revert InvalidAmount();
            if (timestamps[i] > block.timestamp) revert InvalidTimestamp();
            if (txCounts[i] == 0) revert InvalidAmount();
            
            uint256 bucket = timestamps[i] / BUCKET_DURATION;
            
            // Skip duplicates en batch
            if (salesData[merchantId][bucket].exists) continue;
            
            salesData[merchantId][bucket] = SalesBucket({
                totalAmount: totalAmounts[i],
                cashAmount: cashAmounts[i],
                digitalAmount: digitalAmounts[i],
                txCount: txCounts[i],
                exists: true
            });
            
            merchantBuckets[merchantId].push(bucket);
            
            emit SalesRecorded(
                merchantId,
                bucket,
                totalAmounts[i],
                cashAmounts[i],
                digitalAmounts[i],
                txCounts[i],
                block.timestamp
            );
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Obtiene datos de un bucket específico
     * @param merchantId ID del comercio
     * @param bucket Número de bucket
     * @return SalesBucket Datos del bucket
     */
    function getSalesBucket(bytes32 merchantId, uint256 bucket) 
        external 
        view 
        returns (SalesBucket memory) 
    {
        return salesData[merchantId][bucket];
    }
    
    /**
     * @notice Calcula el bucket actual
     * @return uint256 Número de bucket actual
     */
    function getCurrentBucket() external view returns (uint256) {
        return block.timestamp / BUCKET_DURATION;
    }
    
    /**
     * @notice Convierte timestamp a bucket
     * @param timestamp Timestamp en segundos
     * @return uint256 Número de bucket
     */
    function getBucketFromTimestamp(uint256 timestamp) external pure returns (uint256) {
        return timestamp / BUCKET_DURATION;
    }
    
    /**
     * @notice Obtiene estadísticas agregadas de un comercio en un rango de tiempo
     * @param merchantId ID del comercio
     * @param startBucket Bucket de inicio
     * @param endBucket Bucket de fin (inclusive)
     * @return stats Estadísticas calculadas
     * 
     * @dev Útil para calcular scores y analytics
     *      Itera sobre el rango completo de buckets
     *      Ignora buckets sin datos
     */
    function getSalesStats(
        bytes32 merchantId,
        uint256 startBucket,
        uint256 endBucket
    ) external view returns (SalesStats memory stats) {
        uint256 totalSales = 0;
        uint256 totalTx = 0;
        uint256 totalCash = 0;
        uint256 totalDigital = 0;
        
        for (uint256 bucket = startBucket; bucket <= endBucket; bucket++) {
            SalesBucket memory b = salesData[merchantId][bucket];
            if (b.exists) {
                totalSales += b.totalAmount;
                totalTx += b.txCount;
                totalCash += b.cashAmount;
                totalDigital += b.digitalAmount;
            }
        }
        
        stats.totalSales = totalSales;
        stats.totalTransactions = totalTx;
        stats.averageTicket = totalTx > 0 ? totalSales / totalTx : 0;
        stats.cashPercentage = totalSales > 0 ? (totalCash * 100) / totalSales : 0;
        stats.digitalPercentage = totalSales > 0 ? (totalDigital * 100) / totalSales : 0;
        
        return stats;
    }
    
    /**
     * @notice Retorna todos los buckets registrados por un comercio
     * @param merchantId ID del comercio
     * @return uint256[] Array de números de bucket
     * 
     * @dev Puede ser grande si el comercio tiene muchos días registrados
     *      Considerar usar paginación en frontend
     */
    function getMerchantBuckets(bytes32 merchantId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return merchantBuckets[merchantId];
    }
    
    /**
     * @notice Retorna cantidad de buckets registrados
     * @param merchantId ID del comercio
     * @return uint256 Cantidad de buckets
     */
    function getMerchantBucketCount(bytes32 merchantId) external view returns (uint256) {
        return merchantBuckets[merchantId].length;
    }
}