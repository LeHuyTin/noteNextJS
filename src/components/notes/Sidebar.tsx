import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";

interface SidebarProps {
  username: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showStarredOnly: boolean;
  setShowStarredOnly: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  username,
  sidebarOpen,
  setSidebarOpen,
  showStarredOnly,
  setShowStarredOnly,
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" });
      // Lưu ý: toast sẽ không hiển thị vì trang sẽ chuyển hướng ngay
      toast.info("Đã đăng xuất");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Không thể đăng xuất. Hãy thử lại.");
    }
  };

  return (
    <>
      {/* User sidebar toggle */}
      <div
        className="fixed top-10 left-10 z-10"
        onMouseEnter={() => setSidebarOpen(true)}
      >
        <button className="bg-gray-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M12 12a4 4 0 100-8 4 4 0 000 8z"
            />
          </svg>
        </button>
      </div>

      {/* sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-20 transition-all duration-300 ${
          sidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0"
        }`}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="p-6">
          <div className="mb-8 pt-8">
            <h2 className="text-xl text-black font-semibold">Xin chào</h2>
            <p className="text-gray-700 font-medium">{username}</p>
          </div>

          <hr className="my-6" />

          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`flex cursor-pointer items-center w-full px-3 py-2 rounded-md ${
                  showStarredOnly
                    ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    : "text-gray-700 hover:bg-gray-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={showStarredOnly ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-3"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {showStarredOnly ? "Hiện tất cả" : "Có gắn dấu sao"}
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center cursor-pointer w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-3"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;