"use client";
import { Icon } from "@iconify-icon/react"
import React, { useEffect, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { API_BASE_URL } from "@/config/apiConfig";
import Button from "./Button";
import { useSession } from "next-auth/react";


export default function CoinChip() {
    const { data: session } = useSession();
    const [coin,setCoin] = useState('100');
    const [coin_raw,setCoinraw] = useState('100');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(()=>{
        const fetchCoin = async () => {
            try{
                const response = await fetch(`${API_BASE_URL}/credits`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.user.token}`,
                    }
                });
                const data = await response.json();
                setCoinraw(data.data.credits);
                setCoin(() => {
                    if (!data || !data.data) return '0';
                    const credits = data.data.credits ?? 0;
                    if (credits >= 1000000) return `${(credits / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
                    if (credits >= 1000) return `${(credits / 1000).toFixed(1).replace(/\.0$/, '')}k`;
                    return credits.toString();
                });
            }
            catch (error) {
                console.error('Error fetching coin data:', error);
            }
        }
        fetchCoin();
    })

    return (
        <div>
            <button onClick={handleClick} className="border-2 border-[#8A7D55]/50 px-4 py-2 flex flex-row items-center justify-center rounded-xl bg-gradient-to-tl from-white via-[#F2E6D5] to-[#8A7D55]/50 shadow-md transition-all ease-in-out duration-300 hover:scale-105 hover:-translate-y-1">
                <Icon icon="mdi:coin" className="coin-icon shrink-0 size-4 text-[#8A7D55]" />
                <span className="text-[#8A7D55] text-sm font-bold ml-2">{coin}</span>
            </button>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="coins"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'user-menu-button',
                }}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      background: 'linear-gradient(to bottom, #F2E6D5,#8A7D5522)',
                      border: '1px solid #8A7D55',
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      borderRadius: '16px',
                    },
                  },
                }}
            >
                <div className="p-4 flex flex-col relative">
                    <span className="text-[#8A7D55] text-sm font-normal text-start">
                        Your Credits
                    </span>
                    <div className="flex items-center justify-center">
                        <span className="text-[#8A7D55] font-bold text-xl">{coin_raw}</span>
                    </div>
                    <Button variant="primary" size="sm" className="mt-2" onClick={handleClose} href="/topup">
                            <Icon icon="mdi:plus" className="text-[#8A7D55]" />
                            <span className="text-[#8A7D55] text-sm font-bold">Topup</span>
                    </Button>
                </div>
            </Menu>
        </div>
    );
}