import { NextResponse } from 'next/server';
import { GET as getBaseStats } from '../route';

export const dynamic = 'force-dynamic';

export async function GET() {  
  return getBaseStats();
}