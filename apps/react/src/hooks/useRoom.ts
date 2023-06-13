import { useCustomSWR } from './useApi';

export function useRoom(id: number) {
	const { data, mutate, isLoading, error } = useCustomSWR(`/rooms/${id}`);

	return {
		room: data,
		mutate,
		isLoading,
		error
	};
}

export function useRooms() {
	const { data, mutate, isLoading, error } = useCustomSWR(`/rooms`);

	return {
		data,
		mutate,
		isLoading,
		error
	};
}
