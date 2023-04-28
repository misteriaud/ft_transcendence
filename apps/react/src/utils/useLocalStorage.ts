import { useState } from "react";
import { Type } from "typescript";

export const useLocalStorage = (keyName: string, defaultValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = window.localStorage.getItem(keyName);
      if (value) {
        return JSON.parse(value);
      } else {
        window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (err) {
      return defaultValue;
    }
  });
  const setValue = (newValue: any) => {
    try {
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
    } catch (err) {}
    setStoredValue(newValue);
  };
  return [storedValue, setValue];
};

export function useLocalStorageReducer<State, Action>(keyName: string, reducer: (s: State, a: Action) => State, defaultValue: State): [State, (a: Action) => void]{
  const [storedValue, setStoredValue] = useState<State>(() => {
    try {
      const value = window.localStorage.getItem(keyName);
      if (value) {
        return JSON.parse(value);
      } else {
        window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (err) {
      return defaultValue;
    }
  });

  function dispatch(action: Action) {
	  const newState = reducer(storedValue, action);
	  console.log(newState)
	  try {
		window.localStorage.setItem(keyName, JSON.stringify(newState));
	  } catch (err) {
		throw err
	  }
	  setStoredValue(newState);
  }

  return [storedValue, dispatch];
};
