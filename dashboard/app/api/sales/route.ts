import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

const SALES_LOG_ABI = [
  "function recordSalesBatch(bytes32 merchantId, uint256 totalAmount, uint256 cashAmount, uint256 digitalAmount, uint256 txCount) public"
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, paymentMethod, merchantId } = body;

    if (!prisma) throw new Error("DB no conectada");

    // 1. Guardar en Railway de inmediato 
    const newSale = await (prisma as any).sale.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'Digital',
        merchantId: merchantId,
        timestamp: new Date(),
      }
    });

    // 2. Proceso del Relayer (Sin bloquear la respuesta del usuario)       
    (async () => {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.MANTLE_RPC_URL);
        const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY!, provider);
        const contract = new ethers.Contract(process.env.SALES_EVENT_LOG_ADDRESS!, SALES_LOG_ABI, wallet);
                
        const bytes32Id = ethers.isHexString(merchantId) 
          ? ethers.zeroPadValue(merchantId, 32) 
          : ethers.id(merchantId);
      
        const amountWei = ethers.parseUnits(amount.toString(), 18);
                
        const nonce = await provider.getTransactionCount(wallet.address, 'pending');

        const tx = await contract.recordSalesBatch(
          bytes32Id,
          amountWei,
          paymentMethod === 'Efectivo' ? amountWei : 0,
          paymentMethod !== 'Efectivo' ? amountWei : 0,
          1,
          { nonce } 
        );

        console.log(`✅ Sincronizado en Mantle. Hash: ${tx.hash}`);        
      } catch (blockchainError) {
        console.error("❌ Falló el anclaje a Mantle:", blockchainError);
      }
    })(); // Función autoejecutable

    // Devolvemos respuesta inmediata al frontend
    return NextResponse.json({ success: true, sale: newSale }, { headers: corsHeaders });
    
  } catch (error: any) {
    console.error("Error General:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}