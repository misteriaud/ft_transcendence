import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Register } from './auth/register'
import { Login } from './auth/login'
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<div className="App">
				<Routes>
					<Route exact path="/login" element={<Login />} />
					<Route exact path="/register" element={<Register />} />
				</Routes>
			</div>
		</BrowserRouter>
	</React.StrictMode>
);
