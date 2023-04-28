import { createContext, useContext, useReducer, ReactNode } from "react";
import { useOutlet, useNavigate } from "react-router-dom";
import { useLocalStorage, useLocalStorageReducer } from "../utils/useLocalStorage";
import jwt from 'jwt-decode'

// export interface i_User {
// 	username:	string;
// 	JWT:		string;
// }
export type UserState = {
	username: string,
	JWT: string,
	log: boolean
};

export enum UserActionType {
	LOGIN = "login",
	LOGOUT = "logout"
}
type UserAction =
	{ type: UserActionType.LOGIN, content: any }

const userInitState: UserState = {
	username: "",
	JWT: "",
	log: false
}

const UserContext = createContext(userInitState);
const UserDispatchContext = createContext<React.Dispatch<UserAction> | undefined>(undefined)

export function UserProvider() {
	const outlet = useOutlet();
	const [user, dispatch] = useLocalStorageReducer("user", userReducer, userInitState)
	// const [user, dispatch] = useReducer(userReducer, userInitState)

	return (
		<UserContext.Provider value={user}>
			<UserDispatchContext.Provider value={dispatch} >
				{outlet}
			</UserDispatchContext.Provider>
		</UserContext.Provider>
	);
};

export function useUserContext() {
	return useContext(UserContext);
};
export function useUserDispatchContext(): React.Dispatch<UserAction> {
	const dispatch = useContext(UserDispatchContext);
	if (dispatch === undefined) {
		throw new Error("useUserDispatchContext must be used within a UserProvider");
	}
	return dispatch;
};

function userReducer(state: UserState, action: UserAction): UserState {
	switch (action.type) {
    case UserActionType.LOGIN: {
	  // call this function when you want to authenticate the user
		const user = jwt(action.content)
		return {
			...user as UserState,
			log: true,
			JWT: action.content
		}
	  }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
