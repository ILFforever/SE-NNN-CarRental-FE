'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import userLogOut from '@/libs/userLogOut';
import carProviderLogOut from '@/libs/carproviderLogOut';
import styles from './topmenu.module.css';

export default function TopMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [mobileMenuOpen]);

  const handleNavigation = () => setMobileMenuOpen(false);

  // จัดการ logout
  const handleSignOut = async () => {
    try {
      if (session?.user?.token) {
        // เลือกวิธี logout ตามประเภทผู้ใช้
        session.user.userType === 'provider' 
          ? await carProviderLogOut(session.user.token)
          : await userLogOut(session.user.token);
      }
      
      // บังคับ sign out ผ่าน NextAuth
      await signOut({ redirect: false });
      
      // ปิด mobile menu และ redirect
      setMobileMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // คอมโพเนนต์สำหรับแสดงเมนูของ Customer
  const CustomerMenu = () => (
    <>
      <Link href="/account/profile" className={styles.menuItem} onClick={handleNavigation}>
        My Profile
      </Link>
      <Link href="/account/reservations" className={styles.menuItem} onClick={handleNavigation}>
        My Reservations
      </Link>
      {session?.user.role === 'admin' && (
        <Link href="/admin/tools" className={`${styles.menuItem} ${styles.adminToolsButton}`} onClick={handleNavigation}>
          Admin Tools
        </Link>
      )}
    </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนูของ Provider
  const ProviderMenu = () => (
    <>
      <Link href="/provider/profile" className={styles.menuItem} onClick={handleNavigation}>
        My Profile
      </Link>
      <Link href="/provider/tools" className={`${styles.menuItem} ${styles.providerToolsButton}`} onClick={handleNavigation}>
        Provider Tools
      </Link>
    </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนูของ Customer บนมือถือ
  const MobileCustomerMenu = () => (
    <>
      <Link href="/account/profile" className={styles.mobileMenuItem} onClick={handleNavigation}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        My Profile
      </Link>
      <Link href="/account/reservations" className={styles.mobileMenuItem} onClick={handleNavigation}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        My Reservations
      </Link>
      {session?.user.role === 'admin' && (
        <Link href="/admin/tools" className={`${styles.mobileMenuItem} ${styles.adminTools}`} onClick={handleNavigation}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Admin Tools
        </Link>
      )}
    </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนูของ Provider บนมือถือ
  const MobileProviderMenu = () => (
    <>
      <Link href="/provider/profile" className={styles.mobileMenuItem} onClick={handleNavigation}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        My Profile
      </Link>
      <Link href="/provider/tools" className={`${styles.mobileMenuItem} ${styles.providerTools}`} onClick={handleNavigation}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Provider Tools
      </Link>
    </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนู Service และ Catalog
  const ServiceCatalogMenu = () => (
      <>
        <Link href="/service" className={styles.menuItem} onClick={handleNavigation}>
          Services
        </Link>
        <Link href="/catalog" className={`${styles.menuItem} ${styles.catalogButton}`} onClick={handleNavigation}>
          Catalog
        </Link>
      </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนู Service และ Catalog บนมือถือ
  const MobileServiceCatalogMenu = () => (
    session?.user.userType !== 'provider' && (
      <>
        <Link href="/service" className={styles.mobileMenuItem} onClick={handleNavigation}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Services
        </Link>
        <Link href="/catalog" className={styles.mobileMenuItem} onClick={handleNavigation}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Catalog
        </Link>
      </>
    )
  );

  // ไอคอนผู้ใช้
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={styles.menucontainer}>
      {/* โลโก้ - แสดงทั้งบนมือถือและเดสก์ท็อป */}
      <div className={styles.logoContainer}>
        <Link href="/">
          <div className={styles.logowrapper}>
            <Image 
              src="/img/crest-logo.png"
              className={styles.logoimg}
              alt="CEDT Rentals logo"
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </Link>
      </div>

      {/* เมนูเดสก์ท็อป */}
      <div className={styles.desktopMenu}>
        {/* ฝั่งซ้าย - ลิงก์การรับรองและบัญชี */}
        <div className={styles.leftSide}>
          {session ? (
            <>
              <span 
                className={`${styles.username} ${session.user.userType === 'provider' ? styles.provider : ''}`}
              >
                <span className={styles.userIcon}>
                  <UserIcon />
                </span>
                {session.user.name}
              </span>
              <Link 
                href="/signout?callbackUrl=/" 
                className={styles.menuItem}
                onClick={handleNavigation}
              >
                Sign-Out
              </Link>
              
              {session.user.userType === 'customer' ? <CustomerMenu /> : <ProviderMenu />}
            </>
          ) : (
            <>
              <Link href="/signin" className={`${styles.menuItem} ${styles.authButton}`} onClick={handleNavigation}>
                Sign-In
              </Link>
              <Link href="/register" className={`${styles.menuItem} ${styles.authButton}`} onClick={handleNavigation}>
                Register
              </Link>
            </>
          )}
        </div>
        
        {/* ฝั่งขวา - รายการนำทาง */}
        <div className={styles.rightSide}>
          <Link href="/about" className={styles.menuItem} onClick={handleNavigation}>
            About
          </Link>
          <ServiceCatalogMenu />
        </div>
      </div>

      {/* ปุ่มสลับเมนูมือถือ */}
      <button 
        className={`${styles.mobileMenuToggle} ${mobileMenuOpen ? styles.active : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        <div className={styles.hamburgerIcon}>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </div>
      </button>

      {/* พื้นหลังสำหรับเมนูมือถือ */}
      {mobileMenuOpen && <div className={styles.menuBackdrop} onClick={() => setMobileMenuOpen(false)}></div>}
      
      {/* เมนูมือถือ - เลื่อนเข้ามาจากด้านขวา */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.menuDecoration}></div>
        <div className={styles.mobileNav}>
          {/* ข้อมูลผู้ใช้เมื่อเข้าสู่ระบบ */}
          {session && (
            <div className={styles.mobileUserInfo}>
              <div className={styles.userAvatar}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${session.user.userType === 'provider' ? styles.providerIcon : session.user.role === 'admin' ? styles.adminIcon : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={styles.userDetails}>
                <span className={`${styles.username} ${session.user.userType === 'provider' ? styles.provider : ''}`}>
                  {session.user.name}
                </span>
                <span className={styles.userType}>
                  {session.user.userType === 'provider' ? 'Car Provider' : session.user.role === 'admin' ? 'Administrator' : 'Customer'}
                </span>
              </div>
            </div>
          )}
          
          {/* ลิงก์การรับรอง */}
          {!session ? (
            <>
              <Link href="/signin" className={styles.mobileMenuItem} onClick={handleNavigation}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign-In
              </Link>
              <Link href="/register" className={styles.mobileMenuItem} onClick={handleNavigation}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Register
              </Link>
            </>
          ) : (
            /* ลิงก์เฉพาะผู้ใช้/ผู้ให้บริการ */
            session.user.userType === 'customer' ? <MobileCustomerMenu /> : <MobileProviderMenu />
          )}
          
          {/* ลิงก์นำทาง */}
          <Link href="/about" className={styles.mobileMenuItem} onClick={handleNavigation}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </Link>
          <MobileServiceCatalogMenu />
          
          {/* ตัวเลือกออกจากระบบ - หากเข้าสู่ระบบแล้ว */}
          {session && (
            <button 
              onClick={handleSignOut} 
              className={`${styles.mobileMenuItem} ${styles.signOut}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign-Out
            </button>
          )}
          
          <div className={styles.menuFooter}>
            <div className={styles.menuLogo}>
              <div className={styles.smallLogo}>
                <span>CEDT</span>
                <span>RENTALS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}