import { signIn } from "next-auth/react";
import supabase from "@/lib/supabase/client";
import { CreateUserProfile, UserProfile } from "@/types/user";

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
}

export async function signUpWithCredentials(data: SignUpData) {
  try {
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Đăng ký không thành công");
    }

    // Không cần tạo profile thủ công vì trigger sẽ tự động làm điều này
    // Profile sẽ được tạo tự động bởi trigger database

    // Trả về thông tin email để hiển thị trên trang xác nhận
    return {
      email: data.email,
      success: true
    };
  } catch (error: any) {
    throw new Error(error.message || "Đã xảy ra lỗi trong quá trình đăng ký");
  }
}

export async function signInWithCredentials(email: string, password: string, callbackUrl: string = "/home") {
  try {
    return await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl
    });
  } catch (error: any) {
    throw new Error(error.message || "Lỗi đăng nhập");
  }
}

/**
 * Create a user profile in the database
 */
export async function createUserProfileInDB(userData: CreateUserProfile) {
  return await supabase
    .from('profiles')
    .insert([
      {
        id: userData.id,
        email: userData.email,
        full_name: userData.fullName,
      }
    ]);
}

/**
 * Get a user profile from the database
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error };
  }

  const userProfile: UserProfile = {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };

  return { data: userProfile, error: null };
}

/**
 * Update a user profile in the database
 */
export async function updateUserProfile(userId: string, userData: Partial<CreateUserProfile>) {
  const updateData: any = {};
  
  if (userData.fullName) updateData.full_name = userData.fullName;
  
  return await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);
}