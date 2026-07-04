'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthScreen } from '@/components/Auth/AuthScreen';

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
    return (
      <div className="h-screen w-screen bg-[#0B1121] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
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
