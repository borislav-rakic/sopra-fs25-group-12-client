import { message } from "antd";

/**
 * Type guard to check for Axios-like response shape.
 */
function hasResponse(
  error: unknown,
): error is { response: { data?: unknown; status?: number } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  );
}

/**
 * Handle API errors in a safe, linter-compliant way.
 */
export function handleApiError(
  error: unknown,
  fallback = "Something went wrong.",
) {
  let msg = fallback;

  if (hasResponse(error)) {
    const data = error.response.data;

    if (typeof data === "object" && data !== null) {
      if (
        "error" in data &&
        typeof (data as Record<string, unknown>).error === "string"
      ) {
        msg = data.error as string;
      } else if (
        "message" in data &&
        typeof (data as Record<string, unknown>).message === "string"
      ) {
        msg = data.message as string;
      }
    }
  } else if (error instanceof Error) {
    msg = error.message;
  }

  console.error("API Error:", error);
  message.open({
    type: "error",
    content: msg,
    duration: 3,
  });
}
