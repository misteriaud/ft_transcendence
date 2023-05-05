import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export function Register(props)
{
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		try
		{
			const response = await axios.post("/api/user/register",
			{
				username: username,
				email: email,
				password: password,
			});
			// Do something with the response, such as redirecting the user to the login page
			// console.log(response.data);
		}
		catch (error)
		{
			// Handle the error, such as displaying an error message to the user
			// console.log(error);
		}
	}

	return (
		<div className="auth_form">
			<h2>Register</h2>
			<form className="register_form" onSubmit={handleSubmit}>
				<input value={username} type="text" onChange={(e) => setUsername(e.target.value)} placeholder="Username" id="username" name="username"/>
				<input value={email} type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" id="email" name="email"/>
				<input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" id="password" name="password"/>
				<button type="submit">Sign up</button>
			</form>
			<Link className="link" to="/login" >Already have an account ? Login here.</Link>
		</div>
	)
}
