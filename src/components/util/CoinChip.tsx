"use client";
import { Icon } from "@iconify-icon/react"
import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from "./Button";


export default function CoinChip() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <div>
            <button onClick={handleClick} className="border-2 border-[#8A7D55]/50 px-4 py-2 flex flex-row items-center justify-center rounded-xl bg-gradient-to-tl from-white via-[#F2E6D5] to-[#8A7D55]/50 shadow-md transition-all ease-in-out duration-300 hover:scale-105 hover:-translate-y-1">
                <Icon icon="mdi:coin" className="coin-icon shrink-0 size-4 text-[#8A7D55]" />
                <span className="text-[#8A7D55] text-sm font-bold ml-2">100</span>
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
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      borderRadius: '16px',
                    },
                  },
                }}
            >
                <div className="p-4 flex flex-col">
                    <div className="flex items-center justify-center mt-2">
                        <Icon icon="mdi:coin" className="coin-icon shrink-0 size-4 text-[#8A7D55] ml-2" />
                        <span className="text-[#8A7D55] text-sm font-bold ml-2">100</span>
                    </div>
                    <Button variant="primary" size="sm" className="mt-2" onClick={handleClose}>
                            <Icon icon="mdi:plus" className="text-[#8A7D55]" />
                            <span className="text-[#8A7D55] text-sm font-bold">Add</span>
                    </Button>
                </div>
            </Menu>
        </div>
    );
}