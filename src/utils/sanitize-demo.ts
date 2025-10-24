import DOMPurify from "dompurify";

export type SanitizeDemoMode = "vulnerable" | "safe" | "off";

export function getSanitizeDemoMode(): SanitizeDemoMode {
  if (typeof window === "undefined") return "off";

  const param = new URLSearchParams(window.location.search).get("sanitizeDemo");
  if (!param) return "off";

  const value = param.trim().toLowerCase();

  if (value === "vulnerable") return "vulnerable";
  if (value === "safe") return "safe";

  return "off";
}

/**
 * Malicious rich text content for demonstration
 *
 * Contains:
 * 1. Legitimate formatting (<strong>) - should be kept
 * 2. XSS attack via <img onerror> - should be removed
 * 3. XSS attack via <script> - should be removed
 */
export const MALICIOUS_RICH_TEXT = `
This bug is <strong>critical</strong> and needs <em>immediate</em> attention.

<img src=x onerror="
  console.error('🚨 XSS via img onerror!');
  alert('XSS Attack!\\n\\nIn a real attack, this would steal your data!');
">

<script>
  console.error('🚨 XSS via script tag!');
  alert('Script tag executed!');
</script>

Please see the <a href="javascript:alert('XSS via javascript: URL')">documentation</a>.

<iframe src="https://evil.com" style="display:none"></iframe>
`.trim();

export const sanitizeHTML = (content: String) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "strong", "em", "a", "p", "br"],
    ALLOWED_ATTR: ["href", "title"],
  });
};
