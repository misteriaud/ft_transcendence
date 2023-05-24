import { useParams } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { Spinner } from '@material-tailwind/react';

export const ProfilePage = () => {
	const { username } = useParams();
	const { isLoading, forbiden, user } = useUser(username);

	if (isLoading) {
		return <Spinner />;
	}
	if (forbiden) {
		// ???
		return <h2>Forbidden</h2>;
	}
	if (!user) {
		return <h2>User not Found</h2>;
	}
	return (
		<>
			<h2>{user.username}'s Profile</h2>
			{/* Display additional profile information */}
		</>
	);
};
