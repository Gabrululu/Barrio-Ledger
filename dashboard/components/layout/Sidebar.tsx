"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Store, Map as MapIcon, BarChart3, Key } from "lucide-react"

const routes = [
  { 
    label: "Overview", 
    icon: LayoutDashboard, 
    href: "/", 
    color: "text-sky-500" 
  },
  { 
    label: "Comercios", 
    icon: Store, 
    href: "/merchants", 
    color: "text-emerald-500" 
  },
  { 
    label: "Mapa", 
    icon: MapIcon, 
    href: "/map", 
    color: "text-orange-500" 
  },
  { 
    label: "Analytics", 
    icon: BarChart3, 
    href: "/analytics", 
    color: "text-violet-500" 
  },
  { 
    label: "API Keys", 
    icon: Key, 
    href: "/api-keys", 
    color: "text-pink-500" 
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#0f172a] text-white w-64">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-xl font-bold">Score de Barrio B2B</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                {/* Ahora route.color existe y TypeScript no dará error */}
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}