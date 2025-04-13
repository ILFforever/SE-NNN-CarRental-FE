"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import userLogOut from "@/libs/userLogOut";
import carProviderLogOut from "@/libs/carproviderLogOut";

// Add keyframes to your global CSS file:
// @keyframes fadeIn {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
//
// @keyframes slideIn {
//   from {
//     transform: translateX(15%);
//     opacity: 0.8;
//   }
//   to {
//     transform: translateX(0);
//     opacity: 1;
//   }
// }

export default function TopMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    // ให้เรียกฟังก์ชันครั้งแรกเพื่อตรวจสอบสถานะปัจจุบัน
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [mobileMenuOpen]);

  const handleNavigation = () => setMobileMenuOpen(false);

  // จัดการ logout
  const handleSignOut = async () => {
    try {
      if (session?.user?.token) {
        // เลือกวิธี logout ตามประเภทผู้ใช้
        session.user.userType === "provider"
          ? await carProviderLogOut(session.user.token)
          : await userLogOut(session.user.token);
      }

      // บังคับ sign out ผ่าน NextAuth
      await signOut({ redirect: false });

      // ปิด mobile menu และ redirect
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // คอมโพเนนต์สำหรับแสดงเมนูของ Customer
  const CustomerMenu = () => (
    <>
      <Link
        href="/account/profile"
        className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:bg-[#f8f5f0] hover:border-[#e6e1d8] hover:-translate-y-0.5 relative transition-all duration-300 ease-in-out border border-transparent hover:shadow-md after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-gradient-to-r after:from-[#8A7D55] after:to-[#a59572] after:transition-all after:duration-300 after:transform after:-translate-x-1/2 after:opacity-0 hover:after:w-4/5 hover:after:opacity-100"
        onClick={handleNavigation}
      >
        My Profile
      </Link>
      <Link
        href="/account/reservations"
        className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:bg-[#f8f5f0] hover:border-[#e6e1d8] hover:-translate-y-0.5 relative transition-all duration-300 ease-in-out border border-transparent hover:shadow-md after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-gradient-to-r after:from-[#8A7D55] after:to-[#a59572] after:transition-all after:duration-300 after:transform after:-translate-x-1/2 after:opacity-0 hover:after:w-4/5 hover:after:opacity-100"
        onClick={handleNavigation}
      >
        My Reservations
      </Link>
      {session?.user.role === "admin" && (
        <Link
          href="/admin/tools"
          className="text-red-600 font-semibold text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-red-600 hover:bg-red-50 hover:border-red-200 hover:-translate-y-0.5 relative transition-all duration-300 ease-in-out border border-transparent hover:shadow-md after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-gradient-to-r after:from-red-500 after:to-red-400 after:transition-all after:duration-300 after:transform after:-translate-x-1/2 after:opacity-0 hover:after:w-4/5 hover:after:opacity-100 bg-gradient-to-br from-red-50 to-red-100"
          onClick={handleNavigation}
        >
          Admin Tools
        </Link>
      )}
    </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนูของ Provider
  const ProviderMenu = () => (
    <>
      <Link
        href="/provider/profile"
        className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:bg-[#f8f5f0] hover:border-[#e6e1d8] hover:-translate-y-0.5 relative transition-all duration-300 ease-in-out border border-transparent hover:shadow-md after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-gradient-to-r after:from-[#8A7D55] after:to-[#a59572] after:transition-all after:duration-300 after:transform after:-translate-x-1/2 after:opacity-0 hover:after:w-4/5 hover:after:opacity-100"
        onClick={handleNavigation}
      >
        My Profile
      </Link>
      <Link
        href="/provider/tools"
        className="text-blue-600 font-semibold text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-0.5 relative transition-all duration-300 ease-in-out border border-transparent hover:shadow-md after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-gradient-to-r after:from-blue-500 after:to-blue-400 after:transition-all after:duration-300 after:transform after:-translate-x-1/2 after:opacity-0 hover:after:w-4/5 hover:after:opacity-100 bg-gradient-to-br from-blue-50 to-blue-100"
        onClick={handleNavigation}
      >
        Provider Tools
      </Link>
    </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนูของ Customer บนมือถือ
  const MobileCustomerMenu = () => (
    <>
      {session?.user.role === "admin" && (
        <Link
          href="/admin/tools"
          className="py-3 px-4 my-1 text-sm text-red-600 font-semibold bg-red-50 rounded-md flex items-center w-full hover:bg-red-100 transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-red-600 before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100"
          onClick={handleNavigation}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Admin Tools
        </Link>
      )}
      <Link
        href="/account/profile"
        className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full hover:bg-[#f8f5f0] hover:text-[#8A7D55] transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
        onClick={handleNavigation}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        My Profile
      </Link>
      <Link
        href="/account/reservations"
        className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full hover:bg-[#f8f5f0] hover:text-[#8A7D55] transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
        onClick={handleNavigation}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        My Reservations
      </Link>
    </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนูของ Provider บนมือถือ
  const MobileProviderMenu = () => (
    <>
      <Link
        href="/provider/tools"
        className="py-3 px-4 my-1 text-sm text-blue-600 font-semibold bg-blue-50 rounded-md flex items-center w-full hover:bg-blue-100 transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-600 before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100"
        onClick={handleNavigation}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        Provider Tools
      </Link>
      <Link
        href="/provider/profile"
        className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full hover:bg-[#f8f5f0] hover:text-[#8A7D55] transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
        onClick={handleNavigation}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        My Profile
      </Link>
    </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนู Service และ Catalog
  const ServiceCatalogMenu = () => (
    <>
      <Link
        href="/service"
        className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:bg-[#f8f5f0] hover:border-[#e6e1d8] hover:-translate-y-0.5 relative transition-all duration-300 ease-in-out border border-transparent hover:shadow-md after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-gradient-to-r after:from-[#8A7D55] after:to-[#a59572] after:transition-all after:duration-300 after:transform after:-translate-x-1/2 after:opacity-0 hover:after:w-4/5 hover:after:opacity-100"
        onClick={handleNavigation}
      >
        Services
      </Link>
      <Link
        href="/catalog"
        className="bg-gradient-to-br from-[#8A7D55] to-[#6e6344] text-white font-semibold text-xs md:text-sm lg:text-base px-4 md:px-5 py-2 md:py-2.5 mx-1 md:mx-2 rounded-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out border border-[#8A7D55] hover:border-[#766b48] shadow-md hover:shadow-lg relative overflow-hidden z-10 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#766b48] before:to-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-300 before:z-[-1] hover:before:opacity-100"
        onClick={handleNavigation}
      >
        Catalog
      </Link>
    </>
  );

  // คอมโพเนนต์สำหรับแสดงเมนู Service และ Catalog บนมือถือ
  const MobileServiceCatalogMenu = () =>
    session?.user.userType !== "provider" && (
      <>
        <Link
          href="/catalog"
          className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full hover:bg-[#f8f5f0] hover:text-[#8A7D55] transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
          onClick={handleNavigation}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          Catalog
        </Link>
        <Link
          href="/service"
          className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full hover:bg-[#f8f5f0] hover:text-[#8A7D55] transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
          onClick={handleNavigation}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Services
        </Link>
      </>
    );

  // ไอคอนผู้ใช้
  const UserIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
        clipRule="evenodd"
      />
    </svg>
  );
  return (
    <div
      className={`h-[70px] bg-white fixed top-0 left-0 right-0 z-50 border-t border-b border-[#e6e1d8] flex flex-row justify-between items-center px-5 lg:px-10 shadow-md transition-all duration-300 ${
        scrolled ? "h-[60px] shadow-lg bg-white/98 backdrop-blur-md" : ""
      }`}
      style={{ position: "fixed" }}
    >
      {" "}
      {/* โลโก้ - แสดงทั้งบนมือถือและเดสก์ท็อป */}
      <div className="flex items-center z-[101]">
        <Link href="/">
          <div className="border-2 border-[#8A7D55] rounded-lg p-[3px] flex items-center justify-center bg-white shadow-md transition-all duration-300 ease-in-out relative overflow-hidden hover:scale-110 hover:shadow-lg hover:border-[#a59572] after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)] after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100">
            <Image
              src="/img/crest-logo.png"
              className="h-auto w-auto transition-all duration-300 ease-in-out filter drop-shadow hover:scale-105 hover:drop-shadow-md"
              alt="CEDT Rentals logo"
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
            />
          </div>
        </Link>
      </div>
      {/* เมนูเดสก์ท็อป */}
      <div className="hidden md:flex justify-between items-center w-full h-full mx-6 lg:mx-8">
        {/* ฝั่งซ้าย - ลิงก์การรับรองและบัญชี */}
        <div className="flex items-center ml-8 lg:ml-12 h-full">
          {session ? (
            <>
              <span
                className={`text-black font-medium mx-4 py-2 px-3 md:px-4 rounded-lg bg-[#f8f5f0] border border-[#e6e1d8] flex items-center transition-all duration-300 shadow-sm relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 ${
                  session.user.userType === "provider"
                    ? "text-blue-600 bg-gradient-to-br from-blue-50/80 to-blue-100/50 border-blue-200/50"
                    : ""
                }`}
              >
                <span className="inline-flex w-6 h-6 rounded-full bg-[rgba(138,125,85,0.1)] mr-2.5 items-center justify-center text-[#8A7D55] transition-all duration-300 ease-in-out shadow-[inset_0_0_0_1px_rgba(138,125,85,0.2)] group-hover:scale-110 group-hover:bg-[rgba(138,125,85,0.15)]">
                  <UserIcon />
                </span>
                {session.user.name}
              </span>
              <Link
                href="/signout?callbackUrl=/"
                className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:bg-[#f8f5f0] hover:-translate-y-0.5 relative transition-all duration-300 ease-in-out border border-transparent hover:border-[#e6e1d8] hover:shadow-md after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-gradient-to-r after:from-[#8A7D55] after:to-[#a59572] after:transition-all after:duration-300 after:transform after:-translate-x-1/2 after:opacity-0 hover:after:w-4/5 hover:after:opacity-100"
                onClick={handleNavigation}
              >
                Sign-Out
              </Link>

              {session.user.userType === "customer" ? (
                <CustomerMenu />
              ) : (
                <ProviderMenu />
              )}
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:scale-[1.02]"
                onClick={handleNavigation}
              >
                Sign-In
              </Link>
              <Link
                href="/register"
                className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:-translate-y-0.5 transition-all duration-300 ease-in-out border border-[#e6e1d8] bg-[#f8f5f0] font-medium shadow-md hover:shadow-lg relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[rgba(138,125,85,0.05)] before:to-[rgba(138,125,85,0.15)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 hover:bg-[#f0ece3] hover:border-[#d9d1c0] hover:scale-[1.02]"
                onClick={handleNavigation}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* ฝั่งขวา - รายการนำทาง */}
        <div className="flex items-center gap-4 lg:gap-6 mr-8 lg:mr-12 h-full">
          <Link
            href="/about"
            className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:bg-[#f8f5f0] hover:-translate-y-0.5 relative transition-all duration-300 ease-in-out border border-transparent hover:border-[#e6e1d8] hover:shadow-md after:content-[''] after:absolute after:bottom-[-3px] after:left-1/2 after:w-0 after:h-[3px] after:bg-gradient-to-r after:from-[#8A7D55] after:to-[#a59572] after:transition-all after:duration-300 after:transform after:-translate-x-1/2 after:opacity-0 hover:after:w-4/5 hover:after:opacity-100"
            onClick={handleNavigation}
          >
            About
          </Link>
          <ServiceCatalogMenu />
        </div>
      </div>
      {/* ปุ่มสลับเมนูมือถือ */}
      <button
        className={`md:hidden flex items-center justify-center z-[101] w-11 h-11 border border-[rgba(138,125,85,0.3)] rounded-lg text-[#8A7D55] transition-all duration-300 ease-in-out relative overflow-hidden hover:bg-[rgba(138,125,85,0.1)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-sm before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(138,125,85,0.1)_0%,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 ${
          mobileMenuOpen
            ? "bg-[rgba(138,125,85,0.15)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]"
            : ""
        }`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        <div className="relative w-[22px] h-[18px] flex flex-col justify-between">
          <span
            className={`block w-full h-0.5 bg-[#8A7D55] rounded transition-all duration-300 origin-center ${
              mobileMenuOpen ? "transform translate-y-2 rotate-45" : ""
            }`}
          ></span>
          <span
            className={`block w-full h-0.5 bg-[#8A7D55] rounded transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-full h-0.5 bg-[#8A7D55] rounded transition-all duration-300 origin-center ${
              mobileMenuOpen ? "transform -translate-y-2 -rotate-45" : ""
            }`}
          ></span>
        </div>
      </button>
      {/* พื้นหลังสำหรับเมนูมือถือ */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[99] animate-[fadeIn_0.3s_ease] overflow-hidden"
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        ></div>
      )}
      {/* เมนูมือถือ - เลื่อนเข้ามาจากด้านขวา */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[100] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden pt-[60px] shadow-[-5px_0_25px_rgba(0,0,0,0.15)] border-l border-[#e6e1d8] before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-[#8A7D55] before:to-[#a59572] ${
          mobileMenuOpen
            ? "translate-x-0 animate-[slideIn_0.4s_ease-out]"
            : "translate-x-full"
        }`}
      >
        {/* Decorative elements for mobile menu */}
        <div
          className="absolute top-5 right-5 w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[rgba(138,125,85,0.03)] to-[rgba(138,125,85,0.08)] opacity-60 z-[-1]
          before:content-[''] before:absolute before:top-[-30px] before:left-[-30px] before:w-[80px] before:h-[80px] before:rounded-full before:bg-gradient-to-br before:from-[rgba(138,125,85,0.05)] before:to-[rgba(138,125,85,0.1)]
          after:content-[''] after:absolute after:bottom-[-20px] after:right-[-40px] after:w-[100px] after:h-[100px] after:rounded-full after:bg-gradient-to-br after:from-[rgba(138,125,85,0.02)] after:to-[rgba(138,125,85,0.06)]"
        ></div>

        <div className="flex flex-col p-6 gap-1 w-full box-border">
          {/* ข้อมูลผู้ใช้เมื่อเข้าสู่ระบบ */}
          {session && (
            <div className="mb-8 p-5 text-center bg-[#f8f5f0] rounded-lg shadow-md relative flex flex-col items-center border border-[rgba(138,125,85,0.2)] w-full box-border after:content-[''] after:absolute after:left-[10%] after:right-[10%] after:bottom-[-10px] after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#8A7D55] after:to-transparent">
              <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center mb-3 border-2 border-[#8A7D55] shadow-md text-[#8A7D55]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-10 w-10 ${
                    session.user.userType === "provider"
                      ? "text-[#103aa4]"
                      : session.user.role === "admin"
                      ? "text-[#a41010]"
                      : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center w-full">
                <span
                  className={`text-base font-medium ${
                    session.user.userType === "provider" ? "text-blue-600" : ""
                  }`}
                >
                  {session.user.name}
                </span>
                <span className="text-xs text-[#8A7D55] mt-1 italic bg-white py-1 px-3 rounded-full border border-[rgba(138,125,85,0.2)] max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
                  {session.user.userType === "provider"
                    ? "Car Provider"
                    : session.user.role === "admin"
                    ? "Administrator"
                    : "Customer"}
                </span>
              </div>
            </div>
          )}

          {/* ลิงก์การรับรอง */}
          {!session ? (
            <>
              <Link
                href="/signin"
                className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full hover:bg-[#f8f5f0] hover:text-[#8A7D55] transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
                onClick={handleNavigation}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign-In
              </Link>
              <Link
                href="/register"
                className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full hover:bg-[#f8f5f0] hover:text-[#8A7D55] transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
                onClick={handleNavigation}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Register
              </Link>
            </>
          ) : /* ลิงก์เฉพาะผู้ใช้/ผู้ให้บริการ */
          session.user.userType === "customer" ? (
            <MobileCustomerMenu />
          ) : (
            <MobileProviderMenu />
          )}

          <MobileServiceCatalogMenu />

          <Link
            href="/about"
            className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full hover:bg-[#f8f5f0] hover:text-[#8A7D55] transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
            onClick={handleNavigation}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            About
          </Link>

          {/* ตัวเลือกออกจากระบบ - หากเข้าสู่ระบบแล้ว */}
          {session && (
            <button
              onClick={handleSignOut}
              className="py-3 px-4 my-1 mt-8 text-sm text-red-500 rounded-md flex items-center w-full hover:bg-red-50 transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-red-500 before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm border-t border-[rgba(138,125,85,0.2)] pt-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign-Out
            </button>
          )}

          <div className="mt-12 pt-6 border-t border-[rgba(138,125,85,0.15)] flex justify-center opacity-70 w-full box-border">
            <div className="p-4">
              <div className="flex flex-col items-center font-['Montserrat',sans-serif] text-[#8A7D55] font-bold tracking-wider text-xs leading-tight border border-[rgba(138,125,85,0.3)] py-1 px-2.5 rounded">
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
