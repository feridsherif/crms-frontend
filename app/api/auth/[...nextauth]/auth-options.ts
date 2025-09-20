import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions: NextAuthOptions = {
  // Removed Prisma adapter. Using backend API for authentication.
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.username || !credentials.password) {
          throw new Error('Please enter both username and password.');
        }
        // Call backend API for authentication
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });
        const data = await res.json();
        if (res.ok && data && data.status === 'success' && data.data) {
          return {
            id: data.data.userId,
            name: data.data.username,
            email: data.data.email,
            username: credentials.username,
            roleId: data.data.roleId,
            token: data.data.token,
            permissions: data.data.permissions,
          };
        }
        throw new Error(data?.message || 'Invalid credentials');
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? '';
        token.email = user.email ?? '';
        token.roleId = user.roleId;
        token.accessToken = user.token;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.roleId = token.roleId;
        session.accessToken = token.accessToken;
        session.permissions = token.permissions;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
};

export default authOptions;
