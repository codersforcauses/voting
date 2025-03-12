import * as React from "react";

export interface User {
  role: 'user' | 'admin';
  email: string;
  id: string;
  name: string;
  preferred_name: string;
  token: string;
}

export const UserContext = React.createContext<User | null>(null);

export const useUser = () => {
  const user = window.sessionStorage.getItem("user");
  console.log(user);
  return user ? JSON.parse(user) : null;
};
