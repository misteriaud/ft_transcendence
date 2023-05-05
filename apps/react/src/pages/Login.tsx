import { useEffect } from "react";
import {
  useLoaderData,
  Navigate,
  LoaderFunctionArgs,
  redirect,
} from "react-router-dom";
import {
  useUserContext,
  useUserDispatchContext,
  UserState,
  UserActionType,
} from "../providers/userProvider";
import { AxiosInstance } from "axios";

export const loader =
  (apiClient: AxiosInstance) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const intra_url = "https://api.intra.42.fr/oauth/authorize";
    const redirect_url = `${intra_url}?response_type=code&redirect_uri=${process.env.REACT_APP_OAUTH_CALLBACK_URL}&client_id=${process.env.REACT_APP_OAUTH_42_UID}`;

    if (!code) {
      return redirect(redirect_url);
    }

    const response = await apiClient
      .get("auth/login", {
        params: { code },
      })
      .then((result) => {
        return result.data.jwt;
      })
      .catch((error) => {
        return redirect(redirect_url);
      });
    return response;
  };

export const LoginPage = () => {
  const user: UserState = useUserContext();
  const dispatch = useUserDispatchContext();
  const JWT: string = useLoaderData() as string;

  useEffect(() => {
    dispatch({
      type: UserActionType.LOGIN,
      content: JWT,
    });
  }, [JWT]);

  if (user.log) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <h1>Login</h1>
    </div>
  );
};
