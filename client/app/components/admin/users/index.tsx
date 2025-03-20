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

  const { data, isLoading, refetch, isRefetching } = useQuery<User[]>({
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

  if (isLoading) {
    return (
      <div className="grid h-full place-items-center">
        <span className="material-symbols-sharp animate-spin text-9xl!">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <UserTable
      data={data ?? []}
      isRefetching={isRefetching}
      refetch={refetchData}
    />
  );
};

export default Users;
