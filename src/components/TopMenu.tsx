"use client";

import styles from "./topmenu.module.css";
import Image from "next/image";
import TopMenuItem from "./util/TopMenuItem";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export default function TopMenu() {
  const { data: session } = useSession(); // Fetch session on the client side
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <div className={styles.menucontainer}>
        {/* Sign-in/Sign-out on the left side */}
        <div className={styles.leftSide}>
          {session ? (
            <>
              <span
                className={`${styles.username} ${session.user.userType === "provider" ? styles.provider : ""}`}
              >
                {session.user.name}
              </span>
              <NextLink href="/signout?callbackUrl=/" className={styles.menuItem}>
                Sign-Out
              </NextLink>

              {session.user.userType === "customer" && (
                <>
                  <TopMenuItem title="My Profile" pageRef="/account/profile" />
                  <TopMenuItem
                    title="My Reservations"
                    pageRef="/account/reservations"
                  />
                  {session.user.role === "admin" && (
                    <NextLink
                      href="/admin/tools"
                      className={`${styles.menuItem} ${styles.adminTools}`}
                    >
                      Admin Tools
                    </NextLink>
                  )}
                </>
              )}

              {session.user.userType === "provider" && (
                <>
                  <TopMenuItem title="My Profile" pageRef="/provider/profile" />
                  <NextLink
                    href="/provider/tools"
                    className={`${styles.menuItem} text-blue-600 font-bold`}
                  >
                    Provider Tools
                  </NextLink>
                </>
              )}
            </>
          ) : (
            <>
              <NextLink
                href="/api/auth/signin?callbackUrl=/"
                className={styles.menuItem}
              >
                Sign-In
              </NextLink>
              <NextLink href="/register" className={styles.menuItem}>
                Register
              </NextLink>
            </>
          )}
        </div>

        {/* Right side with navigation items and logo */}
        <div className={styles.rightSide}>
          <div className="hidden md:flex md:gap-4 lg:gap-8">
            <TopMenuItem title="About" pageRef="/about" />
            {session?.user.userType !== "provider" && (
              <>
                <TopMenuItem title="Services" pageRef="/service" />
                <TopMenuItem title="Catalog" pageRef="/catalog" />
              </>
            )}
          </div>
          <NextLink href="/">
            <div className={styles.logowrapper}>
              <Image
                src={"/img/crest-logo.png"}
                className={styles.logoimg}
                alt="logo"
                width={40}
                height={40}
                style={{ objectFit: "contain" }}
              />
            </div>
          </NextLink>
          <button
            className="h-full block md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            <Icon icon={isMenuOpen ? "mdi:close" : "mdi:menu"} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}
      >
        <div className={styles.mobileMenuContent}>
          {session?.user.userType !== "provider" && (
            <>
              <TopMenuItem title="Services" pageRef="/service" />
              <TopMenuItem title="Catalog" pageRef="/catalog" />
            </>
          )}
          {session ? (
            <>
              <NextLink
                href="/api/auth/signout?callbackUrl=/"
                className={styles.menuItem}
              >
                Sign-Out
              </NextLink>
            </>
          ) : (
            <>
              <NextLink
                href="/api/auth/signin?callbackUrl=/"
                className={styles.menuItem}
              >
                Sign-In
              </NextLink>
              <NextLink href="/register" className={styles.menuItem}>
                Register
              </NextLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}