import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, paymentMethod, merchantId } = body;

    if (!prisma) {
      return NextResponse.json({ error: 'DB no conectada' }, { status: 500, headers: corsHeaders });
    }

    // 1. Validar que el merchant existe
    const merchantExists = await (prisma as any).merchant.findUnique({
      where: { id: merchantId }
    });

    if (!merchantExists) {
      return NextResponse.json({ 
        error: 'El comercio no existe. Regístralo primero en la App.' 
      }, { status: 404, headers: corsHeaders });
    }

    // 2. Crear la venta vinculada al merchant
    const newSale = await (prisma as any).sale.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'Digital',
        merchantId: merchantId,
        timestamp: new Date(),
      }
    });

    // 3. (Opcional) Actualizar las estadísticas del Merchant    
    const currentStats = (merchantExists.stats as any) || {};
    await (prisma as any).merchant.update({
      where: { id: merchantId },
      data: {
        stats: {
          ...currentStats,
          totalSales: (currentStats.totalSales || 0) + 1,
          lastSaleAmount: parseFloat(amount)
        }
      }
    });

    return NextResponse.json(newSale, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    console.error("Error en registro de venta:", error.message);
    return NextResponse.json({ 
      error: 'Error al procesar venta: ' + error.message 
    }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}