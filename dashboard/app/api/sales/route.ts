import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

const SALES_LOG_ABI = ["function recordSalesBatch(bytes32 merchantId, uint256 totalAmount, uint256 cashAmount, uint256 digitalAmount, uint256 txCount) public"];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');
    const sales = await (prisma as any).sale.findMany({
      where: { merchantId: merchantId || '' },
      orderBy: { timestamp: 'desc' },
    });
    return NextResponse.json({ sales }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, paymentMethod, merchantId } = body;

    const newSale = await (prisma as any).sale.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'Digital',
        merchantId: merchantId,
        timestamp: new Date(),
      }
    });
    
    (async () => {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.MANTLE_RPC_URL);
        const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY!, provider);
        const contract = new ethers.Contract(process.env.SALES_EVENT_LOG_ADDRESS!, SALES_LOG_ABI, wallet);
        
        const bytes32Id = ethers.id(merchantId); 
        const amountWei = ethers.parseUnits(amount.toString(), 18);
        
        const tx = await contract.recordSalesBatch(
          bytes32Id, 
          amountWei, 
          paymentMethod === 'Efectivo' ? amountWei : 0, 
          paymentMethod !== 'Efectivo' ? amountWei : 0, 
          1
        );
        console.log(`✅ Mantle Sync OK: ${tx.hash}`);
      } catch (e) { console.error("❌ Sync Error:", e); }
    })();

    return NextResponse.json({ success: true, sale: newSale }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: corsHeaders }); }