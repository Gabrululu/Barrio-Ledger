import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (!prisma) throw new Error("DB no conectada");
    
    const sales = await (prisma as any).sale.findMany({
      where: merchantId ? { merchantId: merchantId } : {},
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({ sales }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error al obtener ventas:", error.message);
    return NextResponse.json({ error: "Error al obtener ventas" }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, paymentMethod, merchantId } = body;

    if (!merchantId) {
      return NextResponse.json({ error: 'merchantId requerido' }, { status: 400, headers: corsHeaders });
    }

    if (!prisma) throw new Error("DB no conectada");

    // 1. Validar que el merchant existe
    const merchantExists = await (prisma as any).merchant.findUnique({
      where: { id: merchantId }
    });

    if (!merchantExists) {
      return NextResponse.json({ error: 'El comercio no existe' }, { status: 404, headers: corsHeaders });
    }

    // 2. Crear la venta
    const newSale = await (prisma as any).sale.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'Digital',
        merchantId: merchantId,
        timestamp: new Date(),
      }
    });

    // 3. Actualizar estadísticas del Merchant
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

    return NextResponse.json({ success: true, sale: newSale }, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}