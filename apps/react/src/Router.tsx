import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { LoginPage, loader as loginLoader } from './pages/Login';
import { LoginFakePage } from './pages/LoginFake';
import HomePage from './pages/Home';
import { DashboardLayout } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';
import { StoreProvider } from './context/storeProvider';
import Pong from './pages/Pong';
import { ProfilePage } from './pages/Profile';

export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<StoreProvider />}>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} loader={loginLoader} />
			<Route path="/login_fake" element={<LoginFakePage />} />
			<Route path="/dashboard" element={<DashboardLayout />}>
				<Route path="settings" element={<SettingsPage />} />
				<Route path="users/:username" element={<ProfilePage />} />
				<Route path="pong" element={<Pong />} />
			</Route>
		</Route>
	)
);
