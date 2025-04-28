"use client";

import React, { useEffect, useState, useContext, useRef } from 'react';
import { Icon } from "@iconify-icon/react";
import { API_BASE_URL } from "@/config/apiConfig";
import { useSession } from "next-auth/react";
import { MenuContext } from './TopMenu'; // Import context from TopMenu

export default function CoinChip() {
  const { data: session } = useSession();
  const [coin, setCoin] = useState('0');
  const [coinRaw, setCoinRaw] = useState('0');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Try to access the menu context if available
  let menuContext;
  try {
    menuContext = useContext(MenuContext);
  } catch (error) {
    menuContext = null;
  }
  
  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    
    // Notify parent about menu state if context exists
    if (menuContext) {
      menuContext.setLockScroll(!menuOpen);
    }
  };
  
  // Handle click outside to close menu
  useEffect(() => {
    if (!menuOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
        
        // Notify parent about menu state if context exists
        if (menuContext) {
          menuContext.setLockScroll(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, menuContext]);
  
  // Fetch coin data when session changes
  useEffect(() => {
    const fetchCoins = async () => {
      if (!session?.user.token) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/credits`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.user.token}`,
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch credits');
        }
        
        const data = await response.json();
        
        if (!data || !data.data || typeof data.data.credits === 'undefined') {
          throw new Error('Invalid response format');
        }
        
        const credits = data.data.credits || 0;
        setCoinRaw(credits.toString());
        
        // Format the display value
        if (credits >= 1000000) {
          setCoin(`${(credits / 1000000).toFixed(1).replace(/\.0$/, '')}m`);
        } else if (credits >= 1000) {
          setCoin(`${(credits / 1000).toFixed(1).replace(/\.0$/, '')}k`);
        } else {
          setCoin(credits.toString());
        }
      } catch (error) {
        console.error('Error fetching coin data:', error);
        setCoinRaw('0');
        setCoin('0');
      }
    };
    
    fetchCoins();
  }, [session?.user.token]);
  
  // Path to topup page
  const navigateToTopup = () => {
    setMenuOpen(false);
    if (menuContext) {
      menuContext.setLockScroll(false);
    }
    window.location.href = '/topup';
  };
  
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="border-2 border-[#8A7D55]/50 px-4 py-2 flex flex-row items-center justify-center rounded-xl bg-gradient-to-tl from-white via-[#F2E6D5] to-[#8A7D55]/50 shadow-md transition-all ease-in-out duration-300 hover:scale-105"
        aria-label="View credits"
      >
        <Icon icon="mdi:coin" className="coin-icon shrink-0 size-4 text-[#8A7D55]" />
        <span className="text-[#8A7D55] text-sm font-bold ml-2">{coin}</span>
      </button>
      
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-[180px] rounded-lg shadow-lg border border-[#8A7D55] bg-gradient-to-b from-[#F2E6D5] to-[#F2E6D5]/20 backdrop-blur-md z-[100] overflow-hidden dropdown-menu"
        >
          <div className="p-4 flex flex-col relative">
            <span className="text-[#8A7D55] text-sm font-normal text-start mb-1">
              Your Credits
            </span>
            <div className="flex items-center justify-center">
              <span className="text-[#8A7D55] font-bold text-xl">{coinRaw}</span>
            </div>
            <button 
              onClick={navigateToTopup}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-white/50 hover:bg-white/80 text-[#8A7D55] border border-[#8A7D55]/30 rounded-md py-1.5 px-2 transition-colors duration-200 font-medium text-sm"
            >
              <Icon icon="mdi:plus" className="text-[#8A7D55]" />
              <span>Topup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}