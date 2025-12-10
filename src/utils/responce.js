// ─────────────────────────────────────────────
//  DEAD-XMILE ENTRYPOINT — RESPONSE FORMAT
//  A clean unified API response helper
// ─────────────────────────────────────────────

export default function response(success = true, message = "", data = {}) {
  return {
    success,
    message,
    data,
    timestamp: Date.now(),
  };
}
