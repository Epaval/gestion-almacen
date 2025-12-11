// src/types/next-auth.d.ts
import 'next-auth';
import 'next-auth/jwt';

// Extender el tipo User para incluir 'rol'
declare module 'next-auth' {
  interface User {
    rol?: string;  
  }

  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      rol?: string;
    };
  }
}

// Extender el JWT
declare module 'next-auth/jwt' {
  interface JWT {
    rol?: string;
  }
}