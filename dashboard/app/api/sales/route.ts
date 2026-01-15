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
    
    const merchantExists = await (prisma as any).merchant.findUnique({
      where: { id: merchantId }
    });

    if (!merchantExists) {
      return NextResponse.json({ error: 'El comercio no está registrado en la base de datos' }, { status: 404, headers: corsHeaders });
    }

    const newSale = await (prisma as any).sale.create({
      data: {
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'Cash',
        merchantId,
        timestamp: new Date(),
      }
    });

    return NextResponse.json(newSale, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    console.error("Error Prisma Sale:", error.message);
    return NextResponse.json({ error: 'Error al registrar venta: ' + error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}