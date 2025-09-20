import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    roleId?: string | number;
    token?: string;
    permissions?: string[];
  }
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      username?: string;
      roleId?: string | number;
      token?: string;
      permissions?: string[];
    };
    accessToken?: string;
    permissions?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roleId?: string | number;
    accessToken?: string;
    permissions?: string[];
    id: string;
    email: string;
    name: string;
  }
}
