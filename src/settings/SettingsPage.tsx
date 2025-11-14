import { useState, useEffect } from "react";
import { useBoardContext } from "../shared/BoardContext.tsx";
import type { User } from "../types.ts";
import { Save, User as UserIcon, Mail } from "lucide-react";

export const SettingsPage = () => {
  const { state } = useBoardContext();
  const userId = 2;
  const user = state.usersById[userId];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: `${user.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      });
    } else {
      // Fetch user if not in context
      fetch(`/api/users/${userId}`)
        .then((r) => r.json())
        .then((userData: User) => {
          setFormData({
            name: userData.name,
            email: `${userData.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          });
        })
        .catch((err) => {
          console.error("Failed to fetch user", err);
        });
    }
  }, [user, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-2xl">
          <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-6" />
          <div className="h-64 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Settings
            </h1>
            <p className="text-neutral-600">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Display Name
                  </div>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Email cannot be changed
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <div>
                  {saved && (
                    <p className="text-sm text-green-600">Settings saved!</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Profile Picture
            </h2>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden">
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm text-neutral-600">
                  Your profile picture is managed by your account provider.
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

