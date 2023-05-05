import {
  createBrowserRouter,
  createRoutesFromElements,
  LoaderFunctionArgs,
  Route,
} from "react-router-dom";

import { LoginPage, loader as loginLoader } from "./pages/Login";
import { HomePage } from "./pages/Home";
import { DashboardLayout } from "./pages/Dashboard";
import { ProfilePage, loader as profileLoader } from "./pages/Profile";
import { TwoFactorPage } from "./pages/2fa";
import { UserProvider } from "./providers/userProvider";
import axios from "axios";

function newApiClient() {
  const JWT: string = JSON.parse(
    window.localStorage.getItem("user") || ""
  )?.JWT;

  console.log(JWT);

  return axios.create({
    baseURL: "/api",
    headers: {
      Authorization: `Bearer ${JWT}`,
    },
    // .. other options
  });
}

const apiClient = newApiClient();

export const router = createBrowserRouter([
  {
    element: <UserProvider apiClient={apiClient} />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
        loader: loginLoader(apiClient),
      },
      {
        path: "/2fa",
        element: <TwoFactorPage />,
      },
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            path: "profile",
            element: <ProfilePage />,
            loader: profileLoader(apiClient),
          },
        ],
      },
    ],
  },
]);
