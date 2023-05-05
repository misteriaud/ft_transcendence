import { useEffect, useState } from "react";
import {
  useLoaderData,
  Navigate,
  LoaderFunctionArgs,
  redirect,
} from "react-router-dom";
import {
  useStoreDispatchContext,
  StoreActionType,
} from "../providers/storeProvider";
import { apiProvider } from "../dataHooks/axiosFetcher";
import { useUser } from "../dataHooks/useUser";
import { Spinner } from "../components/Spinner";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const intra_url = "https://api.intra.42.fr/oauth/authorize";
  const redirect_url = `${intra_url}?response_type=code&redirect_uri=${process.env.REACT_APP_OAUTH_CALLBACK_URL}&client_id=${process.env.REACT_APP_OAUTH_42_UID}`;

  if (!code) {
    return redirect(redirect_url);
  }

  const response = await apiProvider()
    .get("auth/login", {
      params: { code },
    })
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      return redirect(redirect_url);
    });
  return response;
};

function TwoFactor({jwt}: {jwt: string}) {
  const [totp, setTotp] = useState("");
  const dispatch = useStoreDispatchContext();
  const [isError, setIsError] = useState(false);

  async function submitTotp(e: any) {
	setIsError(false)
    e.preventDefault();
    if (!totp) return;
    await apiProvider(jwt)
      .post("auth/2fa", {
        totp,
      })
      .then((result) => {
        dispatch({
          type: StoreActionType.LOGIN,
          content: result.data.jwt,
        });
      })
      .catch(() => {
        setTotp("");
        setIsError(true);
      });
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

export const LoginPage = () => {
  const { loading, loggedOut } = useUser();
  const dispatch = useStoreDispatchContext();
  const payload: any = useLoaderData() as any;

  useEffect(() => {
    if (payload.authorized)
      dispatch({
        type: StoreActionType.LOGIN,
        content: payload.jwt,
      });
  }, [payload, dispatch]);

  if (loading) return <Spinner />;

  if (!loggedOut) {
    return <Navigate to="/dashboard" />;
  }

  if (!payload.authorized) return <TwoFactor jwt={payload.jwt}/>;

  return (
    <div>
      <h1>Login</h1>
    </div>
  );
};
