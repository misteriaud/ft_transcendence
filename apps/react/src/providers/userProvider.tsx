import { createContext, useContext} from "react";
import { useOutlet} from "react-router-dom";
import { useLocalStorageReducer } from "../utils/useLocalStorage";
import jwt from 'jwt-decode'

// export interface i_User {
// 	username:	string;
// 	JWT:		string;
// }
export class UserState {
	public username: string;
	public JWT: string;
	public log: boolean;

	constructor() {
		this.username = "";
		this.JWT = "";
		this.log = false
	}
};

export enum UserActionType {
	LOGIN = "login",
	LOGOUT = "logout"
}
type UserAction =
	{ type: UserActionType.LOGIN, content: any }

// const userInitState: UserState = {
// 	username: "",
// 	JWT: "",
// 	log: false
// }

const UserContext = createContext(new UserState);
const UserDispatchContext = createContext<React.Dispatch<UserAction> | undefined>(undefined)

export function UserProvider() {
	const outlet = useOutlet();
	const [user, dispatch] = useLocalStorageReducer("user", userReducer, new UserState)
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
