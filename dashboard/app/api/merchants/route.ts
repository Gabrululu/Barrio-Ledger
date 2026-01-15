import { NextResponse } from 'next/server';

// Mock data - En producción, estos datos vendrían de tu base de datos
const mockMerchants = [
  { id: '0x265...', name: 'Bodega Don Pepe', location: 'Miraflores, Lima', score: 92, salesLastMonth: 12500, trend: 'up' },
  { id: '0x2af...', name: 'Minimarket El Sol', location: 'San Isidro, Lima', score: 87, salesLastMonth: 18200, trend: 'up' },
  { id: '0xec9...', name: 'Bodega La Esquina', location: 'Barranco, Lima', score: 78, salesLastMonth: 9800, trend: 'stable' },
  { id: '0x7f8...', name: 'Tienda Mi Barrio', location: 'San Miguel, Lima', score: 65, salesLastMonth: 7200, trend: 'down' },
  { id: '0xabc...', name: 'Bodega Central', location: 'Miraflores, Lima', score: 85, salesLastMonth: 15300, trend: 'up' },
  { id: '0xdef...', name: 'Bodega Santa Rosa', location: 'Surco, Lima', score: 82, salesLastMonth: 13400, trend: 'up' },
  { id: '0x123...', name: 'Minimarket Plaza', location: 'San Isidro, Lima', score: 88, salesLastMonth: 16200, trend: 'up' },
  { id: '0x456...', name: 'Bodega El Centro', location: 'Lima Centro, Lima', score: 71, salesLastMonth: 8900, trend: 'stable' },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const minScore = parseInt(searchParams.get('minScore') || '0');

    // Filter merchants
    let filteredMerchants = mockMerchants.filter(m => m.score >= minScore);

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedMerchants = filteredMerchants.slice(start, end);

    return NextResponse.json({
      merchants: paginatedMerchants,
      pagination: {
        page,
        limit,
        total: filteredMerchants.length,
        pages: Math.ceil(filteredMerchants.length / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}