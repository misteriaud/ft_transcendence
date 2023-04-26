import React from "react";
import axios from "axios";

export default class PersonList extends React.Component {
  state: {
    persons: Array<any>;
  } = {
    persons: [],
  };

  componentDidMount() {
    axios.get(`/api/auth/login`).then((res) => {
      const persons = res.data;
      this.setState({ persons });
    });
  }

  render() {
    return (
      <ul>
        {this.state.persons.map((person) => (
          <li key={person.id}>{person.name}</li>
        ))}
      </ul>
    );
  }
}
