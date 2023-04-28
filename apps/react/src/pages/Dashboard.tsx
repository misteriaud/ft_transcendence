import { Link, Navigate, Outlet } from "react-router-dom";
import { useUserContext, useUserDispatchContext, UserState } from "../providers/userProvider"

export const DashboardLayout = () => {
  const user: UserState = useUserContext();
  const dispatch = useUserDispatchContext()

  if (!user.log) {
    return <Navigate to="/login" />;
  }

  return (
    <>
		{user.JWT}
      <nav>
        <Link to="/settings">Settings</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      <Outlet />
    </>
  )
};
