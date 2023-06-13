import { useCustomSWR } from './useApi';

export function useMe() {
	const { data, mutate, error, isLoading } = useCustomSWR('/users/me');

	const loggedIn = error === undefined && data !== undefined;

	return {
		isLoading,
		loggedIn,
		me: data,
		mutate,
		error
	};
}

export function useUser(id: number | string) {
	const { data, mutate, error, isLoading } = useCustomSWR(`/users/${id}`);

	const forbiden = error && error.response.status === 403;

	return {
		isLoading,
		forbiden,
		user: data,
		mutate,
		error
	};
}

export function useUsers() {
	const { data, mutate, isLoading, error } = useCustomSWR('/users');

	return {
		users: data,
		mutate,
		isLoading,
		error
	};
}
