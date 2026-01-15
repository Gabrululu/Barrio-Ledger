import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = {
      totalMerchants: 1234,
      activeMerchants: 1150,
      totalSales: 1270000,
      avgScore: 78,
      newMerchants: 45,
      salesGrowth: 12.5,
      scoreGrowth: 3.2,
      merchantsGrowth: 8.7,
      topDistricts: [
        { name: 'Miraflores', count: 156, avgScore: 82 },
        { name: 'San Isidro', count: 134, avgScore: 85 },
        { name: 'Barranco', count: 89, avgScore: 74 },
        { name: 'Surco', count: 142, avgScore: 79 },
        { name: 'San Miguel', count: 98, avgScore: 71 },
      ],
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}