import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Calendar, FileText } from "lucide-react";
import { YourWorkPageSkeleton } from "./YourWorkPageSkeleton.tsx";

type BoardSummary = {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  lastUpdated: string;
};

export const YourWorkPage = () => {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/boards")
      .then((r) => r.json())
      .then((data) => {
        setBoards(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch boards", err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <YourWorkPageSkeleton />;
  }

  return (
    <div className="flex-1 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Your Work
            </h1>
            <p className="text-neutral-600">
              All your boards and projects in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="block bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition-shadow hover:border-indigo-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-neutral-900">
                      {board.name}
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {board.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{board.cardCount} cards</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Updated {formatDate(board.lastUpdated)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {boards.length === 0 && (
            <div className="text-center py-12">
              <LayoutGrid className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No boards found</p>
            </div>
          )}
        </div>
    </div>
  );
};

