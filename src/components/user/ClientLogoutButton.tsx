'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import userLogOut from '@/libs/userLogOut';
import styles from './topmenu.module.css';

export default function ClientLogoutButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (session?.user?.token) {
        // Use our custom logout function
        const result = await userLogOut(session.user.token);
        console.log('Logout result:', result);
      } else {
        // Fallback to NextAuth signout
        await signOut({ redirect: false });
      }
      
      // Redirect to home page after logout
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback if our custom logout fails
      await signOut({ callbackUrl: '/' });
    }
  };

  return (
    <a 
      className={styles.menuItem} 
      href="#"
      onClick={(e) => {
        e.preventDefault();
        handleLogout();
      }}
    >
      Sign-Out
    </a>
  );
}