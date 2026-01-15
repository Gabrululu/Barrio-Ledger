import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Datos globales para los KPIs del Overview
    const stats = {
      totalMerchants: 1234,
      totalSales: 1270000,
      avgScore: 78,
      newMerchants: 45,
      salesGrowth: 12.5,
      scoreGrowth: 3.2,
      merchantsGrowth: 8.7,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}