import axios from "axios";

export const apiProvider = axios.create({
  baseURL : '/api',
//   headers: {
// //  Authorization: `<Your Auth Token>`,
//     Content-Type: "application/json",
//     timeout : 1000,
//   },
  // .. other options
});
