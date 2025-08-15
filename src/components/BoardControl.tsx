import { AssigneeList } from "./AssigneeList.tsx";

const SearchIcon = () => (
  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

export const BoardControl = () => (
  <div className="w-full bg-neutral-100 border-neutral-200">
    <div className="mx-auto max-w-6xl px-4 py-3">
      <div className="inline-flex items-center gap-4 py-2">
        <div className="relative w-72">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search board"
            className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <AssigneeList />
      </div>
    </div>
  </div>
);
