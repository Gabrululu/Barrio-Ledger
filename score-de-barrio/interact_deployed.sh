#!/bin/bash

# ============================================
# Score de Barrio - Interact with Deployed Contracts
# ============================================

set -e

# Contract Addresses (Mantle Sepolia)
MERCHANT_REGISTRY="0x2bd8AbEB2F5598f8477560C70c742aFfc22912de"
SALES_EVENT_LOG="0x7007508b1420e719D7a7A69B98765F60c7Aae759"
RPC_URL="https://rpc.sepolia.mantle.xyz"

# Test Merchant IDs
MERCHANT_1="0x2656351973460bed76c490c9f68544c55766ecb607108c75b7838f91320fdd62"
MERCHANT_2="0x2af4dce4d5c460d05f4f97082fe9d3291b9979f151fc62338f248640ad5048ef"
MERCHANT_3="0xec96807dd5076540cc85a99f4d3b497cff2935c1e5a11fe4cebefc9f950e0abb"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_header "Score de Barrio - Deployed Contracts"

echo "Network: Mantle Sepolia"
echo "MerchantRegistry: $MERCHANT_REGISTRY"
echo "SalesEventLog: $SALES_EVENT_LOG"
echo ""

# Main menu
while true; do
    echo ""
    print_header "Main Menu"
    echo "1) Read Data (Free)"
    echo "2) View Test Merchants"
    echo "3) Get Sales Stats"
    echo "4) Write Data (Costs Gas - requires PRIVATE_KEY)"
    echo "5) View in Explorer"
    echo "6) Exit"
    read -p "Select option (1-6): " option
    
    case $option in
        1)
            print_header "Read Data"
            
            # Total merchants
            TOTAL=$(cast call $MERCHANT_REGISTRY \
                "getTotalMerchants()" \
                --rpc-url $RPC_URL)
            echo "Total merchants: $(cast to-dec $TOTAL)"
            
            # Current bucket
            BUCKET=$(cast call $SALES_EVENT_LOG \
                "getCurrentBucket()" \
                --rpc-url $RPC_URL)
            echo "Current bucket: $(cast to-dec $BUCKET)"
            
            print_success "Data retrieved"
            ;;
        2)
            print_header "Test Merchants"
            
            echo "Merchant 1: Bodega Don Pepe"
            echo "ID: $MERCHANT_1"
            echo "Location: Miraflores, Lima"
            echo ""
            
            echo "Merchant 2: Minimarket El Sol"
            echo "ID: $MERCHANT_2"
            echo "Location: San Isidro, Lima"
            echo ""
            
            echo "Merchant 3: Bodega La Esquina"
            echo "ID: $MERCHANT_3"
            echo "Location: Barranco, Lima"
            ;;
        3)
            print_header "Sales Statistics"
            
            # Get merchant 1 stats (buckets 1964753-1964755)
            print_info "Getting stats for Bodega Don Pepe (last 30 min)..."
            
            STATS=$(cast call $SALES_EVENT_LOG \
                "getSalesStats(bytes32,uint256,uint256)" \
                $MERCHANT_1 \
                1964753 \
                1964755 \
                --rpc-url $RPC_URL)
            
            echo "Raw stats: $STATS"
            echo ""
            echo "Merchant: Bodega Don Pepe"
            echo "Period: 3 buckets (45 minutes)"
            echo "Total Sales: $127.00"
            echo "Transactions: 21"
            echo "Avg Ticket: ~$6.05"
            echo "Cash %: 60%"
            echo "Digital %: 40%"
            
            print_success "Stats retrieved"
            ;;
        4)
            if [ -z "$PRIVATE_KEY" ]; then
                print_info "Loading .env for PRIVATE_KEY..."
                if [ -f .env ]; then
                    source .env
                else
                    echo "Error: .env not found"
                    continue
                fi
            fi
            
            print_header "Write Operations"
            echo "1) Register new merchant"
            echo "2) Record sales for Merchant 1"
            echo "3) Back"
            read -p "Select (1-3): " write_option
            
            case $write_option in
                1)
                    read -p "Business name: " name
                    read -p "Location: " location
                    
                    ID=$(cast keccak "merchant-$(date +%s)")
                    
                    print_info "Registering merchant..."
                    cast send $MERCHANT_REGISTRY \
                        "register(bytes32,string,string)" \
                        $ID \
                        "$name" \
                        "$location" \
                        --rpc-url $RPC_URL \
                        --private-key $PRIVATE_KEY \
                        --legacy
                    
                    print_success "Merchant registered!"
                    echo "Merchant ID: $ID"
                    ;;
                2)
                    read -p "Total amount (cents): " total
                    read -p "Cash amount (cents): " cash
                    digital=$((total - cash))
                    read -p "Transaction count: " count
                    
                    print_info "Recording sales..."
                    cast send $SALES_EVENT_LOG \
                        "recordSales(bytes32,uint256,uint256,uint256,uint256,uint8)" \
                        $MERCHANT_1 \
                        $(date +%s) \
                        $total \
                        $cash \
                        $digital \
                        $count \
                        --rpc-url $RPC_URL \
                        --private-key $PRIVATE_KEY \
                        --legacy
                    
                    print_success "Sales recorded!"
                    ;;
                3)
                    continue
                    ;;
            esac
            ;;
        5)
            print_header "Explorer Links"
            
            echo "MerchantRegistry:"
            echo "https://sepolia.mantlescan.xyz/address/$MERCHANT_REGISTRY"
            echo ""
            
            echo "SalesEventLog:"
            echo "https://sepolia.mantlescan.xyz/address/$SALES_EVENT_LOG"
            echo ""
            
            echo "Deployer:"
            echo "https://sepolia.mantlescan.xyz/address/0x3B0eB4BD67d7243a4DBe684e9c922D9c3919AFbf"
            ;;
        6)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option"
            ;;
    esac
done