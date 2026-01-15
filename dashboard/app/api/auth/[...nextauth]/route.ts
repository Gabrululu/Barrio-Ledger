import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // DATOS DEMO
        if (credentials?.email === "admin@barrio.com" && credentials?.password === "mantle2025") {
          return { id: "1", name: "Admin Barrio", email: "admin@barrio.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login', 
  },
});

export { handler as GET, handler as POST };