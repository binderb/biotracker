import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "../../../../utils/connectMongo";
import UserModel from "../../../../models/User";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8 // 8 hours
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: {label: "Username", type: "username"},
        password: {label: "Password", type: "password"}
      },
      async authorize(credentials:any) {
        await connectMongo();
        const user = await UserModel.findOne({username: credentials.username}).select('+password');
        if (!user) {
          throw new Error('Incorrect username/password.');
        }
        const pwValid = await user.comparePassword(credentials.password);
        if (!pwValid) {
          throw new Error('Incorrect username/password.')
        }
        return user;
      }
    })
  ],
  secret: process.env.JWT_SECRET,
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        token.user = user;
        console.log(token);
      }
      return token;
    },
    async session ({session, token}) {
      session.user = {
        id: token.user._id,
        username: token.user.username,
        first: token.user.first,
        last: token.user.last,
        role: token.user.role
      };
      return session;
    }
  },
  pages: {
     signIn: '/login'
  }
};

export default NextAuth(authOptions);