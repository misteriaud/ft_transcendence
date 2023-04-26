import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth, i_User } from "../providers/authProvider"

export const DashboardLayout = () => {
  const { user }: { user?: i_User } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <nav>
        <Link to="/settings">Settings</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      <Outlet />
    </div>
  )
};
