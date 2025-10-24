import { AlertTriangle, Info, Shield } from "lucide-react";
import { getXSSDemoMode } from "../utils/xss-demo.ts";

export function XSSBanner() {
  const mode = getXSSDemoMode();

  if (mode === "off") return null;

  const isVulnerable = mode === "vulnerable";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isVulnerable ? "bg-red-600" : "bg-green-600"
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
              ? "⚠️ XSS DEMO MODE: VULNERABLE"
              : "✅ XSS DEMO MODE: PROTECTED"}
          </p>
          <p className="text-sm opacity-90">
            {isVulnerable
              ? "Cards use dangerouslySetInnerHTML - XSS attacks will execute. Check the first card!"
              : "Cards use safe React rendering - HTML is automatically escaped."}
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="?xssDemo=vulnerable"
            className={`px-3 py-1 rounded text-sm font-medium ${
              isVulnerable
                ? "bg-red-800 text-white"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            Vulnerable
          </a>
          <a
            href="?xssDemo=safe"
            className={`px-3 py-1 rounded text-sm font-medium ${
              !isVulnerable
                ? "bg-green-800 text-white"
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
          <strong>How to test:</strong> Look at the first card ("TICKET-1").
          {isVulnerable
            ? " In vulnerable mode, an alert will popup showing the XSS attack triggered."
            : " In protected mode, the malicious HTML is displayed as text, not executed."}
        </div>
      </div>
    </div>
  );
}