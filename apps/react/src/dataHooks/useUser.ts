import useSWR from "swr";
import { useStoreContext } from "../providers/storeProvider";
import { fetcherWithJWT } from "./axiosFetcher";

export function useUser() {
	const store = useStoreContext();
  const { data, mutate, error } = useSWR(["/users/me", store.JWT], fetcherWithJWT);

  const loading = !data && !error;
  const loggedOut = error && error.response.status === 403;

  return {
    loading,
    loggedOut,
    user: data,
    mutate
  };
}
