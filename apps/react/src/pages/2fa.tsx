import { useSearchParams, Navigate } from "react-router-dom";
import { apiProvider } from "../providers/apiProvider";
import { useAuth } from "../providers/authProvider";

export const TwoFactorPage = () => {
  const { user, login }: any = useAuth();

	if (!user || !user.twoFactorEnabled) {
		return <Navigate to="/login" />;
	}

//   if (code) {
// 	apiProvider.get("auth/login", {
// 		params: { code }
// 	}).then((result) => {
// 		login(result.data)
// 	})
// 	.catch(error => {
// 		console.log("an error occured")
// 	})
//   }

  return (
    <div>
      <h1>This is the Login Page</h1>
    </div>
  );
};

