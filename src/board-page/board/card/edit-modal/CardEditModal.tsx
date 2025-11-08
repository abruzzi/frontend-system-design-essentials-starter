import { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useBoardContext } from "../../../../shared/BoardContext.tsx";
import { UserSelect } from "../UserSelect.tsx";
import type { User } from "../../../../types.ts";

type CardDetailModalProps = {
  cardId: string;
  title: string;
  description?: string;
  assignee?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CardEditModal = ({
  cardId,
  title: initialTitle,
  description: initialDescription,
  assignee: initialAssignee,
  open,
  onOpenChange,
}: CardDetailModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || "");
  const [assigneeState, setAssigneeState] = useState<User | undefined>(
    initialAssignee,
  );
  const [isSaving, setIsSaving] = useState(false);
  const { updateCard, upsertUser } = useBoardContext();

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Sync state when modal opens or props change
  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription || "");
    setAssigneeState(initialAssignee);
  }, [initialTitle, initialDescription, initialAssignee, open]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: {
        title: string;
        description?: string;
        assignee?: User | null;
      } = {
        title,
        description: description || undefined,
        assignee: assigneeState || null,
      };

      const res = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to update card ${cardId}`);
      }

      const updatedCard = await res.json();

      // Update local state
      updateCard(cardId, {
        title: updatedCard.title,
        description: updatedCard.description,
        assigneeId: assigneeState?.id,
      });

      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update card", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignUser = (user: User | null) => {
    if (user) {
      upsertUser(user);
    }
    setAssigneeState(user || undefined);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-2xl p-6 overflow-y-auto outline-none">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-semibold text-neutral-900">
              Edit Card Details
            </Dialog.Title>
            <Dialog.Close className="text-neutral-500 hover:text-neutral-700 transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="card-title"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Title
              </label>
              <input
                id="card-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter card title"
              />
            </div>

            <div>
              <label
                htmlFor="card-description"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="card-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Enter card description (optional)"
              />
            </div>

            <div>
              <label
                htmlFor="card-assignee"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Assignee
              </label>
              <div
                id="card-assignee"
                onKeyDown={(e) => {
                  console.log(e);
                  if (e.key === "Tab" && !e.shiftKey) {
                    e.preventDefault();
                    buttonRef.current?.focus();
                  }
                }}
              >
                <UserSelect
                  selected={assigneeState || null}
                  handleChange={handleAssignUser}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <button
                ref={buttonRef}
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
