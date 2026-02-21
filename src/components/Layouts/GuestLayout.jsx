import useUserStore from "@/stores/useUserStore";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestLayout() {
  const { token } = useUserStore();

  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        <div className="text-white text-center lg:text-left flex-1">
          <h1 className="hero-title mb-4">AppName</h1>
          <p className="text-blue-100 text-lg mt-4 hidden lg:block">
            Your application description goes here.
          </p>
        </div>
        <div className="w-full lg:w-auto lg:flex-1 max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
