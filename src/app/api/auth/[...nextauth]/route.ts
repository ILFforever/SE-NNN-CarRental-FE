import NextAuth from "next-auth/next";
import { authOptions } from "./authOptions";

// Export the NextAuth handler for all HTTP methods
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };