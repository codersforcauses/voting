import { useQuery } from "@tanstack/react-query";
import UserTable from "./table";
import { BASE_URL } from "@/lib/utils";
import { useToken } from "@/lib/user";
import * as React from "react";

export type User = {
  id: string;
  student_num?: string | null;
  preferred_name: string;
  name: string;
  email: string;
  code: number;
  role: "users" | "admin";
};

const Users = () => {
  const token = useToken();

  const { data, refetch, isRefetching } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () =>
      fetch(`${BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
    refetchInterval: 1000 * 10,
  });

  const refetchData = React.useCallback(() => {
    refetch();
  }, [refetch]);

  return data ? (
    <UserTable data={data} isRefetching={isRefetching} refetch={refetchData} />
  ) : null;
};

export default Users;
