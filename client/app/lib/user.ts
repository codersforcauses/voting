import * as React from "react";

export const TokenContext = React.createContext("");

export const useToken = () => {
  const token = window.localStorage.getItem("token");
  return token ?? "";
};
