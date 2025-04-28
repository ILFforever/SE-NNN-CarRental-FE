"use client";

import { useState, useEffect, createContext, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

// Import CoinChip component
import CoinChip from "./CoinChip";

// Create context for menu state coordination
export const MenuContext = createContext({
  lockScroll: false,
  setLockScroll: (lock: boolean) => {},
});

// TopMenu Component
export default function TopMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lockScroll, setLockScroll] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Track scrollbar width
  const scrollbarWidthRef = useRef(0);

  // Calculate scrollbar width on mount
  useEffect(() => {
    // Create a div with a scrollbar to measure its width
    const scrollDiv = document.createElement("div");
    scrollDiv.style.cssText =
      "width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;";
    document.body.appendChild(scrollDiv);

    // Calculate scrollbar width
    scrollbarWidthRef.current = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    // Store the width in a CSS variable for use in styles
    document.documentElement.style.setProperty(
      "--scrollbar-width",
      `${scrollbarWidthRef.current}px`
    );

    // Clean up
    document.body.removeChild(scrollDiv);

    // Additional setup: prepare the layout to prevent shifts
    document.documentElement.classList.add("layout-stable");
  }, []);

  // Handle scroll detection for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle body lock when any menu is open
  useEffect(() => {
    if (mobileMenuOpen || userMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock body
      document.body.classList.add("body-locked");
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.position = "fixed";

      // Apply padding to compensate for scrollbar removal
      if (headerRef.current) {
        headerRef.current.style.paddingRight = `${scrollbarWidthRef.current}px`;
      }

      setLockScroll(true);
    } else {
      // Unlock body
      const scrollY = document.body.style.top;
      document.body.classList.remove("body-locked");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }

      // Remove padding
      if (headerRef.current) {
        headerRef.current.style.paddingRight = "";
      }

      setLockScroll(false);
    }
  }, [mobileMenuOpen, userMenuOpen]);

  // Handle user menu click outside
  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        userMenuButtonRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !userMenuButtonRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Handle user menu toggle
  const toggleUserMenu = () => {
    setUserMenuOpen((prev) => !prev);
  };

  // Handle navigation
  const handleNavigation = (route: string) => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    router.push(route);
  };

  // Handle sign out
  const handleSignOut = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    router.push("/signout");
  };

  // Icon Components
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

  const AdminIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="h-5 w-5"
      {...props}
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
  );

  const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="h-5 w-5"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const ReservationsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="h-5 w-5"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );

  const SignOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="h-5 w-5"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );

  const SignInIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="h-5 w-5"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
      />
    </svg>
  );

  const RegisterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="h-5 w-5"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
      />
    </svg>
  );

  return (
    <MenuContext.Provider value={{ lockScroll, setLockScroll }}>
      <div
        ref={headerRef}
        className={clsx(
          "bg-white fixed top-0 left-0 right-0 z-50 border-t border-b border-[#e6e1d8] flex flex-row justify-between items-center transition-all duration-300 ease-in-out",
          "px-5 md:px-[15px] lg:px-10 xl:px-[40px]",
          scrolled
            ? "h-[60px] shadow-lg bg-white/98 backdrop-blur-md lg:px-[50px]"
            : "h-[70px] shadow-md"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center z-[101]">
          <Link href="/">
            <div
              className={clsx(
                "border border-[#8A7D55] rounded-lg p-[3px] flex items-center justify-center bg-white transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] relative overflow-hidden group",
                "shadow-[0_2px_10px_rgba(138,125,85,0.15)] hover:scale-105 hover:shadow-[0_4px_12px_rgba(138,125,85,0.25)] hover:border-[#a59572]",
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

        {/* Desktop Menu Items */}
        <div className="hidden md:flex justify-end items-center w-full h-full">
          <nav className="flex items-center gap-1 md:gap-2 lg:gap-4 xl:gap-[8px] h-full">
            {/* About Link */}
            <Link
              href="/about"
              className="font-['Montserrat',_sans-serif] text-[12pt] text-[#5a5a5a] no-underline px-4 py-2 mx-[6px] relative transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] rounded-lg bg-transparent border border-transparent flex items-center tracking-[0.3px] hover:bg-[rgba(248,245,240,0.5)] hover:text-[#8A7D55] hover:border-[rgba(138,125,85,0.3)]"
            >
              About
            </Link>

            {/* Services Link */}
            {session?.user.userType !== "provider" && (
              <Link
                href="/service"
                className="font-['Montserrat',_sans-serif] text-[12pt] text-[#5a5a5a] no-underline px-4 py-2 mx-[6px] relative transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] rounded-lg bg-transparent border border-transparent flex items-center tracking-[0.3px] hover:bg-[rgba(248,245,240,0.5)] hover:text-[#8A7D55] hover:border-[rgba(138,125,85,0.3)]"
              >
                Services
              </Link>
            )}

            {/* Catalog or Provider Tools Link */}
            {session?.user.userType !== "provider" ? (
              <>
                {session?.user.role === "admin" && (
                  <Link
                    href="/admin/tools"
                    className="text-red-600 font-semibold px-4 py-2 mx-[6px] rounded-lg transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] border border-transparent bg-gradient-to-br from-[rgba(255,0,0,0.08)] to-[rgba(255,0,0,0.15)] hover:bg-gradient-to-br hover:from-[rgba(255,0,0,0.12)] hover:to-[rgba(255,0,0,0.2)] hover:border-[rgba(255,0,0,0.3)] hover:text-red-600 hover:shadow-[0_4px_12px_rgba(255,0,0,0.15)] active:scale-[0.98] active:shadow-[0_4px_8px_rgba(255,0,0,0.15)]"
                  >
                    Admin Tools
                  </Link>
                )}
                <Link
                  href="/catalog"
                  className="bg-gradient-to-r from-[#8A7D55] to-[#6e6344] text-white font-semibold border border-[#8A7D55] shadow-[0_4px_10px_rgba(138,125,85,0.3)] px-[18px] py-[9px] mx-[6px] rounded-lg relative overflow-hidden z-[1] transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#766b48] before:to-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-300 before:ease-linear before:z-[-1] hover:text-white hover:border-[#766b48] hover:shadow-[0_5px_12px_rgba(138,125,85,0.35)] hover:before:opacity-100 active:scale-[0.98] active:shadow-[0_4px_8px_rgba(138,125,85,0.3)] lg:px-5 lg:py-[9px] lg:text-[12.5pt] lg:tracking-[0.5px]"
                >
                  Catalog
                </Link>
              </>
            ) : (
              <Link
                href="/provider/tools"
                className="text-blue-600 font-semibold px-4 py-2 mx-[6px] rounded-lg transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] border border-transparent bg-gradient-to-br from-[rgba(0,0,255,0.08)] to-[rgba(0,0,255,0.15)] hover:bg-gradient-to-br hover:from-[rgba(0,0,255,0.12)] hover:to-[rgba(0,0,255,0.2)] hover:border-[rgba(0,0,255,0.3)] hover:text-blue-600 hover:shadow-[0_4px_12px_rgba(0,0,255,0.15)] active:scale-[0.98] active:shadow-[0_4px_8px_rgba(0,0,255,0.15)] after:bg-gradient-to-r after:from-blue-500 after:to-blue-400"
              >
                Provider Tools
              </Link>
            )}

            {/* User Menu Section */}
            {session ? (
              <div className="flex items-center">
                {/* CoinChip Component */}
                <CoinChip />

                {/* User Menu Button */}
                <button
                  ref={userMenuButtonRef}
                  onClick={toggleUserMenu}
                  className={clsx(
                    "text-sm lg:text-[12pt] text-black font-medium px-3 py-2 lg:px-[14px] lg:py-[8px] mx-2 lg:mx-[15px] rounded-lg bg-[#f8f5f0] border border-[#e6e1d8] flex items-center transition-all duration-300 ease-in-out shadow-[0_2px_8px_rgba(0,0,0,0.05)] relative overflow-hidden group",
                    "hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
                    "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[rgba(255,255,255,0.2)] before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 before:ease-linear hover:before:opacity-100",
                    session.user.userType === "provider" &&
                      "text-[#1e90ff] bg-gradient-to-br from-[rgba(30,144,255,0.08)] to-[rgba(30,144,255,0.12)] border-[rgba(30,144,255,0.2)]"
                  )}
                >
                  <span
                    className={clsx(
                      "inline-flex w-6 h-6 rounded-full mr-2.5 items-center justify-center transition-all duration-300 ease-in-out shadow-[inset_0_0_0_1px_rgba(138,125,85,0.2)] group-hover:scale-110",
                      session.user.userType === "provider"
                        ? "bg-[rgba(30,144,255,0.1)] text-[#1e90ff] shadow-[inset_0_0_0_1px_rgba(30,144,255,0.2)] group-hover:bg-[rgba(30,144,255,0.15)]"
                        : "bg-[rgba(138,125,85,0.1)] text-[#8A7D55] group-hover:bg-[rgba(138,125,85,0.15)]"
                    )}
                  >
                    <UserIcon />
                  </span>
                  {session.user.name}
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    ref={userMenuRef}
                    className="absolute right-5 top-[70px] w-[220px] bg-white rounded-lg shadow-lg border border-[#e6e1d8] overflow-hidden z-[100] transform opacity-100 scale-100 transition-all duration-200 origin-top-right"
                  >
                    <div
                      className={clsx(
                        "flex flex-col items-start px-4 py-3 border-b border-gray-200 mb-2",
                        session.user.userType === "provider"
                          ? "bg-blue-50"
                          : "bg-gray-50"
                      )}
                    >
                      <div className="flex items-center w-full mb-1">
                        <span
                          className={clsx(
                            "inline-flex w-6 h-6 rounded-full mr-2.5 items-center justify-center text-sm",
                            session.user.userType === "provider"
                              ? "bg-[rgba(30,144,255,0.1)] text-[#1e90ff] shadow-[inset_0_0_0_1px_rgba(30,144,255,0.2)]"
                              : "bg-[rgba(138,125,85,0.1)] text-[#8A7D55] shadow-[inset_0_0_0_1px_rgba(138,125,85,0.2)]"
                          )}
                        >
                          <UserIcon />
                        </span>
                        <span className="font-semibold text-gray-800">
                          {session.user.name}
                        </span>
                      </div>
                      <span
                        className={clsx(
                          "text-xs ml-[34px] px-2 py-0.5 rounded-full",
                          session.user.userType === "provider"
                            ? "bg-blue-100 text-blue-700"
                            : session.user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {session.user.userType === "provider"
                          ? "Car Provider"
                          : session.user.role === "admin"
                          ? "Administrator"
                          : "Customer"}
                      </span>
                    </div>

                    <div className="flex flex-col px-2 py-1">
                      {/* Admin Tools */}
                      {session.user.role === "admin" && (
                        <button
                          onClick={() => handleNavigation("/admin/tools")}
                          className="w-full text-left px-3 py-2 text-red-600 font-semibold rounded-lg transition-all duration-200 hover:bg-red-50 mb-1 flex items-center"
                        >
                          <AdminIcon className="w-5 h-5 mr-2" />
                          Admin Tools
                        </button>
                      )}
                      {session.user.role === "provider" && (
                        <button
                          onClick={() => handleNavigation("/provider/tools")}
                          className="w-full text-left px-3 py-2 text-blue-600 font-semibold rounded-lg transition-all duration-200 hover:bg-red-50 mb-1 flex items-center"
                        >
                          <AdminIcon className="w-5 h-5 mr-2" />
                          Provider Tools
                        </button>
                      )}
                      {session.user.role === "provider" && (
                        <button
                          onClick={() => handleNavigation("/provider/dashboard")}
                          className="w-full text-left px-3 py-2 text-gray-600 font-semibold rounded-lg transition-all duration-200 hover:bg-red-50 mb-1 flex items-center"
                        >
                          <ReservationsIcon className="w-5 h-5 mr-2" />
                          My Dashboard
                        </button>
                      )}
                      {/* My Profile */}
                      <button
                        onClick={() =>
                          handleNavigation(
                            session.user.userType === "provider"
                              ? "/provider/profile"
                              : "/account/profile"
                          )
                        }
                        className="w-full text-left px-3 py-2 text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 mb-1 flex items-center"
                      >
                        <ProfileIcon className="w-5 h-5 mr-2" />
                        My Profile
                      </button>

                      {/* My Reservations (for customers) */}
                      {session.user.userType !== "provider" && (
                        <button
                          onClick={() =>
                            handleNavigation("/account/reservations")
                          }
                          className="w-full text-left px-3 py-2 text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 mb-1 flex items-center"
                        >
                          <ReservationsIcon className="w-5 h-5 mr-2" />
                          My Reservations
                        </button>
                      )}

                      {/* Sign Out */}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 mt-1 text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 flex items-center border-t border-gray-100 pt-2"
                      >
                        <SignOutIcon className="w-5 h-5 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href="/signin"
                  className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg hover:text-[#8A7D55] hover:scale-[1.02] transition-transform duration-200"
                >
                  Sign-In
                </Link>
                <Link
                  href="/register"
                  className="text-gray-700 text-xs md:text-sm lg:text-base px-3 md:px-4 py-2 mx-1 md:mx-2 rounded-lg transition-all duration-300 ease-in-out border border-[#e6e1d8] bg-[#f8f5f0] font-medium shadow-sm hover:shadow-md relative overflow-hidden hover:bg-[#f0ece3] hover:border-[#d9d1c0] hover:scale-[1.02] hover:-translate-y-0.5 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[rgba(138,125,85,0.05)] before:to-[rgba(138,125,85,0.15)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={clsx(
            "md:hidden cursor-pointer z-[101] bg-none w-10 h-10 border border-[rgba(138,125,85,0.3)] rounded-lg text-[#8A7D55] transition-all duration-300 ease-linear flex items-center justify-center relative overflow-hidden group",
            "hover:bg-[rgba(138,125,85,0.1)] hover:shadow-[0_2px_8px_rgba(138,125,85,0.2)] hover:-translate-y-[1px]",
            "active:translate-y-[1px] active:shadow-[0_1px_3px_rgba(138,125,85,0.2)]",
            "before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(138,125,85,0.1)_0%,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-linear group-hover:before:opacity-100",
            mobileMenuOpen &&
              "bg-[rgba(138,125,85,0.15)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <div className="relative w-[22px] h-[18px] flex flex-col justify-between">
            <span
              className={clsx(
                "block w-full h-0.5 bg-[#8A7D55] rounded transition-all duration-300 origin-center",
                mobileMenuOpen && "transform translate-y-[7px] rotate-45"
              )}
            ></span>
            <span
              className={clsx(
                "block w-full h-0.5 bg-[#8A7D55] rounded transition-all duration-300",
                mobileMenuOpen && "opacity-0"
              )}
            ></span>
            <span
              className={clsx(
                "block w-full h-0.5 bg-[#8A7D55] rounded transition-all duration-300 origin-center",
                mobileMenuOpen && "transform -translate-y-[7px] -rotate-45"
              )}
            ></span>
          </div>
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-[99] animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* Mobile Menu Panel */}
        <div
          className={clsx(
            "md:hidden fixed top-0 bottom-0 right-0 w-[85%] max-w-[320px] bg-white z-[100] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden pt-[60px] shadow-[-5px_0_25px_rgba(0,0,0,0.15)] border-l border-[#e6e1d8]",
            "before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-[#8A7D55] before:to-[#a59572]",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col p-4 sm:p-6 gap-1 w-full box-border">
            {/* User Profile in Mobile Menu */}
            {session && (
              <div className="mb-6 p-4 text-center bg-[#f8f5f0] rounded-lg shadow-[0_3px_12px_rgba(138,125,85,0.15)] relative flex flex-col items-center border border-[rgba(138,125,85,0.2)] w-full box-border after:content-[''] after:absolute after:left-[10%] after:right-[10%] after:bottom-[-10px] after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#8A7D55] after:to-transparent">
                <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center mb-3 border-2 border-[#8A7D55] shadow-[0_2px_6px_rgba(138,125,85,0.25)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={clsx(
                      "h-10 w-10",
                      session.user.userType === "provider"
                        ? "text-[#103aa4]"
                        : session.user.role === "admin"
                        ? "text-[#a41010]"
                        : "text-[#8A7D55]"
                    )}
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
                    className={clsx(
                      "text-base font-medium",
                      session.user.userType === "provider"
                        ? "text-blue-600"
                        : "text-gray-800"
                    )}
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
                  <div className="mt-3">
                    <CoinChip />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Items */}
            {!session ? (
              // Not logged in - show auth options
              <>
                <button
                  onClick={() => handleNavigation("/signin")}
                  className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm hover:bg-[#f8f5f0] hover:text-[#8A7D55]"
                >
                  <SignInIcon className="mr-3 h-5 w-5" />
                  Sign-In
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm hover:bg-[#f8f5f0] hover:text-[#8A7D55]"
                >
                  <RegisterIcon className="mr-3 h-5 w-5" />
                  Register
                </button>
              </>
            ) : // Logged in - show appropriate menu
            session.user.userType === "provider" ? (
              // Provider menu
              <>
                <button
                  onClick={() => handleNavigation("/provider/tools")}
                  className="py-3 px-4 my-1 text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 before:bg-blue-600 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#1e90ff] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
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
                </button>
                <button
                  onClick={() => handleNavigation("/provider/profile")}
                  className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm hover:bg-[#f8f5f0] hover:text-[#8A7D55]"
                >
                  <ProfileIcon className="mr-3 h-5 w-5" />
                  My Profile
                </button>
              </>
            ) : (
              // Customer/Admin menu
              <>
                {session.user.role === "admin" && (
                  <button
                    onClick={() => handleNavigation("/admin/tools")}
                    className="py-3 px-4 my-1 text-red-600 font-semibold bg-red-50 hover:bg-red-100 before:bg-red-600 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-red-600 before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
                  >
                    <AdminIcon className="mr-3 h-5 w-5" />
                    Admin Tools
                  </button>
                )}
                <button
                  onClick={() => handleNavigation("/account/profile")}
                  className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm hover:bg-[#f8f5f0] hover:text-[#8A7D55]"
                >
                  <ProfileIcon className="mr-3 h-5 w-5" />
                  My Profile
                </button>
                <button
                  onClick={() => handleNavigation("/account/reservations")}
                  className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm hover:bg-[#f8f5f0] hover:text-[#8A7D55]"
                >
                  <ReservationsIcon className="mr-3 h-5 w-5" />
                  My Reservations
                </button>
              </>
            )}

            {/* Common Mobile Menu Items */}
            <button
              onClick={() => handleNavigation("/about")}
              className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm hover:bg-[#f8f5f0] hover:text-[#8A7D55]"
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
            </button>

            {session?.user.userType !== "provider" && (
              <>
                <button
                  onClick={() => handleNavigation("/catalog")}
                  className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm hover:bg-[#f8f5f0] hover:text-[#8A7D55]"
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
                </button>
                <button
                  onClick={() => handleNavigation("/service")}
                  className="py-3 px-4 my-1 text-sm text-gray-700 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#8A7D55] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm hover:bg-[#f8f5f0] hover:text-[#8A7D55]"
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
                </button>
              </>
            )}

            {/* Sign Out */}
            {session && (
              <button
                onClick={handleSignOut}
                className="mt-8 text-red-600 border-t border-[rgba(138,125,85,0.2)] pt-6 hover:bg-[rgba(255,0,0,0.1)] py-3 px-4 my-1 rounded-md flex items-center w-full transition-colors duration-200 relative overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-red-600 before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-sm"
              >
                <SignOutIcon className="mr-3 h-5 w-5" />
                Sign-Out
              </button>
            )}

            {/* Branding Footer */}
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
    </MenuContext.Provider>
  );
}
