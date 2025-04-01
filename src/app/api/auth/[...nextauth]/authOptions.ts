// src/app/api/auth/[...nextauth]/authOptions.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogin from "@/libs/userLogIn";
import carproviderLogin from "@/libs/carproviderLogIn";
import getUserProfile from "@/libs/getUserProfile";
import { API_BASE_URL } from "@/config/apiConfig";

// Define a comprehensive user/provider type
interface CustomUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  telephone_number?: string;
  userType: 'customer' | 'provider';
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }
      },
      
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          let loginResult;
          let userProfile;
          
          // Determine login method based on user type
          if (credentials.userType === 'provider') {
            loginResult = await carproviderLogin(credentials.email, credentials.password);
            
            // Fetch provider profile after successful login
            if (loginResult.success && loginResult.token) {
              try {
                const response = await fetch(`${API_BASE_URL}/Car_Provider/me`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${loginResult.token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (!response.ok) {
                  throw new Error('Could not retrieve provider profile');
                }

                const providerData = await response.json();

                if (!providerData.success || !providerData.data) {
                  throw new Error('Invalid provider profile data');
                }

                userProfile = {
                  success: true,
                  data: {
                    _id: providerData.data._id,
                    name: providerData.data.name,
                    email: providerData.data.email,
                    role: 'provider',
                    telephone_number: providerData.data.telephone_number || ''
                  }
                };
              } catch (profileError) {
                console.error('Provider profile fetch error:', profileError);
                throw profileError;
              }
            }
          } else {
            // Regular user login
            loginResult = await userLogin(credentials.email, credentials.password);
            
            if (loginResult?.success && loginResult?.token) {
              userProfile = await getUserProfile(loginResult.token);
            }
          }
          
          if (!loginResult?.success || !loginResult?.token) {
            throw new Error(loginResult?.message || "Invalid credentials");
          }
          
          if (!userProfile || !userProfile.success) {
            throw new Error("Could not retrieve user profile");
          }
          
          // Return standardized user object
          return {
            id: userProfile.data._id,
            _id: userProfile.data._id,
            name: userProfile.data.name,
            email: userProfile.data.email,
            role: userProfile.data.role,
            token: loginResult.token,
            telephone_number: userProfile.data.telephone_number,
            userType: credentials.userType as 'customer' | 'provider'
          } as CustomUser;
        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/signin',
    error: '/signin',  // Redirect to sign-in page on error
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      // Add user data to JWT when signing in
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token._id = customUser._id;
        token.name = customUser.name;
        token.email = customUser.email;
        token.role = customUser.role;
        token.token = customUser.token;
        token.userType = customUser.userType;
        
        if (customUser.telephone_number) {
          token.telephone_number = customUser.telephone_number;
        }
      }
      return token;
    },
    session({ session, token }) {
      // Add token data to the session
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any)._id = token._id;
        (session.user as any).name = token.name;
        (session.user as any).email = token.email;
        (session.user as any).role = token.role;
        (session.user as any).token = token.token;
        (session.user as any).userType = token.userType;
        
        if (token.telephone_number) {
          (session.user as any).telephone_number = token.telephone_number;
        }
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};