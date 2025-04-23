import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
    }

    // Gửi lại email xác nhận
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/auth/callback`,
      }
    });

    if (error) {
      console.error('Lỗi khi gửi lại email xác nhận:', error);
      return NextResponse.json({ error: error.message || 'Không thể gửi lại email xác nhận' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư của bạn.'
    });
  } catch (error: any) {
    console.error('Lỗi khi xử lý yêu cầu gửi lại email xác nhận:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xử lý yêu cầu' }, { status: 500 });
  }
}