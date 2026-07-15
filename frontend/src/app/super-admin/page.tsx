'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminPanel } from '@/components/CommandCenter/SuperAdminPanel';

export default function SuperAdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const userData = localStorage.getItem('user');

    if (!token || role !== 'super_admin') {
      router.push('/');
    } else {
      setUser(JSON.parse(userData || '{}'));
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0B1121] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-[#EEEAFE]0 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <SuperAdminPanel 
      user={user} 
      onLogout={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        router.push('/');
      }} 
    />
  );
}
