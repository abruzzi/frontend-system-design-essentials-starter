import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import type { User } from "../../../types.ts";
import { useDebounced } from "../../../utils";
import { useQuery } from "../../../shared/QueryProvider.tsx";

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

type UserSelectProps = {
  selected: User | null;
  handleChange: (u: User | null) => void;
  pageSize?: number;
};

type PageResult = {
  items: User[];
  pageInfo: { hasMore: boolean; page: number };
};

export async function fetchUsers(
  page: number,
  pageSize: number,
  q: string,
): Promise<PageResult> {
  const url =
    `/api/users?page=${page}&pageSize=${pageSize}` +
    (q ? `&query=${encodeURIComponent(q)}` : "");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);
  return res.json();
}

export const UserSelect = ({
  selected,
  handleChange,
  pageSize = 5,
}: UserSelectProps) => {
  const [options, setOptions] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 300);

  // Reset when search or page size changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    setOptions([]);
    setHasMore(true);
    setPage(0);
  }, [debounced, pageSize]);

  // Query for the current page (keyed by page + search)
  const { data, /* error, */ isLoading } = useQuery<PageResult>(
    `users:${debounced}:${pageSize}:${page}`,
    () => fetchUsers(page, pageSize ?? 5, debounced),
    60_000,
  );

  // When a page loads, merge it into options and update paging flags
  useEffect(() => {
    if (!data) return;
    setOptions((prev) => (page === 0 ? data.items : [...prev, ...data.items]));
    setHasMore(data.pageInfo.hasMore);
  }, [data, page]);

  const handleMenuScrollToBottom = () => {
    if (!isLoading && hasMore) setPage((p) => p + 1);
  };

  return (
    <Select<User, false>
      classNamePrefix="rs"
      options={options}
      value={selected}
      onChange={handleChange}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      onInputChange={(val, meta) => {
        if (meta.action === "input-change") setQuery(val); // server-side search
        return val;
      }}
      // Server does the filtering; keep all options client-side
      filterOption={() => true}
      placeholder="Search users…"
      isClearable
      isLoading={isLoading}
      getOptionValue={(u) => String(u.id)}
      getOptionLabel={(u) => u.name}
      formatOptionLabel={(opt: User) => <AssigneeOption option={opt} />}
      loadingMessage={() => "Loading..."}
      noOptionsMessage={() => (isLoading ? "Loading..." : "No users")}
    />
  );
};
