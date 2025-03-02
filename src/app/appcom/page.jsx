"use client";
import { useSearchParams } from "next/navigation";

const AppCom = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username"); // Get username from URL

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Welcome, {username ? username : "Guest"}!</h1>
    </div>
  );
};

export default AppCom;