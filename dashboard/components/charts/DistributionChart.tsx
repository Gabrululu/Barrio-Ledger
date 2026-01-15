"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Efectivo", value: 65 },
  { name: "Digital", value: 35 },
]
const COLORS = ["#f59e0b", "#3b82f6"]

export function DistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  )
}