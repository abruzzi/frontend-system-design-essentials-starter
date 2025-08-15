import * as Popover from "@radix-ui/react-popover";
import Select, { type SingleValue } from "react-select";
import { useMemo, useState } from "react";

type User = { id: string; name: string; avatar?: string };

type CardProps = {
  id: string;
  title: string;
  users: User[];
  assigneeId?: string;
  onAssign: (ticketId: string, userId: string) => void;
};

const users: User[] = [
  { id: "u_1", name: "Mina" },
  { id: "u_2", name: "Alex" },
  { id: "u_3", name: "Sam" },
];

type Option = { value: string; label: string; avatar?: string };

const AssigneeOption = ({ option }: { option: Option }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-6 w-6 rounded-full bg-neutral-300" />
      <span>{option.label}</span>
    </div>
  );
};
export const Card = ({ id, title, assigneeId, onAssign }: CardProps) => {
  const [open, setOpen] = useState(false);

  const options: Option[] = useMemo(
    () => users.map((u) => ({ value: u.id, label: u.name, avatar: u.avatar })),
    [users],
  );

  const selected = options.find((o) => o.value === assigneeId) ?? null;

  function handleChange(opt: SingleValue<Option>) {
    if (!opt) return;
    onAssign(id, opt.value);
    setOpen(false);
  }

  return (
    <article className="rounded-lg border border-neutral-200 bg-white shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium leading-6">{title}</h3>
      </div>

      <div className="mt-3 flex items-start justify-between">
        <span className="inline-flex items-center rounded-md border border-indigo-300 bg-indigo-50 px-2 py-1 text-[12px] font-mono text-indigo-700">
          {id}
        </span>

        {/* Avatar = popover trigger */}
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="Open assignee picker"
              className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-300 text-[11px] font-medium
                         hover:ring-2 hover:ring-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {selected?.label?.[0] /* optional initial in the dot */}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="end"
              side="bottom"
              sideOffset={8}
              collisionPadding={8}
              className="z-50 w-72 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl outline-none"
            >
              <div className="mb-2 text-sm font-medium text-neutral-700">
                Assign user
              </div>

              <Select<Option, false>
                autoFocus
                classNamePrefix="rs"
                options={options}
                value={selected}
                onChange={handleChange}
                placeholder="Search users…"
                isClearable
                styles={{
                  control: (base, s) => ({
                    ...base,
                    minHeight: 40,
                    borderColor: s.isFocused ? "#6366f1" : "#d4d4d8",
                    boxShadow: s.isFocused
                      ? "0 0 0 2px rgba(99,102,241,.25)"
                      : "none",
                  }),
                  option: (base, s) => ({
                    ...base,
                    backgroundColor: s.isFocused
                      ? "rgba(99,102,241,.08)"
                      : "transparent",
                    color: "#111827",
                    cursor: "pointer",
                  }),
                  menu: (base) => ({ ...base, zIndex: 60 }),
                }}
                formatOptionLabel={(opt: Option) => (
                  <AssigneeOption option={opt} />
                )}
              />
              <Popover.Arrow className="fill-white drop-shadow" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </article>
  );
};
