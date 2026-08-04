import { Suspense } from 'react';
import PortalClient from '@/components/PortalClient';

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bacs-bg">
          <div className="text-emerald-400 animate-pulse font-mono">
            Decrypting BACS Intelligence...
          </div>
        </div>
      }
    >
      <PortalClient />
    </Suspense>
  );
}
