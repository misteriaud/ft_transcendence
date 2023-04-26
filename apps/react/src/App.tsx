import React from "react";
import logo from "./logo.svg";
import "./App.css";

import { userContext } from "./userContext";
import Login from "./components/Login";

class App extends React.Component<{}, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      user: {},
    };
  }

  render() {
    return (
      <userContext.Provider value={this.state.user}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <Login />
          </header>
        </div>
      </userContext.Provider>
    );
  }
}

export default App;
