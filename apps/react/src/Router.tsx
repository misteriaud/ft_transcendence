import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { LoginPage, loader as loginLoader } from "./pages/Login";
import { HomePage } from "./pages/Home";
import { DashboardLayout } from "./pages/Dashboard";
import { SettingsPage } from "./pages/Settings";
import { StoreProvider } from "./providers/storeProvider";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<StoreProvider />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} loader={loginLoader} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Route>
  )
);

//   {
//     element: <UserProvider />,
//     children: [
//       {
//         path: "/",
//         element: <HomePage />,
//       },
//       {
//         path: "/login",
//         element: <LoginPage />,
//       },
//       {
//         path: "/2fa",
//         element: <TwoFactorPage />,
//       },
//       {
//         path: "/dashboard",
//         element: <DashboardLayout />,
//         children: [
//           {
//             path: "profile",
//             element: <ProfilePage />,
//           },
//         ],
//       },
//     ],
//   },
