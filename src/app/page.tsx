// src/app/page.tsx
import HouseWrapper from '@/components/house/HouseWrapper';

export default function Home() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background:
          'radial-gradient(ellipse at top, var(--bn-cream-soft) 0%, var(--bn-cream) 60%, #d8d2c0 100%)',
      }}
    >
      <HouseWrapper />
    </main>
  );
}
