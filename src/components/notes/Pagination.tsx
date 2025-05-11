import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  changePage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  changePage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
        <button
          key={number}
          onClick={() => changePage(number)}
          className={`mx-1 px-3 py-1 rounded ${
            currentPage === number
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {number}
        </button>
      ))}
    </div>
  );
};

export default Pagination;