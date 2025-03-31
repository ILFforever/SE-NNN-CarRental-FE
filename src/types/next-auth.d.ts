// src/types/next-auth.d.ts
import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      token: string;
      telephone_number?: string;
    };
  }
  interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
    telephone_number?: string;
  }
  interface JWT {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
    telephone_number?: string;
  }
}


declare module "next-auth/jwt" {

  interface JWT {
    _id: string,    // MongoDB ObjectId
    name: string,
    email: string,
    role: string,
    token: string,
    telephone_number: string  // Add telephone_number here
  }
}