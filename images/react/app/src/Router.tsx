import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { LoginPage, loader as loginLoader } from './pages/Login';
import HomePage from './pages/Home';
import { DashboardLayout } from './pages/Dashboard';
import { StoreProvider } from './context/storeProvider';
import Pong from './pages/Pong';
import { ProfilePage } from './pages/Profile';
import { PongResultPage } from './pages/PongResult';

export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<StoreProvider />}>
			<Route path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} loader={loginLoader} />
			<Route path="/dashboard" element={<DashboardLayout />}>
				<Route path="" element={<ProfilePage />} />
				<Route path="pong/:gameId" element={<Pong />} />
				<Route path="pong/:gameId/result" element={<PongResultPage />} />
				<Route path="users/:login42" element={<ProfilePage />} />
				<Route path="pong" element={<Pong />} />
			</Route>
		</Route>
	)
);
