import { createContext, useContext } from "react";
import { useOutlet } from "react-router-dom";
import { useLocalStorageReducer } from "../utils/useLocalStorage";

export interface StoreState {
  JWT?: string;
}

export enum StoreActionType {
  LOGIN = "login",
  LOGOUT = "logout",
}
export type StoreAction = { type: StoreActionType; content?: any };

const StoreContext = createContext({} as StoreState);
const StoreDispatchContext = createContext<
  React.Dispatch<StoreAction> | undefined
>(undefined);

// COMPONENT

export function StoreProvider() {
  const outlet = useOutlet();
  const [store, dispatch] = useLocalStorageReducer(
    "store",
    storeReducer,
    {}
  );

  return (
    <StoreContext.Provider value={store}>
      <StoreDispatchContext.Provider value={dispatch}>
        {outlet}
      </StoreDispatchContext.Provider>
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  return useContext(StoreContext);
}
export function useStoreDispatchContext(): React.Dispatch<StoreAction> {
  const dispatch = useContext(StoreDispatchContext);
  if (dispatch === undefined) {
    throw new Error(
      "useStoreDispatchContext must be used within a StoreProvider"
    );
  }
  return dispatch;
}

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case StoreActionType.LOGIN: {
      // call this function when you want to authenticate the store
      const JWT: string = action.content;

      return {
        ...state,
        JWT,
      };
    }
    case StoreActionType.LOGOUT: {
      // call this function when you want to authenticate the store
	  delete state.JWT
	  return state
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

// fetcher: ([url, jwt]: [url: string, jwt: string]) => apiProvider(jwt).get(url).then(res => res.data)
