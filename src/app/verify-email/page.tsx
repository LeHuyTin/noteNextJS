'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Xác nhận địa chỉ email</h2>
          <p className="mt-2 text-gray-600">
            Chúng tôi đã gửi email xác nhận đến <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm text-blue-700">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p>
                Vui lòng kiểm tra hộp thư đến và thư rác của bạn để tìm email xác nhận và 
                nhấp vào liên kết để hoàn tất quá trình đăng ký.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-gray-50 p-4 text-sm">
          <div className="flex">
            <div className="flex-1 space-y-2">
              <p className="font-medium text-gray-700">Chưa nhận được email?</p>
              <p className="text-gray-600">
                Email xác nhận có thể mất vài phút để đến. Vui lòng kiểm tra cả thư mục thư rác.
              </p>
              <p className="text-gray-600">
                Nếu bạn vẫn chưa nhận được, bạn có thể thử đăng nhập - nếu tài khoản chưa được xác nhận, 
                hệ thống sẽ hiển thị tùy chọn để gửi lại email xác nhận.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;