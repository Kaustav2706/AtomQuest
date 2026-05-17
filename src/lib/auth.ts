import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'employee@atomquest.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('[AUTH] Entered email:', credentials?.email)
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing email or password')
          throw new Error('Invalid credentials')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        console.log('[AUTH] User found in database:', !!user)
        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.password)
        console.log('[AUTH] Bcrypt comparison result:', isValid)
        if (!isValid) {
          throw new Error('Invalid credentials')
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/logout'
  },
  session: {
    strategy: 'jwt'
  }
}
