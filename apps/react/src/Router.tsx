import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { LoginPage, loader as loginLoader } from "./pages/Login";
import  Home  from "./pages/Home";
import { DashboardLayout } from "./pages/Dashboard";
import { ProfilePage } from "./pages/Profile";
import { StoreProvider } from "./providers/storeProvider";
import Pong from "./pages/Pong"

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<StoreProvider />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} loader={loginLoader} />
      <Route path="/pong" element={<Pong />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="profile" element={<ProfilePage />} />
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
