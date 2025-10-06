import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import { compare } from "bcrypt"
import { User } from "@prisma/client"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: User & {
      role: string
    }
  }
  interface JWT {
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("Invalid email or password")
        }

        // Verify password
        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        // Don't send the password in the session
        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string
        // Add any other user data you want to include in the session
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        // Add user role to JWT token
        token.role = user.role
        // Add any other user data you want to include in the token
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const runtime = 'nodejs';