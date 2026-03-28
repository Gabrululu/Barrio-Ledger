import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Score de Barrio — Mi Bodega',
  description: 'Registra tus ventas y construye tu historial financiero on-chain',
};

export default function ComercianteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans">
      {children}
    </div>
  );
}
