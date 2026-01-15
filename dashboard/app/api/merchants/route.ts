import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const mockMerchants = [
  { id: 'mock-1', name: 'Bodega Don Pepe', location: 'Miraflores', lat: -12.1223, lng: -77.0285, score: 92 },
  { id: 'mock-2', name: 'Minimarket El Sol', location: 'San Isidro', lat: -12.0950, lng: -77.0320, score: 87 },
  { id: 'mock-3', name: 'Bodega La Esquina', location: 'Barranco', lat: -12.1478, lng: -77.0220, score: 78 },
  { id: 'mock-4', name: 'Tienda Mi Barrio', location: 'San Miguel', lat: -12.0750, lng: -77.0850, score: 65 },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minScore = parseInt(searchParams.get('minScore') || '0');

    let dbMerchants = [];
    if (prisma) {
      dbMerchants = await (prisma as any).merchant.findMany({
        where: { score: { gte: minScore } }
      });
    }
        
    const allMerchants = [...dbMerchants, ...mockMerchants].filter(m => (m.score || 0) >= minScore);
    return NextResponse.json({ merchants: allMerchants }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ merchants: mockMerchants }, { headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, location } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID y Nombre requeridos' }, { status: 400, headers: corsHeaders });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Servicio de base de datos no disponible" }, { status: 503, headers: corsHeaders });
    }
    
    const existingMerchant = await (prisma as any).merchant.findUnique({
      where: { id }
    });

    if (existingMerchant) {
      console.log(`Comerciante existente encontrado: ${id}. Iniciando sesión.`);
      return NextResponse.json(existingMerchant, { status: 200, headers: corsHeaders });
    }
    
    // Si no existe, procedemos a crearlo
    const randomLat = -12.0464 + (Math.random() - 0.5) * 0.15;
    const randomLng = -77.0428 + (Math.random() - 0.5) * 0.15;

    const newMerchant = await (prisma as any).merchant.create({
      data: {
        id,
        name,
        location: location || 'Lima, Perú',
        lat: randomLat,
        lng: randomLng,
        score: 75,
        registeredAt: new Date(),
        scoreBreakdown: {}, 
        stats: { totalSales: 0 } 
      }
    });

    return NextResponse.json(newMerchant, { status: 201, headers: corsHeaders });

  } catch (error: any) {
    console.error("Error Prisma Merchant:", error.message);
    return NextResponse.json({ 
      error: 'Error interno en el servidor: ' + error.message 
    }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}