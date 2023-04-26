import { createContext, useContext, useMemo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../utils/useLocalStorage";
import jwt from 'jwt-decode'

export interface i_User {
	username:	string;
	JWT:		string;
}

const AuthContext = createContext({});

export const AuthProvider = ({ children } : {children: ReactNode}) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

  // call this function when you want to authenticate the user
  const login = async (token: string) => {
	setUser(null);

	const user = jwt(token)
    setUser(user);
    navigate("/dashboard");
  };

  // call this function to sign out logged in user
  const logout = () => {
    setUser(null);
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
