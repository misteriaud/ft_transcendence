import axios from "axios"

export const apiProvider = (JWT: string  | null = null) => axios.create({
  baseURL : '/api',
  headers: JWT ? {
 Authorization: `Bearer ${JWT}`,
  } : {},
  // .. other options
});

export const fetcher = (url: string) => apiProvider().get(url).then(res => res.data)
export const fetcherWithJWT = ([url, jwt]: [url:string, jwt: string]) => {
	// console.log(url, jwt)
	return apiProvider(jwt).get(url).then(res => res.data)
}
