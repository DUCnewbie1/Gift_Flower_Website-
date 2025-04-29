import React from "react";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      {/* Breadcrumb */}
      <div className="w-full bg-gray-100 flex items-center px-6 py-3 border-b">
        <nav className="flex items-center gap-2 text-sm">
          <a href="/" className="flex items-center gap-1 text-gray-700 hover:text-pink-500 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
            </svg>
            <span className="font-semibold">Trang chủ</span>
          </a>
          <span className="text-gray-400">›</span>
          <span className="text-pink-600 font-medium">Đăng ký tài khoản</span>
        </nav>
      </div>

      {/* Register Form */}
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2 text-center">ĐĂNG KÝ</h2>
        <p className="text-sm text-gray-500 mb-4 text-center">
          Đã có tài khoản, đăng nhập <a href="/login" className="text-pink-500 hover:underline">tại đây</a>
        </p>
        <form className="w-full flex flex-col gap-3">
          <input
            type="text"
            placeholder="Họ"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />
          <input
            type="text"
            placeholder="Tên"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            required
          />
          <button
            type="submit"
            className="bg-pink-500 text-white rounded px-4 py-2 font-semibold hover:bg-pink-600 transition-colors"
          >
            Đăng ký
          </button>
        </form>
        <div className="my-3 text-xs text-gray-400">Hoặc đăng nhập bằng</div>
        <div className="flex gap-2 w-full">
          <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded px-3 py-2 text-sm hover:bg-blue-700 transition-colors">
            Facebook
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white rounded px-3 py-2 text-sm hover:bg-red-600 transition-colors">
            Google
          </button>
        </div>
      </div>
    </div>
  );
}