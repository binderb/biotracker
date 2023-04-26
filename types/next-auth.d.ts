import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    _id?: string
    username: string
    password?: string
    role?: string
  }
  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User
  }
}