"use client"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
  { name: "Lun", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Mie", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jue", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Vie", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Sab", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Dom", total: Math.floor(Math.random() * 5000) + 1000 },
]

export function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}