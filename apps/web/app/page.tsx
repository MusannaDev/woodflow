'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { session } from '../lib/session';

/** Kirish nuqtasi: token bo'lsa dashboard, bo'lmasa login. */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(session.token() ? '/dashboard' : '/login');
  }, [router]);
  return null;
}
