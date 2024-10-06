import { Input } from "antd";
import React from "react";

interface ISearchProduct {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
}
const SearchProduct: React.FC<ISearchProduct> = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
}) => {
  return (
    // <Input
    //   placeholder="Tìm kiếm sản phẩm"
    //   value={searchTerm}
    //   onChange={(e) => setSearchTerm(e.target.value)}
    //   style={{ width: "300px" }}
    // />
    <div className="w-[300px]">
      <div className="relative  mt-2">
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(); // Gọi hàm tìm kiếm khi người dùng nhập
          }}
          type="text"
          autoComplete="off"
          className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md  pl-5 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
          placeholder="Tìm kiếm sản phẩm..."
        />
        <button
          onClick={handleSearch}
          className="absolute right-1 top-1 rounded bg-slate-800 p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchProduct;
