import * as React from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function TopActions() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleImport = () => {
    // Import functionality implementation
  };

  const handleNewFile = () => {
    // New file functionality implementation
    navigate("/canvas");
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await axios.post('http://localhost:3000/api/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login page
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and redirect even if the server request fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/auth/login');
    }
  };

  return (
    <div className="flex flex-row flex-wrap gap-5 justify-between self-start w-full max-md:max-w-full">
      <div className="flex flex-row gap-5 px-6 py-3 text-base text-center whitespace-nowrap rounded-xl bg-zinc-700 shadow-[0px_2px_4px_rgba(0,0,0,0.12)] text-white text-opacity-80 w-[50%] ">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/aefa27f3a4d84b2fb61917384a45b85c/52f81c104b60e4c8147260a90cb640aa3c0773005414571467136807a420338b?apiKey=aefa27f3a4d84b2fb61917384a45b85c&"
          alt="Search icon"
          className="object-contain shrink-0 self-start my-auto mr-auto aspect-square w-[15px]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search"
          className="flex-auto my-auto mr-auto text-left bg-transparent border-none outline-none"
          aria-label="Search projects and assets"
        />
      </div>
      <div className="flex gap-7 self-start text-white text-opacity-90">
        <button
          onClick={handleImport}
          className="flex gap-2.5 items-start px-4 pb-4 text-center whitespace-nowrap bg-red-400 rounded-2xl shadow-[0px_2px_4px_rgba(0,0,0,0.12)]"
          aria-label="Import"
        >
          <span className="mx-auto mt-auto scale-150 font-semibold">+</span>
          <span className="mx-auto mt-auto pt-3 text-sm font-bold mr-2">Import</span>
        </button>
        <button
          onClick={handleNewFile}
          className="flex gap-2.5 items-start px-4 pb-4 text-center whitespace-nowrap bg-violet-400 rounded-2xl shadow-[0px_2px_4px_rgba(0,0,0,0.12)]"
          aria-label="New File"
        >
          <span className="mx-auto mt-auto scale-150 font-semibold">+</span>
          <span className="mx-auto mt-auto pt-3 text-sm font-bold mr-2">New File</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex gap-2.5 items-start px-4 py-3 text-center whitespace-nowrap bg-gray-600 rounded-2xl shadow-[0px_2px_4px_rgba(0,0,0,0.12)] hover:bg-gray-700 transition-colors"
          aria-label="Logout"
        >
          <span className="mx-auto mt-auto text-sm font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
}