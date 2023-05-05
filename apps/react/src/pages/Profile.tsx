// Home.jsx
import { AxiosInstance } from "axios";
import { useLoaderData } from "react-router-dom";

export const loader = (apiClient: AxiosInstance) => async () => {
  return await apiClient
    .get("users/me")
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      return error;
    });
};

export const ProfilePage = () => {
  const data: any = useLoaderData();
  console.log(data);
  return (
    <div>
      <h1>This is the Profile Page</h1>
    </div>
  );
};
