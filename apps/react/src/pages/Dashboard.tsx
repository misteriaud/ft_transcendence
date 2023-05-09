import { Link, Outlet } from "react-router-dom";
import { useMe, useUser } from "../dataHooks/useUser";
import { Spinner } from "../components/Spinner";
import {
  useStoreDispatchContext,
  StoreActionType,
} from "../providers/storeProvider";

export const DashboardLayout = () => {
  const { loading, loggedOut } = useMe();
  const dispatch = useStoreDispatchContext();

  if (loading) return <Spinner />;

  if (loggedOut) {
    return (
      <>
        <h1>Your are not connected yet</h1>
        <Link to="/login">login</Link>
      </>
    );
  }

  function logout() {
    dispatch({
      type: StoreActionType.LOGOUT,
    });
    window.location.reload();
  }

  return (
    <>
      <nav>
        <Link to="settings">Settings</Link>
        <button onClick={logout}>Logout</button>
      </nav>
      <Outlet />
    </>
  );
};
