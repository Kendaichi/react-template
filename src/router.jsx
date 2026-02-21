import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./components/Layouts/DefaultLayout";
import GuestLayout from "./components/Layouts/GuestLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute roles={["admin", "super-admin"]}>
            <Home />
          </ProtectedRoute>
        ),
      },
      // Add more authenticated routes here
    ],
  },
  {
    path: "/guest",
    element: <GuestLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
