import { useEffect, useState } from "react";
import { useLoaderData, Navigate, LoaderFunctionArgs, redirect } from "react-router-dom";
import { useStoreDispatchContext, StoreActionType } from "../providers/storeProvider";
import { apiProvider } from "../dataHooks/axiosFetcher";
import { useUser } from "../dataHooks/useUser";
import { Spinner } from "../components/Spinner";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    const intraUrl = "https://api.intra.42.fr/oauth/authorize";
    const redirectUrl = `${intraUrl}?response_type=code&redirect_uri=${process.env.REACT_APP_OAUTH_CALLBACK_URL}&client_id=${process.env.REACT_APP_OAUTH_42_UID}`;
    return redirect(redirectUrl);
  }

  try {
    const response = await apiProvider().get("auth/login", { params: { code } })
    return response.data;
  } catch (error) {
    const intraUrl = "https://api.intra.42.fr/oauth/authorize";
    const redirectUrl = `${intraUrl}?response_type=code&redirect_uri=${process.env.REACT_APP_OAUTH_CALLBACK_URL}&client_id=${process.env.REACT_APP_OAUTH_42_UID}`;
      return redirect(redirectUrl);
  }
};

function TwoFactor() {
  const [totp, setTotp] = useState("");
  const dispatch = useStoreDispatchContext();
  const [isError, setIsError] = useState(false);

  async function submitTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!totp) return;

    try {
      const result = await apiProvider().post("auth/2fa", { totp });
      dispatch({
        type: StoreActionType.LOGIN,
        content: result.data.jwt,
      });
    } catch {
      setIsError(true);
    }
  }

  return (
    <form onSubmit={submitTotp}>
      {isError && <h1>Wrong TOTP</h1>}
      <input
        placeholder="TOTP"
        value={totp}
        onChange={(e) => {
          setTotp(e.target.value.substring(0, 6));
        }}
      />
      <button type="submit">login</button>
    </form>
  );
}

interface Payload {
  jwt: string;
  authorized: boolean;
}

export const LoginPage = () => {
  const { loading, loggedOut } = useUser();
  const dispatch = useStoreDispatchContext();
  const payload = useLoaderData() as Payload;

  useEffect(() => {
    if (payload?.authorized)
      dispatch({
        type: StoreActionType.LOGIN,
        content: payload.jwt,
      });
  }, [payload, dispatch]);

  if (loading) return <Spinner />;

  if (!loggedOut) {
    return <Navigate to="/dashboard" />;
  }

  if (!payload?.authorized) return <TwoFactor />;

  return (
    <div>
      <h1>Login</h1>
    </div>
  );
};
