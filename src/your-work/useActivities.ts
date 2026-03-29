import { useEffect, useState } from "react";

export type Activity = {
  name: string;
  timestamp: number | string;
};

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchActivities() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/activities", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch activities (${response.status})`);
        }

        const data = (await response.json()) as Activity[];
        setActivities(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error("Failed to fetch activities"));
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();

    return () => controller.abort();
  }, []);

  return { activities, loading, error };
}

