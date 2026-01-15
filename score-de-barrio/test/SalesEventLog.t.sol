// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MerchantRegistry} from "../src/MerchantRegistry.sol";
import {SalesEventLog} from "../src/SalesEventLog.sol";

/**
 * @title SalesEventLogTest
 * @notice Suite completa de tests para SalesEventLog
 * @dev 15+ tests cubriendo todos los casos de uso y errores
 */
contract SalesEventLogTest is Test {
    MerchantRegistry public registry;
    SalesEventLog public eventLog;
    
    address public merchant1 = address(0x1);
    address public merchant2 = address(0x2);
    address public unauthorized = address(0x999);
    
    bytes32 public merchantId1;
    bytes32 public merchantId2;
    
    function setUp() public {
        // Deploy contracts
        registry = new MerchantRegistry();
        eventLog = new SalesEventLog(registry);
        
        // Setup merchant IDs
        merchantId1 = keccak256("merchant-1");
        merchantId2 = keccak256("merchant-2");
        
        // Register merchants
        vm.prank(merchant1);
        registry.register(merchantId1, "Bodega Test 1", "Lima Centro");
        
        vm.prank(merchant2);
        registry.register(merchantId2, "Bodega Test 2", "Miraflores");
    }
    
    // ============================================
    // Test: Basic Sales Recording
    // ============================================
    
    function testRecordSales() public {
        uint256 timestamp = block.timestamp;
        
        vm.prank(merchant1);
        eventLog.recordSales(
            merchantId1,
            timestamp,
            5000,  // $50.00
            3000,  // $30.00 cash
            2000,  // $20.00 digital
            10     // 10 transactions
        );
        
        uint256 bucket = timestamp / 900;
        SalesEventLog.SalesBucket memory sales = eventLog.getSalesBucket(merchantId1, bucket);
        
        assertEq(sales.totalAmount, 5000);
        assertEq(sales.cashAmount, 3000);
        assertEq(sales.digitalAmount, 2000);
        assertEq(sales.txCount, 10);
        assertTrue(sales.exists);
    }
    
    function testRecordSalesEmitsEvent() public {
        uint256 timestamp = block.timestamp;
        uint256 bucket = timestamp / 900;
        
        vm.expectEmit(true, true, false, true);
        emit SalesEventLog.SalesRecorded(
            merchantId1,
            bucket,
            1000,
            500,
            500,
            1,
            block.timestamp
        );
        
        vm.prank(merchant1);
        eventLog.recordSales(merchantId1, timestamp, 1000, 500, 500, 1);
    }
    
    // ============================================
    // Test: Authorization & Permissions
    // ============================================
    
    function testCannotRecordFromNonOwner() public {
        vm.prank(unauthorized);
        vm.expectRevert(SalesEventLog.NotMerchantOwner.selector);
        
        eventLog.recordSales(merchantId1, block.timestamp, 1000, 500, 500, 1);
    }
    
    function testCannotRecordFromWrongMerchantOwner() public {
        vm.prank(merchant2); // merchant2 trying to record for merchant1
        vm.expectRevert(SalesEventLog.NotMerchantOwner.selector);
        
        eventLog.recordSales(merchantId1, block.timestamp, 1000, 500, 500, 1);
    }
    
    // ============================================
    // Test: Data Validation
    // ============================================
    
    function testCannotRecordInvalidAmount() public {
        vm.prank(merchant1);
        vm.expectRevert(SalesEventLog.InvalidAmount.selector);
        
        // Total (1000) != cash (300) + digital (500)
        eventLog.recordSales(merchantId1, block.timestamp, 1000, 300, 500, 1);
    }
    
    function testCannotRecordFutureTimestamp() public {
        vm.prank(merchant1);
        vm.expectRevert(SalesEventLog.InvalidTimestamp.selector);
        
        eventLog.recordSales(
            merchantId1,
            block.timestamp + 1000, // Future timestamp
            1000,
            500,
            500,
            1
        );
    }
    
    function testCannotRecordZeroTransactions() public {
        vm.prank(merchant1);
        vm.expectRevert(SalesEventLog.InvalidAmount.selector);
        
        eventLog.recordSales(merchantId1, block.timestamp, 1000, 500, 500, 0);
    }
    
    function testCannotRecordDuplicateBucket() public {
        uint256 timestamp = block.timestamp;
        
        vm.startPrank(merchant1);
        
        // First recording
        eventLog.recordSales(merchantId1, timestamp, 1000, 500, 500, 1);
        
        // Try to record same bucket
        vm.expectRevert(SalesEventLog.BucketAlreadyExists.selector);
        eventLog.recordSales(merchantId1, timestamp, 2000, 1000, 1000, 2);
        
        vm.stopPrank();
    }
    
    // ============================================
    // Test: Batch Recording
    // ============================================
    
    function testRecordSalesBatch() public {
        // Warp to a reasonable timestamp to avoid underflow
        vm.warp(10000);
        
        uint256[] memory timestamps = new uint256[](3);
        timestamps[0] = block.timestamp;
        timestamps[1] = block.timestamp - 900;
        timestamps[2] = block.timestamp - 1800;
        
        uint256[] memory totals = new uint256[](3);
        totals[0] = 1000;
        totals[1] = 2000;
        totals[2] = 1500;
        
        uint256[] memory cash = new uint256[](3);
        cash[0] = 600;
        cash[1] = 1200;
        cash[2] = 900;
        
        uint256[] memory digital = new uint256[](3);
        digital[0] = 400;
        digital[1] = 800;
        digital[2] = 600;
        
        uint8[] memory counts = new uint8[](3);
        counts[0] = 5;
        counts[1] = 10;
        counts[2] = 7;
        
        vm.prank(merchant1);
        eventLog.recordSalesBatch(
            merchantId1,
            timestamps,
            totals,
            cash,
            digital,
            counts
        );
        
        // Verify first bucket
        uint256 bucket0 = timestamps[0] / 900;
        SalesEventLog.SalesBucket memory sales0 = eventLog.getSalesBucket(merchantId1, bucket0);
        assertEq(sales0.totalAmount, 1000);
        assertEq(sales0.txCount, 5);
        
        // Verify bucket count
        assertEq(eventLog.getMerchantBucketCount(merchantId1), 3);
    }
    
    function testRecordSalesBatchSkipsDuplicates() public {
        // Warp to avoid underflow
        vm.warp(10000);
        
        uint256 timestamp = block.timestamp;
        
        // Record one bucket manually
        vm.prank(merchant1);
        eventLog.recordSales(merchantId1, timestamp, 1000, 500, 500, 1);
        
        // Try to batch with same bucket (should skip, not revert)
        uint256[] memory timestamps = new uint256[](2);
        timestamps[0] = timestamp; // Duplicate
        timestamps[1] = timestamp - 900; // New
        
        uint256[] memory totals = new uint256[](2);
        totals[0] = 2000;
        totals[1] = 3000;
        
        uint256[] memory cash = new uint256[](2);
        cash[0] = 1000;
        cash[1] = 1500;
        
        uint256[] memory digital = new uint256[](2);
        digital[0] = 1000;
        digital[1] = 1500;
        
        uint8[] memory counts = new uint8[](2);
        counts[0] = 2;
        counts[1] = 3;
        
        vm.prank(merchant1);
        eventLog.recordSalesBatch(merchantId1, timestamps, totals, cash, digital, counts);
        
        // Should have 2 buckets total (1 original + 1 new from batch)
        assertEq(eventLog.getMerchantBucketCount(merchantId1), 2);
    }
    
    // ============================================
    // Test: Statistics Calculation
    // ============================================
    
    function testGetSalesStats() public {
        // Warp to avoid underflow
        vm.warp(10000);
        
        // Record sales across 3 buckets
        uint256 time0 = block.timestamp;
        uint256 time1 = time0 - 900;
        uint256 time2 = time0 - 1800;
        
        vm.startPrank(merchant1);
        
        eventLog.recordSales(merchantId1, time0, 1000, 600, 400, 5);
        eventLog.recordSales(merchantId1, time1, 2000, 1200, 800, 10);
        eventLog.recordSales(merchantId1, time2, 1500, 900, 600, 7);
        
        vm.stopPrank();
        
        // Calculate stats for all 3 buckets
        uint256 bucket0 = time0 / 900;
        uint256 bucket2 = time2 / 900;
        
        SalesEventLog.SalesStats memory stats = eventLog.getSalesStats(
            merchantId1,
            bucket2,
            bucket0
        );
        
        // Total: 1000 + 2000 + 1500 = 4500
        assertEq(stats.totalSales, 4500);
        
        // Transactions: 5 + 10 + 7 = 22
        assertEq(stats.totalTransactions, 22);
        
        // Average ticket: 4500 / 22 = 204
        assertEq(stats.averageTicket, 204);
        
        // Cash: 600 + 1200 + 900 = 2700 (60%)
        assertEq(stats.cashPercentage, 60);
        
        // Digital: 400 + 800 + 600 = 1800 (40%)
        assertEq(stats.digitalPercentage, 40);
    }
    
    function testGetSalesStatsEmptyRange() public view {
        uint256 futureBucket = (block.timestamp + 10000) / 900;
        
        SalesEventLog.SalesStats memory stats = eventLog.getSalesStats(
            merchantId1,
            futureBucket,
            futureBucket + 10
        );
        
        assertEq(stats.totalSales, 0);
        assertEq(stats.totalTransactions, 0);
        assertEq(stats.averageTicket, 0);
        assertEq(stats.cashPercentage, 0);
        assertEq(stats.digitalPercentage, 0);
    }
    
    // ============================================
    // Test: Bucket Management
    // ============================================
    
    function testGetCurrentBucket() public view {
        uint256 currentBucket = eventLog.getCurrentBucket();
        uint256 expectedBucket = block.timestamp / 900;
        assertEq(currentBucket, expectedBucket);
    }
    
    function testGetBucketFromTimestamp() public view {
        uint256 timestamp = 1704067200; // Jan 1, 2024, 00:00:00 UTC
        uint256 expectedBucket = timestamp / 900;
        uint256 actualBucket = eventLog.getBucketFromTimestamp(timestamp);
        assertEq(actualBucket, expectedBucket);
    }
    
    function testGetMerchantBuckets() public {
        // Warp to avoid underflow
        vm.warp(10000);
        
        vm.startPrank(merchant1);
        
        uint256 time1 = block.timestamp;
        uint256 time2 = block.timestamp - 900;
        uint256 time3 = block.timestamp - 1800;
        
        eventLog.recordSales(merchantId1, time1, 1000, 500, 500, 1);
        eventLog.recordSales(merchantId1, time2, 2000, 1000, 1000, 2);
        eventLog.recordSales(merchantId1, time3, 1500, 750, 750, 3);
        
        vm.stopPrank();
        
        uint256[] memory buckets = eventLog.getMerchantBuckets(merchantId1);
        assertEq(buckets.length, 3);
        
        // Verify bucket count matches
        assertEq(eventLog.getMerchantBucketCount(merchantId1), 3);
    }
    
    // ============================================
    // Test: Inactive Merchant
    // ============================================
    
    function testCannotRecordForInactiveMerchant() public {
        // Deactivate merchant
        vm.prank(merchant1);
        registry.deactivateMerchant(merchantId1);
        
        // Try to record sales
        vm.prank(merchant1);
        vm.expectRevert(SalesEventLog.MerchantNotActive.selector);
        eventLog.recordSales(merchantId1, block.timestamp, 1000, 500, 500, 1);
    }
    
    // ============================================
    // Test: Edge Cases
    // ============================================
    
    function testRecordSalesWithAllCash() public {
        vm.prank(merchant1);
        eventLog.recordSales(merchantId1, block.timestamp, 1000, 1000, 0, 1);
        
        uint256 bucket = block.timestamp / 900;
        SalesEventLog.SalesBucket memory sales = eventLog.getSalesBucket(merchantId1, bucket);
        
        assertEq(sales.cashAmount, 1000);
        assertEq(sales.digitalAmount, 0);
    }
    
    function testRecordSalesWithAllDigital() public {
        vm.prank(merchant1);
        eventLog.recordSales(merchantId1, block.timestamp, 1000, 0, 1000, 1);
        
        uint256 bucket = block.timestamp / 900;
        SalesEventLog.SalesBucket memory sales = eventLog.getSalesBucket(merchantId1, bucket);
        
        assertEq(sales.cashAmount, 0);
        assertEq(sales.digitalAmount, 1000);
    }
    
    function testRecordSalesLargeAmount() public {
        uint256 largeAmount = 1_000_000_000; // $10,000,000.00 in cents
        
        vm.prank(merchant1);
        eventLog.recordSales(
            merchantId1,
            block.timestamp,
            largeAmount,
            largeAmount / 2,
            largeAmount / 2,
            255 // Max uint8
        );
        
        uint256 bucket = block.timestamp / 900;
        SalesEventLog.SalesBucket memory sales = eventLog.getSalesBucket(merchantId1, bucket);
        
        assertEq(sales.totalAmount, largeAmount);
        assertEq(sales.txCount, 255);
    }
}

// ============================================
// MerchantRegistry Tests
// ============================================

contract MerchantRegistryTest is Test {
    MerchantRegistry public registry;
    
    address public owner1 = address(0x1);
    address public owner2 = address(0x2);
    bytes32 public merchantId1 = keccak256("merchant-1");
    bytes32 public merchantId2 = keccak256("merchant-2");
    
    function setUp() public {
        registry = new MerchantRegistry();
    }
    
    function testRegisterMerchant() public {
        vm.prank(owner1);
        registry.register(merchantId1, "Test Bodega", "Lima");
        
        assertEq(registry.merchantOwner(merchantId1), owner1);
        assertTrue(registry.isActive(merchantId1));
        assertEq(registry.getTotalMerchants(), 1);
    }
    
    function testRegisterMerchantEmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit MerchantRegistry.MerchantRegistered(
            merchantId1,
            owner1,
            "Test",
            "Lima",
            block.timestamp
        );
        
        vm.prank(owner1);
        registry.register(merchantId1, "Test", "Lima");
    }
    
    function testCannotRegisterDuplicate() public {
        vm.prank(owner1);
        registry.register(merchantId1, "Test Bodega", "Lima");
        
        vm.prank(owner2);
        vm.expectRevert(MerchantRegistry.MerchantAlreadyExists.selector);
        registry.register(merchantId1, "Another Bodega", "Lima");
    }
    
    function testCannotRegisterZeroId() public {
        vm.prank(owner1);
        vm.expectRevert(MerchantRegistry.InvalidMerchantId.selector);
        registry.register(bytes32(0), "Test", "Lima");
    }
    
    function testUpdateMerchant() public {
        vm.startPrank(owner1);
        
        registry.register(merchantId1, "Old Name", "Old Location");
        registry.updateMerchant(merchantId1, "New Name", "New Location");
        
        vm.stopPrank();
        
        MerchantRegistry.MerchantInfo memory info = registry.getMerchantInfo(merchantId1);
        assertEq(info.businessName, "New Name");
        assertEq(info.location, "New Location");
    }
    
    function testCannotUpdateOthersMerchant() public {
        vm.prank(owner1);
        registry.register(merchantId1, "Test", "Lima");
        
        vm.prank(owner2);
        vm.expectRevert(MerchantRegistry.NotMerchantOwner.selector);
        registry.updateMerchant(merchantId1, "Hacked", "Nowhere");
    }
    
    function testDeactivateMerchant() public {
        vm.startPrank(owner1);
        
        registry.register(merchantId1, "Test", "Lima");
        assertTrue(registry.isActive(merchantId1));
        
        registry.deactivateMerchant(merchantId1);
        assertFalse(registry.isActive(merchantId1));
        
        vm.stopPrank();
    }
    
    function testGetMerchantInfo() public {
        vm.prank(owner1);
        registry.register(merchantId1, "Bodega", "Lima");
        
        MerchantRegistry.MerchantInfo memory info = registry.getMerchantInfo(merchantId1);
        assertEq(info.businessName, "Bodega");
        assertEq(info.location, "Lima");
        assertTrue(info.isActive);
        assertEq(info.registeredAt, block.timestamp);
    }
    
    function testCannotGetInfoOfNonexistentMerchant() public {
        vm.expectRevert(MerchantRegistry.MerchantNotFound.selector);
        registry.getMerchantInfo(merchantId1);
    }
    
    function testGetMerchantsPaginated() public {
        vm.startPrank(owner1);
        
        for (uint i = 0; i < 5; i++) {
            bytes32 id = keccak256(abi.encodePacked("merchant", i));
            registry.register(id, "Bodega", "Lima");
        }
        
        vm.stopPrank();
        
        // Test page 1
        bytes32[] memory page1 = registry.getMerchantsPaginated(0, 3);
        assertEq(page1.length, 3);
        
        // Test page 2
        bytes32[] memory page2 = registry.getMerchantsPaginated(3, 3);
        assertEq(page2.length, 2);
        
        // Test offset beyond array
        bytes32[] memory page3 = registry.getMerchantsPaginated(10, 3);
        assertEq(page3.length, 0);
    }
    
    function testMultipleMerchantsPerWallet() public {
        vm.startPrank(owner1);
        
        bytes32 id1 = keccak256("merchant-a");
        bytes32 id2 = keccak256("merchant-b");
        
        registry.register(id1, "Bodega 1", "Lima");
        registry.register(id2, "Bodega 2", "Callao");
        
        vm.stopPrank();
        
        assertEq(registry.merchantOwner(id1), owner1);
        assertEq(registry.merchantOwner(id2), owner1);
        assertEq(registry.getTotalMerchants(), 2);
    }
}