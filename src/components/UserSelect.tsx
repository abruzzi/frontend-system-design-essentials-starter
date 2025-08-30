import { useEffect, useState } from "react";
import Select from "react-select";
import type { User } from "../types.ts";

const AssigneeOption = ({ option }: { option: User }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-6 w-6 rounded-full bg-neutral-300">
        <img
          src={option.avatar_url ?? ""}
          alt={option.name}
          className="h-6 w-6 rounded-full"
        />
      </span>
      <span>{option.name}</span>
    </div>
  );
};

export const UserSelect = ({ selected, handleChange }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <Select<User, false>
      autoFocus
      classNamePrefix="rs"
      options={users}
      value={selected}
      onChange={handleChange}
      placeholder="Search users…"
      isClearable
      formatOptionLabel={(opt: User) => <AssigneeOption option={opt} />}
    />
  );
};
