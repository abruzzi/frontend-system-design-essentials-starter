import { useState, useRef, useEffect } from "react";
import { useBoardContext } from "../../../shared/BoardContext.tsx";
import type { User } from "../../../types.ts";

const UserAvatar = ({ user, isSelected, onClick }: { 
  user: User; 
  isSelected: boolean; 
  onClick: () => void;
}) => {
  const baseClasses = "inline-block h-7 w-7 rounded-full object-cover cursor-pointer transition-all duration-200 border-2";
  const selectedClasses = isSelected 
    ? "border-indigo-500 ring-2 ring-indigo-200 opacity-100" 
    : "border-transparent hover:border-neutral-300 opacity-70 hover:opacity-100";
  
  return user.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={user.name}
      title={`${user.name}${isSelected ? ' (selected)' : ''}`}
      aria-label={`assignee-${user.id}`}
      className={`${baseClasses} ${selectedClasses}`}
      loading="lazy"
      onClick={onClick}
    />
  ) : (
    <span
      aria-label={`assignee-${user.id}`}
      title={`${user.name}${isSelected ? ' (selected)' : ''}`}
      className={`inline-flex items-center justify-center text-[11px] font-medium cursor-pointer transition-all duration-200 border-2 h-7 w-7 rounded-full ${
        isSelected 
          ? "bg-indigo-100 border-indigo-500 ring-2 ring-indigo-200" 
          : "bg-neutral-300 border-transparent hover:border-neutral-400 hover:bg-neutral-200"
      }`}
      onClick={onClick}
    >
      {user.name?.[0] ?? "?"}
    </span>
  );
};

export const AssigneeList = () => {
    const { state, toggleAssigneeFilter, clearAssigneeFilters } = useBoardContext();
    const selectedAssigneeIds = state.selectedAssigneeIds;
    const users = Object.values(state.usersById);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const MAX_VISIBLE_USERS = 5;
    const visibleUsers = users.slice(0, MAX_VISIBLE_USERS);
    const hiddenUsers = users.slice(MAX_VISIBLE_USERS);
    const hasHiddenUsers = hiddenUsers.length > 0;

    const handleAvatarClick = (userId: number) => {
        toggleAssigneeFilter(userId);
    };

    const handleClearFilters = () => {
        clearAssigneeFilters();
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="flex items-center gap-2">
          {/* Visible users (first 5) */}
          {visibleUsers.map((u) => {
              const isSelected = selectedAssigneeIds.includes(u.id);
              return (
                <UserAvatar
                  key={u.id}
                  user={u}
                  isSelected={isSelected}
                  onClick={() => handleAvatarClick(u.id)}
                />
              );
          })}
          
          {/* More users dropdown */}
          {hasHiddenUsers && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 border-2 border-transparent hover:border-neutral-300 hover:bg-neutral-100 text-[11px] font-medium cursor-pointer transition-all duration-200"
                title={`${hiddenUsers.length} more users`}
                aria-label="More users"
              >
                +{hiddenUsers.length}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-9 right-0 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 min-w-48 max-h-64 overflow-y-auto">
                  {hiddenUsers.map((user) => {
                    const isSelected = selectedAssigneeIds.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          handleAvatarClick(user.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-50 transition-colors duration-150 ${
                          isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-neutral-700'
                        }`}
                      >
                        <UserAvatar
                          user={user}
                          isSelected={isSelected}
                          onClick={() => {}}
                        />
                        <span className="truncate">{user.name}</span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-indigo-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Clear filters button */}
          {selectedAssigneeIds.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="ml-2 px-2 py-1 text-xs text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors duration-200"
              title="Clear assignee filters"
            >
              Clear ({selectedAssigneeIds.length})
            </button>
          )}
      </div>
    );
};
