import { useCallback, useState } from "react";

/**
 * Hook that returns [copied, copyToClipboard].
 * `copied` is true for 2 seconds after a successful copy, then resets to false.
 */
export function useCopyToClipboard(): [
  boolean,
  (text: string) => Promise<void>,
] {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return [copied, copyToClipboard];
}
