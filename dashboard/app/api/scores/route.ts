import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (merchantId) {
      // Return score for specific merchant
      const score = {
        merchantId,
        score: 85,
        breakdown: {
          stability: 88,
          volume: 82,
          trend: 85,
          diversity: 80,
        },
        calculatedAt: new Date().toISOString(),
      };

      return NextResponse.json(score);
    }

    // Return score distribution
    const distribution = {
      ranges: [
        { min: 80, max: 100, count: 456, label: 'Excelente' },
        { min: 60, max: 79, count: 567, label: 'Bueno' },
        { min: 40, max: 59, count: 178, label: 'Regular' },
        { min: 0, max: 39, count: 33, label: 'Bajo' },
      ],
      average: 78,
      median: 76,
    };

    return NextResponse.json(distribution);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}