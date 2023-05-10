import {
	Navigate,
	redirect,
} from "react-router-dom";
import {
	useStoreDispatchContext,
} from "../providers/storeProvider";
import { apiProvider } from "../dataHooks/axiosFetcher";
import { useMe } from "../dataHooks/useUser";
import { Spinner } from "../components/Spinner";
import { StoreActionType } from "../providers/storeProvider";
import { useState } from "react";

export const LoginFakePage = () => {
	const [name, setName] = useState("");
	const { loading, loggedOut } = useMe();
	const dispatch = useStoreDispatchContext();

	async function login() {
		const response = await apiProvider()
			.get("auth/login_fake", { params: { name } })
			.then((result) => {
				dispatch({
					type: StoreActionType.LOGIN,
					content: result.data.jwt,
				});
			})
			.catch((error) => {
				console.log(error)
			});

	}

	if (loading) return <Spinner />;

	if (!loggedOut) {
		return <Navigate to="/dashboard" />;
	}

	return (
		<div>
			Connect as <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}></input>
			<button onClick={login}>Login</button>
		</div>
	);
};
