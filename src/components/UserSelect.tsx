import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import type { User } from "../types.ts";
import { useDebounced } from "../utils";

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

export const UserSelect = ({
  selected,
  handleChange,
  pageSize = 5,
}: UserSelectProps) => {
  const [options, setOptions] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 300);

  const isFetchingRef = useRef(false);

  async function fetchPage(nextPage: number, q: string) {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const url = `/api/users?page=${nextPage}&pageSize=${pageSize}${q ? `&query=${encodeURIComponent(q)}` : ""}`;
      const res = await fetch(url);
      const data: {
        items: User[];
        pageInfo: { hasMore: boolean; page: number };
      } = await res.json();

      setOptions((prev) =>
        nextPage === 0 ? data.items : [...prev, ...data.items],
      );
      setHasMore(data.pageInfo.hasMore);
      setPage(data.pageInfo.page);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }

  // Load first page and whenever search changes
  useEffect(() => {
    setOptions([]);
    setHasMore(true);
    setPage(0);
    fetchPage(0, debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, pageSize]);

  const handleMenuScrollToBottom = () => {
    if (!isLoading && hasMore) fetchPage(page + 1, debounced);
  };

  return (
    <Select<User, false>
      autoFocus
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