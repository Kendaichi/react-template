import React from "react";
import useUserStore from "@/stores/useUserStore";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ roles, children }) {
  const { user } = useUserStore();

  if (user === null || (user && Object.keys(user).length === 0)) {
    return null;
  }

  const isSuperAdmin = user.roles?.includes("super-admin");

  if (isSuperAdmin) {
    return children;
  }

  const userRoles = user.roles?.map((role) => role) ?? [];
  const hasAccess = roles.some((role) => userRoles.includes(role));

  if (roles && !hasAccess) {
    return <Navigate to="/not-found" />;
  }

  return children;
}

export default ProtectedRoute;
