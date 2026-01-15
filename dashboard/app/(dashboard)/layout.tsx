'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Store, 
  Map, 
  TrendingUp, 
  Key,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Comercios', href: '/merchants', icon: Store },
  { name: 'Mapa', href: '/map', icon: Map },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'API Keys', href: '/api-keys', icon: Key },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Score de Barrio</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                               (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-green-50 text-green-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Demo User</p>
                <p className="text-xs text-gray-500">demo@fintech.com</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header - Mobile */}
        <header className="lg:hidden sticky top-0 z-10 h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-semibold text-gray-900">Score de Barrio</span>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}