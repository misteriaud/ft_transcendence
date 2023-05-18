import axios from "axios";
import useSWR from "swr";
import { useStoreContext } from "./useContext";

export const apiProvider = (JWT: string | null = null) =>
	axios.create({
		baseURL: "/api",
		headers: JWT
			? {
					Authorization: `Bearer ${JWT}`
			  }
			: {}
		// .. other options
	});

const fetcherWithJWT = ([url, jwt]: [url: string, jwt: string]) => {
	// console.log(url, jwt)
	return apiProvider(jwt)
		.get(url)
		.then((res) => res.data);
};

/**
 * API call hook
 * @returns Axios instance set with the good prefix and with the JWT if it exist
 */
export function useApi() {
	const { JWT } = useStoreContext();

	return apiProvider(JWT);
}

/**
 * Custom SWR Hook that use underlying Axios instance with the JWT it it exist
 * @param path define the API route that we want to fetch
 * @returns
 * data: data for the given key resolved by fetcher (or undefined if not loaded)
 * error: error thrown by fetcher (or undefined)
 * isLoading: if there's an ongoing request and no "loaded data". Fallback data and previous data are not considered "loaded data"
 * isValidating: if there's a request or revalidation loading
 * mutate: mutate(data?, options?) function to mutate the cached data (details)
 */
export function useCustomSWR(path: string) {
	const store = useStoreContext();
	return useSWR([path, store.JWT], fetcherWithJWT, {
		shouldRetryOnError: false
	});
}
