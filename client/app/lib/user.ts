import * as React from "react";

export interface User {
  canVote: boolean;
  email: string;
  id: string;
  name: string;
  preferred_name: string;
}

export const UserContext = React.createContext<User | null>(null);

export const useUser = () => {
  const user = window.sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
