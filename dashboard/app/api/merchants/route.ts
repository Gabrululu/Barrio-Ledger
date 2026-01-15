import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const mockMerchants = [
  { id: '0x265...', name: 'Bodega Don Pepe', location: 'Miraflores, Lima', score: 92, salesLastMonth: 12500, trend: 'up' },
  { id: '0x2af...', name: 'Minimarket El Sol', location: 'San Isidro, Lima', score: 87, salesLastMonth: 18200, trend: 'up' },
  { id: '0xec9...', name: 'Bodega La Esquina', location: 'Barranco, Lima', score: 78, salesLastMonth: 9800, trend: 'stable' },
  { id: '0x7f8...', name: 'Tienda Mi Barrio', location: 'San Miguel, Lima', score: 65, salesLastMonth: 7200, trend: 'down' },
];

// OBTENER COMERCIOS (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minScore = parseInt(searchParams.get('minScore') || '0');

    let merchants = [];

    // Intentamos traer de la DB real si prisma está listo
    if (prisma) {
      const dbMerchants = await (prisma as any).merchant.findMany({
        where: { score: { gte: minScore } }
      });
      merchants = dbMerchants.length > 0 ? dbMerchants : mockMerchants;
    } else {
      merchants = mockMerchants.filter(m => m.score >= minScore);
    }

    return NextResponse.json({ merchants });
  } catch (error) {
    console.error("Error en GET merchants:", error);
    return NextResponse.json({ merchants: mockMerchants }); // Fallback seguro
  }
}

// REGISTRAR COMERCIO (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, location } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID (Wallet) y Nombre son requeridos' }, { status: 400 });
    }

    if (prisma) {
      const newMerchant = await (prisma as any).merchant.create({
        data: {
          id, // Dirección de la billetera
          name,
          location: location || 'Lima, Perú',
          score: 75, // Score inicial por defecto
          registeredAt: new Date(),
        }
      });
      return NextResponse.json(newMerchant, { status: 201 });
    }

    // Si no hay DB (Entorno de demo), simulamos éxito
    return NextResponse.json({ message: "Modo Demo: Registro recibido", data: body }, { status: 201 });

  } catch (error) {
    console.error("Error al registrar comercio:", error);
    return NextResponse.json({ error: 'Error interno al registrar' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://barrio-ledger-app.vercel.app',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}