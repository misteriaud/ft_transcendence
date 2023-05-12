import axios from "axios"
import useSWR from "swr";
import { useStoreContext } from "../providers/storeProvider";

export const apiProvider = (JWT: string | null = null) => axios.create({
	baseURL: '/api',
	headers: JWT ? {
		Authorization: `Bearer ${JWT}`,
	} : {},
	// .. other options
});

export const fetcher = (url: string) => apiProvider().get(url).then(res => res.data)
export const fetcherWithJWT = ([url, jwt]: [url: string, jwt: string]) => {
	// console.log(url, jwt)
	return apiProvider(jwt).get(url).then(res => res.data)
}

export function useApi() {
	const { JWT } = useStoreContext();

	return apiProvider(JWT)
}

export function useCustomSWR(path: string) {
	const store = useStoreContext();
	const { data, mutate, error } = useSWR([path, store.JWT], fetcherWithJWT);

	const loading = !data && !error;

	return {
		loading,
		data,
		error,
		mutate
	};
}
