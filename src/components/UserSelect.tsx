import { useEffect, useState } from "react";
import Select from "react-select";
import type { User } from "../types.ts";

type Option = { value: string; label: string; avatar?: string };

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
      styles={{
        control: (base, s) => ({
          ...base,
          minHeight: 40,
          borderColor: s.isFocused ? "#6366f1" : "#d4d4d8",
          boxShadow: s.isFocused ? "0 0 0 2px rgba(99,102,241,.25)" : "none",
        }),
        option: (base, s) => ({
          ...base,
          backgroundColor: s.isFocused ? "rgba(99,102,241,.08)" : "transparent",
          color: "#111827",
          cursor: "pointer",
        }),
        menu: (base) => ({ ...base, zIndex: 60 }),
      }}
      formatOptionLabel={(opt: User) => <AssigneeOption option={opt} />}
    />
  );
};
