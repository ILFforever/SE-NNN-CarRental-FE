"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import userLogOut from '@/libs/userLogOut';
import carProviderLogOut from '@/libs/carproviderLogOut';

import CoinChip from './CoinChip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import clsx from 'clsx';


const menuItemBaseClasses = "font-['Montserrat',_sans-serif] text-[12pt] text-[#5a5a5a] no-underline px-4 py-2 mx-[6px] relative transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] rounded-lg bg-transparent border border-transparent flex items-center tracking-[0.3px]";
const menuItemHoverEffect = "hover:text-[#8A7D55] hover:bg-[rgba(248,245,240,0.7)] hover:border-[rgba(230,225,216,0.7)] hover:shadow-[0_4px_10px_rgba(138,125,85,0.12)] hover:-translate-y-[2px]";
const menuItemAfterEffect = "";
const menuItemActiveEffect = "active:translate-y-0 active:shadow-[0_2px_5px_rgba(138,125,85,0.08)]";



const mobileMenuItemBaseClasses = "py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm box-border";
const mobileMenuItemHoverEffect = "hover:bg-[#f8f5f0] hover:text-[#8A7D55]";

export default function TopMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [scrolled, setScrolled] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;

      document.body.classList.add("mobile-menu-open");
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.classList.remove("mobile-menu-open");
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }


    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.classList.remove("mobile-menu-open");
    };
  }, [mobileMenuOpen]);


  const handleNavigation = () => setMobileMenuOpen(false);


  const handleSignOut = async () => {
    try {
      if (session?.user?.token) {
        session.user.userType === 'provider'
          ? await carProviderLogOut(session.user.token)
          : await userLogOut(session.user.token);
      }
      await signOut({ redirect: false });
      setMobileMenuOpen(false);
      handleClose();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };



  const DesktopMenuItem = ({ href, children, className = '', onClick, isSpecial = false, isActive = false }: { href: string, children: React.ReactNode, className?: string, onClick?: () => void, isSpecial?: boolean, isActive?: boolean }) => (
    <Link
      href={href}
      className={clsx(
        !isSpecial && menuItemBaseClasses,
        !isSpecial && menuItemHoverEffect,
        !isSpecial && menuItemAfterEffect,
        !isSpecial && menuItemActiveEffect,

        isActive && !isSpecial && "text-[#8A7D55] bg-[rgba(248,245,240,0.7)] border-[rgba(230,225,216,0.7)] shadow-[0_2px_8px_rgba(138,125,85,0.12)] after:w-4/5 after:opacity-100",

        className
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );

  const MobileMenuItem = ({ href, children, className = '', onClick, icon }: { href?: string, children: React.ReactNode, className?: string, onClick?: () => void, icon?: React.ReactNode }) => {
    const content = (
      <>
        {icon && <span className="mr-3 h-5 w-5 inline-flex items-center justify-center">{icon}</span>}
        {children}
      </>
    );

    const itemClasses = clsx(
      mobileMenuItemBaseClasses,
      mobileMenuItemHoverEffect,
      className
    );

    return href ? (
      <Link href={href} className={itemClasses} onClick={onClick}>
        {content}
      </Link>
    ) : (
      <button onClick={onClick} className={itemClasses}>
        {content}
      </button>
    );
  };



  const CustomerMenu = () => (
    <>
      <DesktopMenuItem href="/account/profile" onClick={handleNavigation}>My Profile</DesktopMenuItem>
      <DesktopMenuItem href="/account/reservations" onClick={handleNavigation}>My Reservations</DesktopMenuItem>
      {session?.user.role === "admin" && (
        <DesktopMenuItem
          href="/admin/tools"
          onClick={handleNavigation}
          className="text-red-600 font-semibold px-4 py-2 mx-[6px] rounded-lg transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] border border-transparent bg-gradient-to-br from-[rgba(255,0,0,0.08)] to-[rgba(255,0,0,0.15)] hover:bg-gradient-to-br hover:from-[rgba(255,0,0,0.12)] hover:to-[rgba(255,0,0,0.2)] hover:border-[rgba(255,0,0,0.3)] hover:text-red-600 hover:shadow-[0_4px_12px_rgba(255,0,0,0.15)] hover:-translate-y-[3px] hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] after:bg-gradient-to-r after:from-red-500 after:to-red-400"
          isSpecial={true}
        >
          Admin Tools
        </DesktopMenuItem>
      )}
    </>
  );

  const ProviderMenu = () => (
    <>
      <DesktopMenuItem href="/provider/profile" onClick={handleNavigation}>My Profile</DesktopMenuItem>
      <DesktopMenuItem
        href="/provider/tools"
        onClick={handleNavigation}
        className="text-blue-600 font-semibold px-4 py-2 mx-[6px] rounded-lg transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] border border-transparent bg-gradient-to-br from-[rgba(0,0,255,0.08)] to-[rgba(0,0,255,0.15)] hover:bg-gradient-to-br hover:from-[rgba(0,0,255,0.12)] hover:to-[rgba(0,0,255,0.2)] hover:border-[rgba(0,0,255,0.3)] hover:text-blue-600 hover:shadow-[0_4px_12px_rgba(0,0,255,0.15)] hover:-translate-y-[3px] hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] after:bg-gradient-to-r after:from-blue-500 after:to-blue-400"
        isSpecial={true}
      >
        Provider Tools
      </DesktopMenuItem>
    </>
  );

  const MobileCustomerMenu = () => (
    <>
      {session?.user.role === "admin" && (
        <MobileMenuItem
          href="/admin/tools"
          onClick={handleNavigation}
          className="text-red-600 font-semibold bg-red-50 hover:bg-red-100 before:bg-red-600"
          icon={<AdminIcon />}
        >
          Admin Tools
        </MobileMenuItem>
      )}
      <MobileMenuItem href="/account/profile" onClick={handleNavigation} icon={<ProfileIcon />}>
        My Profile
      </MobileMenuItem>
      <MobileMenuItem href="/account/reservations" onClick={handleNavigation} icon={<ReservationsIcon />}>
        My Reservations
      </MobileMenuItem>
    </>
  );

  const MobileProviderMenu = () => (
    <>
      <MobileMenuItem
        href="/provider/tools"
        onClick={handleNavigation}
        className="text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 before:bg-blue-600"
        icon={<ProviderToolsIcon />}
      >
        Provider Tools
      </MobileMenuItem>
      <MobileMenuItem href="/provider/profile" onClick={handleNavigation} icon={<ProfileIcon />}>
        My Profile
      </MobileMenuItem>
    </>
  );

  const ServiceCatalogMenu = () => (
    <>
      {session?.user.userType !== "provider" ? (
        <>
          <DesktopMenuItem href="/service" onClick={handleNavigation}>Services</DesktopMenuItem>
          <DesktopMenuItem
            href="/catalog"
            onClick={handleNavigation}
            className="bg-gradient-to-r from-[#8A7D55] to-[#6e6344] text-white font-semibold border border-[#8A7D55] shadow-[0_4px_10px_rgba(138,125,85,0.3)] px-[18px] py-[9px] mx-[6px] rounded-lg relative overflow-hidden z-[1] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#766b48] before:to-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-300 before:ease-linear before:z-[-1] hover:text-white hover:border-[#766b48] hover:-translate-y-[3px] hover:scale-[1.03] hover:shadow-[0_6px_15px_rgba(138,125,85,0.4)] hover:before:opacity-100 hover:after:opacity-0 active:translate-y-0 active:scale-[0.98] active:shadow-[0_4px_8px_rgba(138,125,85,0.3)] lg:px-5 lg:py-[9px] lg:text-[12.5pt] lg:tracking-[0.5px]"
            isSpecial={true}
          >
            Catalog
          </DesktopMenuItem>
        </>
      ) : (
        <DesktopMenuItem
          href="/provider/tools"
          onClick={handleNavigation}
          className="text-blue-600 font-semibold px-4 py-2 mx-[6px] rounded-lg transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] border border-transparent bg-gradient-to-br from-[rgba(0,0,255,0.08)] to-[rgba(0,0,255,0.15)] hover:bg-gradient-to-br hover:from-[rgba(0,0,255,0.12)] hover:to-[rgba(0,0,255,0.2)] hover:border-[rgba(0,0,255,0.3)] hover:text-blue-600 hover:shadow-[0_4px_12px_rgba(0,0,255,0.15)] hover:-translate-y-[3px] hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] after:bg-gradient-to-r after:from-blue-500 after:to-blue-400"
          isSpecial={true}
        >
          Provider Tools
        </DesktopMenuItem>
      )}
    </>
  );

  const MobileServiceCatalogMenu = () =>
    session?.user.userType !== "provider" && (
      <>
        <MobileMenuItem href="/catalog" onClick={handleNavigation} icon={<CatalogIcon />}>
          Catalog
        </MobileMenuItem>
        <MobileMenuItem href="/service" onClick={handleNavigation} icon={<ServicesIcon />}>
          Services
        </MobileMenuItem>
      </>
    );
  const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>;
  const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  const ReservationsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
  const ProviderToolsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
  const CatalogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
  const ServicesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
  const SignInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
  const RegisterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
  const SignOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
  const AboutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


  return (
    <div
      className={clsx(
        "bg-white fixed top-0 left-0 right-0 z-50 border-t border-b border-[#e6e1d8] flex flex-row justify-between items-center transition-all duration-300 ease-in-out",
        "px-5 md:px-[15px] lg:px-10 xl:px-[40px]",
        scrolled
          ? "h-[60px] shadow-lg bg-white/98 backdrop-blur-md lg:px-[50px]"
          : "h-[70px] shadow-md"
      )}
      style={{ position: "fixed" }}
    >

      <div className="flex items-center z-[101]">
        <Link href="/">
          <div
            className={clsx(
              "border border-[#8A7D55] rounded-lg p-[3px] flex items-center justify-center bg-white transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] relative overflow-hidden group",
              "shadow-[0_2px_10px_rgba(138,125,85,0.15)] hover:scale-108 hover:shadow-[0_4px_12px_rgba(138,125,85,0.25)] hover:border-[#a59572]",
              "md:border-2 md:p-[3px]",
              "after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)] after:opacity-0 after:transition-opacity after:duration-300 after:ease-linear hover:after:opacity-100"

            )}
          >
            <Image
              src="/img/crest-logo.png"
              className="h-auto w-auto transition-all duration-300 ease-in-out filter drop-shadow group-hover:scale-105 group-hover:drop-shadow-md"
              alt="CEDT Rentals logo"
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </Link>
      </div>


      <div className="hidden md:flex justify-end items-center w-full h-full mx-2 md:mx-6 lg:mx-8">

        <div className="flex items-center gap-1 md:gap-2 lg:gap-4 xl:gap-[8px] h-full">
          <DesktopMenuItem href="/about" onClick={handleNavigation}>About</DesktopMenuItem>
          <ServiceCatalogMenu />
          {session ? (
            <>
              <CoinChip />

              <button
                id="user-menu-button"
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                className={clsx(
                  "text-sm lg:text-[12pt] text-black font-medium px-3 py-2 lg:px-[14px] lg:py-[8px] mx-2 lg:mx-[15px] rounded-lg bg-[#f8f5f0] border border-[#e6e1d8] flex items-center transition-all duration-300 ease-in-out shadow-[0_2px_8px_rgba(0,0,0,0.05)] relative overflow-hidden group",
                  "hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
                  "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[rgba(255,255,255,0.2)] before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 before:ease-linear hover:before:opacity-100",
                  session.user.userType === 'provider' && "text-[#1e90ff] bg-gradient-to-br from-[rgba(30,144,255,0.08)] to-[rgba(30,144,255,0.12)] border-[rgba(30,144,255,0.2)]"
                )}
              >
                <span className={clsx(
                  "inline-flex w-6 h-6 rounded-full mr-2.5 items-center justify-center transition-all duration-300 ease-in-out shadow-[inset_0_0_0_1px_rgba(138,125,85,0.2)] group-hover:scale-110",
                  session.user.userType === 'provider'
                    ? "bg-[rgba(30,144,255,0.1)] text-[#1e90ff] shadow-[inset_0_0_0_1px_rgba(30,144,255,0.2)] group-hover:bg-[rgba(30,144,255,0.15)]"
                    : "bg-[rgba(138,125,85,0.1)] text-[#8A7D55] group-hover:bg-[rgba(138,125,85,0.15)]"
                )}>
                  <UserIcon />
                </span>
                {session.user.name}
              </button>

              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{ 'aria-labelledby': 'user-menu-button' }}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      borderRadius: '12px',
                      minWidth: 180,
                      bgcolor: '#ffffff',
                      border: '1px solid #e6e1d8',
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >

                <div className={clsx(
                  'flex flex-col items-start px-4 py-3 border-b border-gray-200 mb-2',
                  session.user.userType === 'provider' ? 'bg-blue-50' : 'bg-gray-50'
                )}>
                  <div className='flex items-center w-full mb-1'>
                    <span className={clsx(
                      "inline-flex w-6 h-6 rounded-full mr-2.5 items-center justify-center text-sm",
                      session.user.userType === 'provider'
                        ? "bg-[rgba(30,144,255,0.1)] text-[#1e90ff] shadow-[inset_0_0_0_1px_rgba(30,144,255,0.2)]"
                        : "bg-[rgba(138,125,85,0.1)] text-[#8A7D55] shadow-[inset_0_0_0_1px_rgba(138,125,85,0.2)]"
                    )}>
                      <UserIcon />
                    </span>
                    <span className="font-semibold text-gray-800">{session.user.name}</span>
                  </div>
                  <span className={clsx(
                    'text-xs ml-[34px] px-2 py-0.5 rounded-full',
                    session.user.userType === 'provider' ? 'bg-blue-100 text-blue-700' :
                      session.user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'
                  )}>
                    {session.user.userType === 'provider' ? 'Car Provider' : session.user.role === 'admin' ? 'Administrator' : 'Customer'}
                  </span>
                </div>


                <div className='flex flex-col px-2 py-1'>
                  {(session.user.userType === 'customer' ? <CustomerMenu /> : <ProviderMenu />)}
                  <DesktopMenuItem onClick={handleSignOut} href="/signout?callbackUrl=/"
                  >
                    Sign Out
                  </DesktopMenuItem>
                </div>
              </Menu>
            </>
          ) : (

            <>
              <DesktopMenuItem
                href="/signin"
                className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:scale-[1.02] transition-transform duration-200"
                onClick={handleNavigation}
                isSpecial={true}
              >
                Sign-In
              </DesktopMenuItem>
              <DesktopMenuItem
                href="/register"
                className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg transition-all duration-300 ease-in-out border border-[#e6e1d8] bg-[#f8f5f0] font-medium shadow-sm hover:shadow-md relative overflow-hidden hover:bg-[#f0ece3] hover:border-[#d9d1c0] hover:scale-[1.02] hover:-translate-y-0.5 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[rgba(138,125,85,0.05)] before:to-[rgba(138,125,85,0.15)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
                onClick={handleNavigation}
                isSpecial={true}
              >
                Register
              </DesktopMenuItem>
            </>
          )}
        </div>
      </div>


      <button
        className={clsx(
          "md:hidden cursor-pointer z-[101] bg-none w-10 h-10 border border-[rgba(138,125,85,0.3)] rounded-lg text-[#8A7D55] transition-all duration-300 ease-linear flex items-center justify-center relative overflow-hidden group",
          "hover:bg-[rgba(138,125,85,0.1)] hover:shadow-[0_2px_8px_rgba(138,125,85,0.2)] hover:-translate-y-[1px]",
          "active:translate-y-[1px] active:shadow-[0_1px_3px_rgba(138,125,85,0.2)]",
          "before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(138,125,85,0.1)_0%,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-linear group-hover:before:opacity-100",
          mobileMenuOpen && "bg-[rgba(138,125,85,0.15)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]"
        )}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
        aria-expanded={mobileMenuOpen}
      >

        <div className="relative w-[22px] h-[18px] flex flex-col justify-between">
          <span className={clsx("block w-full h-0.5 bg-[#8A7D55] rounded transition-all duration-300 origin-center", mobileMenuOpen && "transform translate-y-[7px] rotate-45")}></span>
          <span className={clsx("block w-full h-0.5 bg-[#8A7D55] rounded transition-all duration-300", mobileMenuOpen && "opacity-0")}></span>
          <span className={clsx("block w-full h-0.5 bg-[#8A7D55] rounded transition-all duration-300 origin-center", mobileMenuOpen && "transform -translate-y-[7px] -rotate-45")}></span>
        </div>
      </button>


      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[99] animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}


        ></div>
      )}


      <div
        className={clsx(
          "md:hidden fixed top-0 bottom-0 right-0 w-[85%] max-w-[320px] bg-white z-[100] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden pt-[60px] shadow-[-5px_0_25px_rgba(0,0,0,0.15)] border-l border-[#e6e1d8]",
          "before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-[#8A7D55] before:to-[#a59572]",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"


        )}
      >

        <div className="absolute top-5 right-5 w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[rgba(138,125,85,0.03)] to-[rgba(138,125,85,0.08)] opacity-60 z-[-1] pointer-events-none before:content-[''] before:absolute before:top-[-30px] before:left-[-30px] before:w-[80px] before:h-[80px] before:rounded-full before:bg-gradient-to-br before:from-[rgba(138,125,85,0.05)] before:to-[rgba(138,125,85,0.1)] after:content-[''] after:absolute after:bottom-[-20px] after:right-[-40px] after:w-[100px] after:h-[100px] after:rounded-full after:bg-gradient-to-br after:from-[rgba(138,125,85,0.02)] after:to-[rgba(138,125,85,0.06)]"></div>


        <div className="flex flex-col p-4 sm:p-6 gap-1 w-full box-border">

          {session && (
            <div className="mb-6 p-4 text-center bg-[#f8f5f0] rounded-lg shadow-[0_3px_12px_rgba(138,125,85,0.15)] relative flex flex-col items-center border border-[rgba(138,125,85,0.2)] w-full box-border after:content-[''] after:absolute after:left-[10%] after:right-[10%] after:bottom-[-10px] after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#8A7D55] after:to-transparent">
              <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center mb-3 border-2 border-[#8A7D55] shadow-[0_2px_6px_rgba(138,125,85,0.25)]">
                <svg xmlns="http://www.w3.org/2000/svg" className={clsx("h-10 w-10", session.user.userType === 'provider' ? 'text-[#103aa4]' : session.user.role === 'admin' ? 'text-[#a41010]' : 'text-[#8A7D55]')} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex flex-col items-center w-full">
                <span className={clsx("text-base font-medium", session.user.userType === "provider" ? "text-blue-600" : "text-gray-800")}>
                  {session.user.name}
                </span>
                <span className="text-xs text-[#8A7D55] mt-1 italic bg-white py-1 px-3 rounded-full border border-[rgba(138,125,85,0.2)] max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
                  {session.user.userType === "provider" ? "Car Provider" : session.user.role === "admin" ? "Administrator" : "Customer"}
                </span>
                <div className='mt-3'>
                  <CoinChip />
                </div>
              </div>
            </div>
          )}


          {!session ? (
            <>
              <MobileMenuItem href="/signin" onClick={handleNavigation} icon={<SignInIcon />}>Sign-In</MobileMenuItem>
              <MobileMenuItem href="/register" onClick={handleNavigation} icon={<RegisterIcon />}>Register</MobileMenuItem>
            </>
          ) :
            session.user.userType === "customer" ? (
              <MobileCustomerMenu />
            ) : (
              <MobileProviderMenu />
            )}


          <MobileMenuItem href="/about" onClick={handleNavigation} icon={<AboutIcon />}>About</MobileMenuItem>
          <MobileServiceCatalogMenu />


          {session && (
            <MobileMenuItem
              onClick={handleSignOut}
              className="mt-8 text-red-600 border-t border-[rgba(138,125,85,0.2)] pt-6 hover:bg-[rgba(255,0,0,0.1)]"
              icon={<SignOutIcon />}
            >
              Sign-Out
            </MobileMenuItem>
          )}


          <div className="mt-12 pt-6 border-t border-[rgba(138,125,85,0.15)] flex justify-center opacity-70 w-full box-border">
            <div className="p-4">
              <div className="flex flex-col items-center font-['Montserrat',_sans-serif] text-[#8A7D55] font-bold tracking-wider text-xs leading-tight border border-[rgba(138,125,85,0.3)] px-2.5 py-1.5 rounded">
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