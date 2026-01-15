export interface Merchant {
  id: string;
  name: string;
  location: string;
  score: number;
  rating: 'Excelente' | 'Bueno' | 'Regular' | 'Bajo';
  salesLastMonth: number;
  trend: 'up' | 'down' | 'neutral';
  registeredAt: string;
}

export interface ScoreBreakdown {
  stability: number;
  volume: number;
  trend: number;
  diversity: number;
}

export interface MerchantStats extends Merchant {
  scoreBreakdown: ScoreBreakdown;
  avgTicket: number;
  transactions: number;
  cashPercentage: number;
  digitalPercentage: number;
}