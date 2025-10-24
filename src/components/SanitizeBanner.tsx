import { AlertTriangle, Shield, Info } from "lucide-react";
import { getSanitizeDemoMode } from "../utils/sanitize-demo";

export function SanitizeBanner() {
  const mode = getSanitizeDemoMode();

  if (mode === "off") return null;

  const isVulnerable = mode === "vulnerable";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isVulnerable ? "bg-orange-600" : "bg-emerald-600"
      } text-white px-4 py-3 shadow-lg`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {isVulnerable ? (
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        ) : (
          <Shield className="h-5 w-5 flex-shrink-0" />
        )}

        <div className="flex-1">
          <p className="font-semibold">
            {isVulnerable
              ? "⚠️ INPUT SANITIZATION DEMO: VULNERABLE"
              : "✅ INPUT SANITIZATION DEMO: PROTECTED"}
          </p>
          <p className="text-sm opacity-90">
            {isVulnerable
              ? "Card descriptions use raw dangerouslySetInnerHTML - attacks will execute!"
              : "Card descriptions are sanitized with DOMPurify - malicious code is removed."}
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="?sanitizeDemo=vulnerable"
            className={`px-3 py-1 rounded text-sm font-medium ${
              isVulnerable
                ? "bg-orange-800 text-white"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            Vulnerable
          </a>
          <a
            href="?sanitizeDemo=safe"
            className={`px-3 py-1 rounded text-sm font-medium ${
              !isVulnerable
                ? "bg-emerald-800 text-white"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            Protected
          </a>
          <a
            href="/"
            className="px-3 py-1 rounded text-sm font-medium bg-white/20 hover:bg-white/30"
          >
            Exit Demo
          </a>
        </div>
      </div>

      {/* Info box */}
      <div className="max-w-7xl mx-auto mt-2 flex items-start gap-2 bg-white/10 rounded px-3 py-2 text-sm">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong>How to test:</strong> Look at TICKET-1's description field.
          {isVulnerable
            ? " Vulnerable mode renders raw HTML - malicious scripts will execute (alert popup)."
            : " Protected mode sanitizes HTML - safe formatting kept, malicious code removed."}
        </div>
      </div>
    </div>
  );
}
