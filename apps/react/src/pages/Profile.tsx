// Home.jsx
import { useUser } from "../dataHooks/useUser";


export const ProfilePage = () => {
  const { user } = useUser();
//   console.log(user)

  return (
    <div>
      <h1>Bonjour {user.username}</h1>
    </div>
  );
};
