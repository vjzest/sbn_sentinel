'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthScreen } from '@/components/Auth/AuthScreen';
import { BootScreen } from '@/components/CommandCenter/BootScreen';

export default function RootPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (token) {
      if (role === 'super_admin') {
        router.push('/super-admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <BootScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <AuthScreen 
      onLogin={(role: string, user: any) => { 
        if (role === 'super_admin') {
          router.push('/super-admin');
        } else {
          router.push('/dashboard');
        }
      }} 
    />
  );
}
