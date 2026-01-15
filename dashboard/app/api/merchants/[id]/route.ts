export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. Datos estáticos para la Demo
const mockMerchantDetails: Record<string, any> = {
  '0x265...': {
    id: '0x265...',
    name: 'Bodega Don Pepe',
    location: 'Miraflores, Lima',
    registeredAt: '2024-01-13',
    score: 92,
    scoreBreakdown: {
      stability: 95,
      volume: 90,
      trend: 88,
      diversity: 85,
    },
    stats: {
      salesLastMonth: 12500,
      avgTicket: 25.50,
      transactions: 490,
      cashPercentage: 65,
      digitalPercentage: 35,
    },
  },
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const merchantId = params.id;

    // --- PASO 1: INTENTAR OBTENER DATOS REALES DE LA BASE DE DATOS ---
    if (prisma) {
      try {        
        const realMerchant = await (prisma as any).merchant.findUnique({
          where: { id: merchantId },
          include: {
            stats: true,
            scoreHistory: true,
          },
        });

        if (realMerchant) {
          return NextResponse.json({ merchant: realMerchant });
        }
      } catch (dbError) {        
        console.warn('DB no lista o registro inexistente, usando mocks.');
      }
    }

    // --- PASO 2: SI NO EXISTE EN DB, BUSCAR EN MOCKS DE LA DEMO ---
    const demoMerchant = mockMerchantDetails[merchantId];

    if (demoMerchant) {
      return NextResponse.json({ merchant: demoMerchant });
    }

    // --- PASO 3: GENERACIÓN DINÁMICA ---
    return NextResponse.json({
      merchant: {
        id: merchantId,
        name: `Comercio Nuevo (${merchantId.slice(0, 6)})`,
        location: 'Lima, Perú',
        registeredAt: new Date().toISOString().split('T')[0],
        score: Math.floor(Math.random() * (90 - 65) + 65),
        scoreBreakdown: {
          stability: 75,
          volume: 80,
          trend: 70,
          diversity: 65,
        },
        stats: {
          salesLastMonth: 8500,
          avgTicket: 18.50,
          transactions: 320,
          cashPercentage: 70,
          digitalPercentage: 30,
        },
      },
    });

  } catch (error) {
    console.error('Error en API Merchants:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}