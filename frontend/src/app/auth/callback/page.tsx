'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { supabase } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          router.push('/login');
          return;
        }

        if (session) {
          router.push('/recipes');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Verifying your email...</h2>
        <p className="mt-2 text-gray-600">Please wait while we complete the verification process.</p>
      </div>
    </div>
  );
} 