import { Suspense } from "react";
import { Fingerprint } from "lucide-react";
import PortalClient from "@/components/PortalClient";

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <div className="animate-glow flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
            <Fingerprint size={26} className="text-emerald-400" />
          </div>
          <p className="animate-pulse font-mono text-sm text-emerald-400">
            Decrypting BACS Intelligence...
          </p>
        </div>
      }
    >
      <PortalClient />
    </Suspense>
  );
}
