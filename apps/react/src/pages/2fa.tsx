import { useSearchParams, Navigate } from "react-router-dom";
import { apiProvider } from "../providers/apiProvider";
import { useUserContext, useUserDispatchContext, UserState, UserActionType } from "../providers/userProvider";

export const TwoFactorPage = () => {
  const user = useUserContext();

	// if (!user || !user.twoFactorEnabled) {
	// 	return <Navigate to="/login" />;
	// }

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

