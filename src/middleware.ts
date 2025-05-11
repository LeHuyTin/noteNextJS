import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Các đường dẫn không cần phải xác thực
const publicPaths = ['/login', '/signup', '/verify-email', '/auth/callback'];

export async function middleware(request: NextRequest) {
  // Kiểm tra nếu đường dẫn là các đường dẫn công khai
  const path = request.nextUrl.pathname;
  
  // Kiểm tra nếu đường dẫn hiện tại không cần xác thực
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith('/api/auth/')
  );

  // Nếu là đường dẫn công khai, cho phép đi tiếp
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Lấy token xác thực từ cookie
  const token = await getToken({
    req: request,
    cookieName: 'next-auth.session-token',
  });

  // Nếu là đường dẫn trang chủ mà không có token, chuyển hướng về trang đăng nhập
  if (path === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu cố gắng truy cập các đường dẫn yêu cầu xác thực mà không có token
  // (ví dụ: /home), chuyển hướng về trang đăng nhập
  if (!token) {
    const url = new URL('/login', request.url);
    // Thêm url gốc vào callbackUrl để sau khi đăng nhập có thể quay lại
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // Nếu đã xác thực, cho phép truy cập
  return NextResponse.next();
}

// Cấu hình middleware để áp dụng cho tất cả các đường dẫn
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};