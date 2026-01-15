// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MerchantRegistry
 * @notice Registro de comercios usando IDs anonimizados (hash de teléfono + salt)
 * @dev Permite un comercio por wallet, pero un wallet puede registrar múltiples comercios
 * 
 * Características:
 * - Sistema de registro anonimizado con bytes32 IDs
 * - Permite múltiples comercios por wallet
 * - Tracking de ubicación y metadata
 * - Sistema de activación/desactivación
 * - Paginación para consultas eficientes
 */
contract MerchantRegistry {
    
    // ============ State Variables ============
    
    /// @notice Mapeo de merchantId a la wallet que lo controla
    mapping(bytes32 => address) public merchantOwner;
    
    /// @notice Mapeo de merchantId a metadata básica
    mapping(bytes32 => MerchantInfo) public merchants;
    
    /// @notice Lista de todos los merchantIds registrados
    bytes32[] public allMerchants;
    
    /// @notice Timestamp de registro de cada comercio
    mapping(bytes32 => uint256) public registrationTime;
    
    // ============ Structs ============
    
    struct MerchantInfo {
        bool isActive;
        string businessName; // Opcional: nombre del negocio (público)
        string location;     // Opcional: barrio/distrito (para analytics)
        uint256 registeredAt;
    }
    
    // ============ Events ============
    
    event MerchantRegistered(
        bytes32 indexed merchantId,
        address indexed owner,
        string businessName,
        string location,
        uint256 timestamp
    );
    
    event MerchantUpdated(
        bytes32 indexed merchantId,
        string businessName,
        string location
    );
    
    event MerchantDeactivated(bytes32 indexed merchantId);
    
    // ============ Errors ============
    
    error MerchantAlreadyExists();
    error MerchantNotFound();
    error NotMerchantOwner();
    error InvalidMerchantId();
    
    // ============ External Functions ============
    
    /**
     * @notice Registra un nuevo comercio
     * @param merchantId Hash anonimizado (keccak256(phone + salt))
     * @param businessName Nombre del negocio (opcional, puede ser "")
     * @param location Barrio/distrito (opcional, para analytics B2B)
     * 
     * @dev El merchantId debe ser único y no puede ser bytes32(0)
     *      Una wallet puede registrar múltiples comercios
     */
    function register(
        bytes32 merchantId,
        string calldata businessName,
        string calldata location
    ) external {
        if (merchantId == bytes32(0)) revert InvalidMerchantId();
        if (merchantOwner[merchantId] != address(0)) revert MerchantAlreadyExists();
        
        merchantOwner[merchantId] = msg.sender;
        merchants[merchantId] = MerchantInfo({
            isActive: true,
            businessName: businessName,
            location: location,
            registeredAt: block.timestamp
        });
        
        allMerchants.push(merchantId);
        registrationTime[merchantId] = block.timestamp;
        
        emit MerchantRegistered(merchantId, msg.sender, businessName, location, block.timestamp);
    }
    
    /**
     * @notice Actualiza información del comercio
     * @param merchantId ID del comercio
     * @param businessName Nuevo nombre
     * @param location Nueva ubicación
     * 
     * @dev Solo el owner del comercio puede actualizarlo
     */
    function updateMerchant(
        bytes32 merchantId,
        string calldata businessName,
        string calldata location
    ) external {
        if (merchantOwner[merchantId] != msg.sender) revert NotMerchantOwner();
        
        MerchantInfo storage merchant = merchants[merchantId];
        merchant.businessName = businessName;
        merchant.location = location;
        
        emit MerchantUpdated(merchantId, businessName, location);
    }
    
    /**
     * @notice Desactiva un comercio (no elimina datos históricos)
     * @param merchantId ID del comercio
     * 
     * @dev Los datos del comercio se mantienen pero isActive = false
     *      Esto evita que pueda registrar nuevas ventas
     */
    function deactivateMerchant(bytes32 merchantId) external {
        if (merchantOwner[merchantId] != msg.sender) revert NotMerchantOwner();
        
        merchants[merchantId].isActive = false;
        
        emit MerchantDeactivated(merchantId);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Verifica si un comercio está activo
     * @param merchantId ID del comercio
     * @return bool True si está activo
     */
    function isActive(bytes32 merchantId) external view returns (bool) {
        return merchants[merchantId].isActive;
    }
    
    /**
     * @notice Obtiene info completa de un comercio
     * @param merchantId ID del comercio
     * @return MerchantInfo Struct con toda la información
     */
    function getMerchantInfo(bytes32 merchantId) external view returns (MerchantInfo memory) {
        if (merchantOwner[merchantId] == address(0)) revert MerchantNotFound();
        return merchants[merchantId];
    }
    
    /**
     * @notice Retorna cantidad total de comercios registrados
     * @return uint256 Total de comercios
     */
    function getTotalMerchants() external view returns (uint256) {
        return allMerchants.length;
    }
    
    /**
     * @notice Retorna lista paginada de merchantIds
     * @param offset Índice de inicio (ej: 0 para primera página)
     * @param limit Cantidad de resultados por página (ej: 10)
     * @return bytes32[] Array de merchantIds
     * 
     * @dev Útil para dashboards B2B que necesitan listar comercios
     *      Ejemplo: getMerchantsPaginated(0, 10) -> primeros 10
     *               getMerchantsPaginated(10, 10) -> siguientes 10
     */
    function getMerchantsPaginated(uint256 offset, uint256 limit) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        uint256 total = allMerchants.length;
        if (offset >= total) return new bytes32[](0);
        
        uint256 end = offset + limit;
        if (end > total) end = total;
        
        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allMerchants[i];
        }
        
        return result;
    }
}