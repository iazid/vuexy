'use client'

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebaseconfigdb';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Indique que le composant est monté côté client

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

  // Rendre un état initial cohérent côté serveur
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Home page!</h1>
      {user ? <p>Welcome, {user.email}!</p> : <p>Loading user data...</p>}
    </div>
  );
}
