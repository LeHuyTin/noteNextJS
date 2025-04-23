import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import supabase from "./supabase/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          // Sử dụng mã lỗi không dấu
          throw new Error("missing_credentials");
        }

        try {
          // Đăng nhập với Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            // Xử lý các loại lỗi cụ thể từ Supabase
            if (error.message === "Email not confirmed") {
              throw new Error("email_not_confirmed");
            }
            if (error.message === "Invalid login credentials") {
              throw new Error("invalid_credentials");
            }
            // Trả về lỗi chung, không sử dụng dấu
            throw new Error("auth_error");
          }

          if (!data.user) {
            throw new Error("user_not_found");
          }
          
          if (!data.session) {
            throw new Error("session_not_created");
          }

          // Lấy thông tin profile từ bảng profiles
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
            console.error("Lỗi khi lấy profile:", profileError);
          }

          // Trả về dữ liệu người dùng để lưu trong session
          return {
            id: data.user.id,
            email: data.user.email,
            name: profileData?.full_name,
          };
        } catch (error: any) {
          console.error("Lỗi đăng nhập:", error);
          // Sử dụng mã lỗi không dấu
          if (error.message && typeof error.message === 'string') {
            throw new Error(error.message);
          }
          throw new Error("login_failed");
        }
      }
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Sẽ chuyển hướng về trang login với thông báo lỗi
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};