'use client';

import React, { Suspense } from 'react';
import AuthCard from '../../components/AuthCard';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f6f7f9]">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-950" />
        </div>
      }
    >
      <AuthCard initialMode="login" />
    </Suspense>
  );
}
