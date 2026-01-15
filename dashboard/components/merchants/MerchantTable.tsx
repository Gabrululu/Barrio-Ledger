"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Merchant } from "@/types"

interface MerchantTableProps {
  data: Merchant[]
}

export function MerchantTable({ data }: MerchantTableProps) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bodega</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((merchant) => (
            <TableRow key={merchant.id}>
              <TableCell className="font-medium">{merchant.name}</TableCell>
              <TableCell>{merchant.location}</TableCell>
              <TableCell>
                <span className="font-bold text-lg">{merchant.score}</span>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={merchant.score >= 70 ? "default" : "destructive"}
                  className={merchant.score >= 70 ? "bg-emerald-500" : ""}
                >
                  {merchant.rating}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/merchants/${merchant.id}`}>Ver Detalle</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}