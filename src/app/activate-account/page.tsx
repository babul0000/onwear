'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ActivateAccountRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      router.replace(`/set-password?token=${encodeURIComponent(token)}`);
    } else {
      router.replace('/set-password');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950" />
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-950" />
      </div>
    }>
      <ActivateAccountRedirect />
    </Suspense>
  );
}
