import type { ReactNode } from 'react';

export default function MacFrame({ children, crt = true }: { children: ReactNode; crt?: boolean }) {
  return (
    <div className="mac-screen">
      {children}
      {crt && <div className="crt-overlay" aria-hidden="true" />}
    </div>
  );
}
