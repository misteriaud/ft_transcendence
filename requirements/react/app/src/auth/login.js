import React, { useState } from "react";
import { Link } from 'react-router-dom';

export function Login(props)
{
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
	}

	return (
		<div className="auth_form">
			<h2>Login</h2>
			<form className="login_form" onSubmit={handleSubmit}>
				<input value={username} type="text" onChange={(e) => setUsername(e.target.value)} placeholder="Username" id="username" name="username"/>
				<input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" id="password" name="password"/>
				<button type="submit">Log in</button>
			</form>
			<Link className="link" to="/register" >Don't have an account ? Register here.</Link>
		</div>
	)
}
