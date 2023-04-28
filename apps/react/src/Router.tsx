import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { LoginPage } from "./pages/Login";
import { HomePage } from "./pages/Home";
import { DashboardLayout } from "./pages/Dashboard";
import { ProfilePage } from "./pages/Profile";
import { TwoFactorPage } from "./pages/2fa";
import { UserProvider } from "./providers/userProvider";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<UserProvider />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/2fa" element={<TwoFactorPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Route>
  )
);
