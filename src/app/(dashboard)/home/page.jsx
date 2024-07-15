'use client'

import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebaseconfigdb';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const userSession = JSON.parse(sessionStorage.getItem('user'));
    if (!user && !userSession) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  return (
    <div>
      <h1>Home page!</h1>
      {user && <p>Welcome, {user.email}!</p>}
    </div>
  );
}
