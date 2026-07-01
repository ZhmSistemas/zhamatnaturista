import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
/* import prisma from "@/libs/prisma"; */
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/models/UserModel";

declare module "next-auth" {
  interface User {
    id: string;
    isAdmin: boolean;
    isUser: boolean;
    whatsapp?: string;
  }
  interface Session {
    user: User & {
      id?: string;
      isAdmin?: boolean;
      isUser?: boolean;
      whatsapp?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    isUser?: boolean;
    whatsapp?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@something.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        if (credentials == null) return null;

        const userFound = await UserModel.findOne({ email: credentials.email });
        console.log("userFound", userFound);

        if (!userFound) throw new Error("Email o contraseña incorrectos");

        const validPassword = await bcrypt.compare(
          credentials.password as string,
          userFound.password
        );

        if (!validPassword) throw new Error("contraseña incorrecta");

        return {
          id: userFound._id.toString(),
          name: userFound.name,
          email: userFound.email,
          isAdmin: userFound.isAdmin,
          isUser: userFound.isUser,
          whatsapp: userFound.whatsapp,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.isUser = user.isUser;
        token.whatsapp = user.whatsapp;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isUser = token.isUser as boolean;
        session.user.whatsapp = token.whatsapp as string;
      }

      return session;
    },
  }, 
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
