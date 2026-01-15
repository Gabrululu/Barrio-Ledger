// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MerchantRegistry} from "../src/MerchantRegistry.sol";
import {SalesEventLog} from "../src/SalesEventLog.sol";

/**
 * @title DeployScript
 * @notice Script básico para desplegar Score de Barrio en Mantle Sepolia
 * 
 * Uso:
 * forge script script/Deploy.s.sol:DeployScript \
 *   --rpc-url $MANTLE_SEPOLIA_RPC \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --legacy
 */
contract DeployScript is Script {
    
    function run() external {
        // Leer private key del .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Iniciar broadcast (transacciones reales)
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy MerchantRegistry
        console.log("========================================");
        console.log("Deploying MerchantRegistry...");
        MerchantRegistry registry = new MerchantRegistry();
        console.log("MerchantRegistry deployed at:", address(registry));
        
        // 2. Deploy SalesEventLog (requiere address del registry)
        console.log("========================================");
        console.log("Deploying SalesEventLog...");
        SalesEventLog eventLog = new SalesEventLog(registry);
        console.log("SalesEventLog deployed at:", address(eventLog));
        
        vm.stopBroadcast();
        
        // Resumen final
        console.log("\n========================================");
        console.log("=== DEPLOYMENT SUMMARY ===");
        console.log("========================================");
        console.log("Network: Mantle Sepolia");
        console.log("Chain ID: 5003");
        console.log("Explorer: https://sepolia.mantlescan.xyz");
        console.log("----------------------------------------");
        console.log("MerchantRegistry:", address(registry));
        console.log("SalesEventLog:", address(eventLog));
        console.log("----------------------------------------");
        console.log("\nSave these addresses to .env.deployed:");
        console.log('MERCHANT_REGISTRY="%s"', address(registry));
        console.log('SALES_EVENT_LOG="%s"', address(eventLog));
        console.log("\nVerify contracts with:");
        console.log("forge verify-contract --chain-id 5003 --watch <address> <contract>");
        console.log("========================================\n");
    }
}

/**
 * @title DeployAndSetupScript
 * @notice Script alternativo con setup inicial de ejemplo
 * @dev Despliega contratos + registra 3 comercios + ventas de prueba
 * 
 * Uso:
 * forge script script/Deploy.s.sol:DeployAndSetupScript \
 *   --rpc-url $MANTLE_SEPOLIA_RPC \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --legacy
 */
contract DeployAndSetupScript is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("========================================");
        console.log("Deployer address:", deployer);
        console.log("========================================");
        
        // Deploy contracts
        console.log("\n1. Deploying MerchantRegistry...");
        MerchantRegistry registry = new MerchantRegistry();
        console.log("   Deployed at:", address(registry));
        
        console.log("\n2. Deploying SalesEventLog...");
        SalesEventLog eventLog = new SalesEventLog(registry);
        console.log("   Deployed at:", address(eventLog));
        
        // Setup: Registrar 3 comercios de prueba
        console.log("\n========================================");
        console.log("3. Registering test merchants...");
        console.log("========================================");
        
        bytes32 merchant1 = keccak256(abi.encodePacked("bodega-lima-001", block.timestamp));
        registry.register(merchant1, "Bodega Don Pepe", "Miraflores, Lima");
        console.log("   Merchant 1:", vm.toString(merchant1));
        console.log("   Name: Bodega Don Pepe");
        console.log("   Location: Miraflores, Lima");
        
        bytes32 merchant2 = keccak256(abi.encodePacked("bodega-lima-002", block.timestamp + 1));
        registry.register(merchant2, "Minimarket El Sol", "San Isidro, Lima");
        console.log("\n   Merchant 2:", vm.toString(merchant2));
        console.log("   Name: Minimarket El Sol");
        console.log("   Location: San Isidro, Lima");
        
        bytes32 merchant3 = keccak256(abi.encodePacked("bodega-lima-003", block.timestamp + 2));
        registry.register(merchant3, "Bodega La Esquina", "Barranco, Lima");
        console.log("\n   Merchant 3:", vm.toString(merchant3));
        console.log("   Name: Bodega La Esquina");
        console.log("   Location: Barranco, Lima");
        
        // Setup: Registrar ventas de ejemplo para merchant1
        console.log("\n========================================");
        console.log("4. Recording sample sales...");
        console.log("========================================");
        
        uint256 currentTime = block.timestamp;
        uint256 currentBucket = currentTime / 900;
        
        // Venta actual (bucket actual)
        eventLog.recordSales(
            merchant1,
            currentTime,
            5000,  // $50.00 total
            3000,  // $30.00 efectivo (60%)
            2000,  // $20.00 digital (40%)
            8      // 8 transacciones
        );
        console.log("   Recorded for Merchant 1 (current bucket):");
        console.log("   - Bucket:", currentBucket);
        console.log("   - Total: $50.00");
        console.log("   - Cash: $30.00 (60%)");
        console.log("   - Digital: $20.00 (40%)");
        console.log("   - Transactions: 8");
        
        // Venta hace 15 minutos (bucket anterior)
        eventLog.recordSales(
            merchant1,
            currentTime - 900,
            3500,  // $35.00 total
            2100,  // $21.00 efectivo (60%)
            1400,  // $14.00 digital (40%)
            6      // 6 transacciones
        );
        console.log("\n   Recorded for Merchant 1 (15 min ago):");
        console.log("   - Bucket:", currentBucket - 1);
        console.log("   - Total: $35.00");
        console.log("   - Transactions: 6");
        
        // Venta hace 30 minutos
        eventLog.recordSales(
            merchant1,
            currentTime - 1800,
            4200,  // $42.00 total
            2520,  // $25.20 efectivo (60%)
            1680,  // $16.80 digital (40%)
            7      // 7 transacciones
        );
        console.log("\n   Recorded for Merchant 1 (30 min ago):");
        console.log("   - Bucket:", currentBucket - 2);
        console.log("   - Total: $42.00");
        console.log("   - Transactions: 7");
        
        vm.stopBroadcast();
        
        // Stats finales
        console.log("\n========================================");
        console.log("=== SETUP COMPLETE ===");
        console.log("========================================");
        console.log("Total merchants registered:", registry.getTotalMerchants());
        console.log("Total sales buckets for Merchant 1:", eventLog.getMerchantBucketCount(merchant1));
        console.log("\nContract addresses:");
        console.log("MerchantRegistry:", address(registry));
        console.log("SalesEventLog:", address(eventLog));
        console.log("\nTest merchant ID (save for testing):");
        console.log('MERCHANT_1_ID="%s"', vm.toString(merchant1));
        console.log("\nReady for testing!");
        console.log("========================================\n");
    }
}

/**
 * @title VerifyScript
 * @notice Script helper para verificar contratos en Mantlescan
 * @dev Usar después del deploy exitoso
 * 
 * Uso manual:
 * forge verify-contract --chain-id 5003 \
 *   --watch \
 *   <MERCHANT_REGISTRY_ADDRESS> \
 *   src/MerchantRegistry.sol:MerchantRegistry
 * 
 * forge verify-contract --chain-id 5003 \
 *   --constructor-args $(cast abi-encode "constructor(address)" <REGISTRY_ADDRESS>) \
 *   --watch \
 *   <SALES_EVENT_LOG_ADDRESS> \
 *   src/SalesEventLog.sol:SalesEventLog
 */
contract VerifyScript is Script {
    
    function run() external pure {
        console.log("========================================");
        console.log("=== VERIFICATION COMMANDS ===");
        console.log("========================================");
        console.log("\n1. Verify MerchantRegistry:");
        console.log("forge verify-contract --chain-id 5003 \\");
        console.log("  --watch \\");
        console.log("  <MERCHANT_REGISTRY_ADDRESS> \\");
        console.log("  src/MerchantRegistry.sol:MerchantRegistry");
        
        console.log("\n2. Verify SalesEventLog:");
        console.log("forge verify-contract --chain-id 5003 \\");
        console.log('  --constructor-args $(cast abi-encode "constructor(address)" <REGISTRY_ADDRESS>) \\');
        console.log("  --watch \\");
        console.log("  <SALES_EVENT_LOG_ADDRESS> \\");
        console.log("  src/SalesEventLog.sol:SalesEventLog");
        
        console.log("\n========================================");
    }
}