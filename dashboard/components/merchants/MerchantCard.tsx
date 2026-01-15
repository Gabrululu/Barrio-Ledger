import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Store } from "lucide-react"

export function MerchantCard({ merchant }: { merchant: any }) {
  // Extraemos los datos de stats de forma segura
  const totalSalesCount = merchant?.stats?.totalSales || 0;
  const lastAmount = merchant?.stats?.lastSaleAmount || 0;
  
  // Determinamos la tendencia basándonos en el score (o puedes usar stats si prefieres)
  const isUpTrend = merchant.score >= 70;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4" 
          style={{ borderLeftColor: merchant.score >= 80 ? '#10b981' : '#f59e0b' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-sm font-bold text-gray-800">
            {merchant.name}
          </CardTitle>
          <span className="text-[10px] text-gray-400 font-mono">{merchant.id}</span>
        </div>
        {isUpTrend ? (
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-black text-gray-900">{merchant.score}</div>
          <div className="text-xs font-semibold text-gray-500">Score de Barrio</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3">
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold">Ventas Totales</p>
            <p className="text-sm font-bold text-blue-600">{totalSalesCount} transacciones</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold">Último Ticket</p>
            <p className="text-sm font-bold text-emerald-600">
              {lastAmount > 0 ? formatCurrency(lastAmount) : "---"}
            </p>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground flex items-center">
          <Store className="h-3 w-3 mr-1" />
          {merchant.location || "Lima, Perú"}
        </p>
      </CardContent>
    </Card>
  )
}