 // src/lib/auth.config.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// ✅ Usuario hardcodeado (solo para probar el flujo de autenticación)
const hardcodedUser = {
  id: "1",
  email: "admin@almacen.com",
  name: "Administrador",
  password: "$2a$10$GxK7r6vD6vKzW3j1q2Z2.e8Nn1j4V6Y3j1q2Z2.e8Nn1j4V6Y3j1q", // hash de "admin123"
  rol: "ADMIN"
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // ✅ Comparación con usuario hardcodeado
        if (
          credentials.email === hardcodedUser.email &&
          credentials.password === 'admin123'
        ) {
          // No uses el hash real aquí por simplicidad en la prueba
          return {
            id: hardcodedUser.id,
            email: hardcodedUser.email,
            name: hardcodedUser.name,
            rol: hardcodedUser.rol,
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.rol = token.rol as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};