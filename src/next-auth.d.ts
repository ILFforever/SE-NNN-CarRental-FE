// src/types/next-auth.d.ts
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      _id: string;
      name: string;
      email: string;
      role: string;
      token: string;
      telephone_number?: string;
      userType: 'customer' | 'provider';
    };
  }
  
  interface User {
    id: string;
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
    telephone_number?: string;
    userType: 'customer' | 'provider';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
    telephone_number?: string;
    userType: 'customer' | 'provider';
  }
}