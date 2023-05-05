import React from "react";
import axios from "axios";
import { error } from "console";

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
    }).catch(error => {
		console.log(error)
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
