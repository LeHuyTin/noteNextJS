import { signIn } from "next-auth/react";
import supabase from "@/lib/supabase/client";

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export async function signUpWithCredentials(data: SignUpData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      if (
        authError.message.includes("email already in use") || 
        authError.message.includes("already registered") ||
        authError.message.includes("already exists") ||
        authError.message.includes("already taken") ||
        (authError.message.toLowerCase().includes("email") && 
         authError.message.toLowerCase().includes("exists"))
      ) {
        throw new Error(
          "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập."
        );
      }

      if (authError.message.includes("password")) {
        if (authError.message.includes("length")) {
          throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
        }
        if (authError.message.includes("strong")) {
          throw new Error(
            "Mật khẩu không đủ mạnh. Vui lòng sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt."
          );
        }
        throw new Error("Mật khẩu không hợp lệ. " + authError.message);
      }

      if (authError.message.includes("email")) {
        if (authError.message.includes("format")) {
          throw new Error("Định dạng email không hợp lệ.");
        }
        throw new Error("Email không hợp lệ. " + authError.message);
      }

      throw new Error(authError.message || "Đăng ký không thành công");
    }

    // Kiểm tra đặc biệt cho trường hợp email đã tồn tại nhưng Supabase không trả về lỗi rõ ràng
    // Một số phiên bản của Supabase trả về thành công nhưng với trạng thái user không hoàn chỉnh
    if (authData?.user && !authData.user.id) {
      throw new Error("Email này có thể đã được đăng ký. Vui lòng thử email khác hoặc đăng nhập.");
    }

    if (!authData?.user) {
      throw new Error("Không thể tạo tài khoản. Vui lòng thử lại sau.");
    }

    // Kiểm tra authData.user.identities - nếu rỗng, có thể đây là email đã tồn tại
    if (!authData.user.identities || authData.user.identities.length === 0) {
      throw new Error("Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.");
    }

    return {
      email: data.email,
      success: true,
    };
  } catch (error: any) {
    console.error("Signup error details:", error);
    throw new Error(error.message || "Đã xảy ra lỗi trong quá trình đăng ký");
  }
}

export async function signInWithCredentials(
  email: string,
  password: string,
  callbackUrl: string = "/home"
) {
  try {
    return await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl,
    });
  } catch (error: any) {
    throw new Error(error.message || "Lỗi đăng nhập");
  }
}
