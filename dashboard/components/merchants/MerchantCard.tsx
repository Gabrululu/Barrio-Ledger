import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

export function MerchantCard({ merchant }: { merchant: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{merchant.name}</CardTitle>
        {merchant.trend === 'up' ? 
          <TrendingUp className="h-4 w-4 text-emerald-500" /> : 
          <TrendingDown className="h-4 w-4 text-red-500" />
        }
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{merchant.score} pts</div>
        <p className="text-xs text-muted-foreground">
          Ventas: {formatCurrency(merchant.salesLastMonth)} este mes
        </p>
      </CardContent>
    </Card>
  )
}