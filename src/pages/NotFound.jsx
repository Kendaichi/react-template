import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-9xl font-extrabold text-gray-200">404</div>
      <h1 className="text-2xl font-bold text-gray-700 mt-4">Page Not Found</h1>
      <p className="text-gray-500 mt-2 text-center px-4">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
