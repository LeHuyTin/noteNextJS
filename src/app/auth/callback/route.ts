import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      // Xác nhận email thông qua token từ Supabase
      await supabase.auth.exchangeCodeForSession(code);
      
      // Chuyển hướng người dùng đến trang đăng nhập sau khi xác nhận thành công
      return NextResponse.redirect(new URL('/login?verified=true', request.url));
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Chuyển hướng đến trang đăng nhập kèm thông báo lỗi
      return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
    }
  }

  
  return NextResponse.redirect(new URL('/', request.url));
}