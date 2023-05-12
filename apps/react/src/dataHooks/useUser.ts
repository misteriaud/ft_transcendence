import useSWR from "swr";
import { useStoreContext } from "../providers/storeProvider";
import { fetcherWithJWT } from "./axiosFetcher";

export function useMe() {
	const store = useStoreContext();
  const { data, mutate, error } = useSWR(["/users/me", store.JWT], fetcherWithJWT);

  const loading = !data && !error;
  const loggedOut = error && error.response.status === 403;

  return {
    loading,
    loggedOut,
    me: data,
    mutate
  };
}

export function useUser(id: string) {
	const store = useStoreContext();
  const { data, mutate, error } = useSWR([`/users/${id}`, store.JWT], fetcherWithJWT);

  const loading = !data && !error;
  const forbiden = error && error.response.status === 403;

  return {
    loading,
    forbiden,
    user: data,
    mutate
  };
}
