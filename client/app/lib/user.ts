import * as React from "react";

export const TokenContext = React.createContext("");

export const useToken = () => {
  const token = window.sessionStorage.getItem("token");
  return token ?? "";
};
