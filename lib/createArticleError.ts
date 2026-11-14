const DETAIL_LIMIT = 240;
const VALIDATION_DETAIL_LIMIT = 300;

const URL_WITH_CREDENTIALS =
  /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/\S+/gi;

/**
 * One line an admin can act on, without a connection string or a stack.
 * Prisma's own message often starts with the query invocation and puts the
 * useful sentence last.
 */
export function shortDatabaseError(value: string): string {
  const lines = value
    .replace(URL_WITH_CREDENTIALS, "[redacted-url]")
    .replace(/\b(password|pwd|api[_-]?key|secret)=[^\s&]+/gi, "$1=[redacted]")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("at "));

  const preferred = [...lines].reverse().find((line) =>
    /constraint|column|unique|foreign key|ERROR:|denied|quota|read-only|readonly|timeout|closed the connection|authentication|Can't reach|invalid|null constraint|does not exist/i.test(
      line
    )
  );

  return (preferred ?? lines[lines.length - 1] ?? "Unknown error").slice(
    0,
    DETAIL_LIMIT
  );
}

function errorRecord(err: unknown): Record<string, unknown> | null {
  if (!err || typeof err !== "object") return null;
  return err as Record<string, unknown>;
}

function errorName(err: unknown): string {
  if (err instanceof Error && err.name) return err.name;
  const record = errorRecord(err);
  return record && typeof record.name === "string" ? record.name : "";
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  const record = errorRecord(err);
  return record && typeof record.message === "string" ? record.message : "";
}

function fieldTarget(meta: unknown): string {
  if (!meta || typeof meta !== "object" || !("target" in meta)) return "";
  const target = (meta as { target?: unknown }).target;
  if (typeof target === "string") return target;
  if (Array.isArray(target)) {
    return target.filter((item): item is string => typeof item === "string").join(", ");
  }
  return "";
}

/**
 * Prisma's validation message starts with the whole data object, including
 * the article HTML. Keep the argument path and the expected type.
 */
export function validationErrorDetail(message: string): string {
  const redacted = message
    .replace(URL_WITH_CREDENTIALS, "[redacted-url]")
    .replace(/\b(password|pwd|api[_-]?key|secret)=[^\s&]+/gi, "$1=[redacted]");
  const lines = redacted
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const diagnostic = lines.filter(
    (line) =>
      line.startsWith("Argument `") ||
      line.startsWith("Unknown argument ") ||
      line.startsWith("Invalid argument")
  );
  const chosen = diagnostic.length > 0 ? diagnostic.join(" ") : redacted;
  return chosen
    .replace(/"(?:\\.|[^"\\]){80,}"/g, '"[stripped]"')
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, VALIDATION_DETAIL_LIMIT);
}

/**
 * Prisma code plus a short message for an authenticated admin.
 * `code` is set only for a real Prisma code (P1000, P2002, …) or VALIDATION.
 */
export function describeArticleCreateError(err: unknown): {
  code?: string;
  detail: string;
} {
  const name = errorName(err);
  const record = errorRecord(err);
  const message = errorMessage(err);

  if (name === "PrismaClientKnownRequestError") {
    const code = record && typeof record.code === "string" ? record.code : undefined;
    const target = fieldTarget(record?.meta);
    const detail = shortDatabaseError(message);
    const withTarget =
      target && !detail.includes(target) ? `${detail} (${target})` : detail;
    return {
      ...(code ? { code } : {}),
      detail: withTarget.slice(0, DETAIL_LIMIT),
    };
  }

  if (name === "PrismaClientValidationError") {
    return {
      code: "VALIDATION",
      detail: validationErrorDetail(message),
    };
  }

  if (name === "PrismaClientInitializationError") {
    const code =
      record && typeof record.errorCode === "string" ? record.errorCode : undefined;
    return {
      ...(code ? { code } : {}),
      detail: shortDatabaseError(message || "Database client failed to start."),
    };
  }

  if (name === "PrismaClientRustPanicError") {
    return { code: "PANIC", detail: "Database client panicked." };
  }

  return { detail: shortDatabaseError(message || "Unknown error") };
}

/** Full server log. `console.error` on a Prisma error can drop `code` and `meta`. */
export function logArticleCreateError(err: unknown): void {
  console.error("Create failed:", err);
  const record = errorRecord(err);
  if (!record) return;
  if (record.code == null && record.errorCode == null && record.meta == null) return;
  console.error("Create failed details:", {
    code: record.code,
    errorCode: record.errorCode,
    meta: record.meta,
  });
}

/**
 * 500 body for POST /api/articles.
 * Staff who are not admins get the same public sentence as everyone else.
 */
export function articleCreateFailureResponse(
  err: unknown,
  exposeDetails: boolean
): { error: "Create failed"; code?: string; detail?: string } {
  if (!exposeDetails) return { error: "Create failed" };
  const described = describeArticleCreateError(err);
  return {
    error: "Create failed",
    ...(described.code ? { code: described.code } : {}),
    detail: described.detail,
  };
}
