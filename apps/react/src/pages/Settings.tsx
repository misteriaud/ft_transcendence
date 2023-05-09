// Home.jsx
import { ChangeEvent, useState } from "react";
import { useMe, useUser } from "../dataHooks/useUser";
import { apiProvider } from "../dataHooks/axiosFetcher";
import { useStoreContext } from "../providers/storeProvider";

export const SettingsPage = () => {
  const { user, mutate } = useMe();
  const [userSettings, setUserSettings] = useState({
    username: user.username,
    twoFactorEnabled: user.twoFactorEnabled,
  });
  const { JWT } = useStoreContext();
  const [error, setError] = useState("");

  function handleInput(e: any) {
    setUserSettings({
      ...userSettings,
      username: e.target.value,
    });
  }

  async function submitSettings(e: any) {
    e.preventDefault();
    setError("");
    await apiProvider(JWT)
      .put("users/me", userSettings)
      .then((result) => {
        mutate({
          ...user,
          ...userSettings,
        });
        if (result.data.twoFactorSecret)
          alert(`nouveau secret: ${result.data.twoFactorSecret}`);
      })
      .catch((error) => {
        // setTotp("");
        setError(error.response.data.message);
      });
  }

  return (
    <div>
      <h1>Bonjour {user.username}</h1>
      {error && <h1>An error happened: {error}</h1>}
      <form onSubmit={submitSettings}>
        <input value={userSettings.username} onChange={handleInput}></input>
        2FA:
        <input
          type="checkbox"
          checked={userSettings.twoFactorEnabled}
          value={
            userSettings.twoFactorEnabled
              ? "Desactiver la 2FA"
              : "Activer la 2FA"
          }
          onClick={() =>
            setUserSettings({
              ...userSettings,
              twoFactorEnabled: !userSettings.twoFactorEnabled,
            })
          }
        />
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
};
