import { useSearchParams, Navigate } from "react-router-dom";
import { apiProvider } from "../providers/apiProvider";
import { useAuth } from "../providers/authProvider";

export const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { user, login }: any = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }
  if (code) {
	apiProvider.get("auth/login", {
		params: { code }
	}).then((result) => {
		if (result.data.jwt)
			login(result.data.jwt)
	})
	.catch(error => {
		console.log("an error occured")
	})
  }
  else {
	const intra_url = "https://api.intra.42.fr/oauth/authorize";
	window.location.href = `${intra_url}?response_type=code&redirect_uri=${process.env.REACT_APP_OAUTH_CALLBACK_URL}&client_id=${process.env.REACT_APP_OAUTH_42_UID}`
  }

  return (
    <div>
      <h1>This is the Login Page</h1>
    </div>
  );
};
