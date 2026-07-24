import { NextResponse } from "next/server";
import { z, type ZodType } from "zod";

type ErrorFields = Record<string, string[]>;

function compactFieldErrors(
  fields: Record<string, string[] | undefined>,
): ErrorFields {
  return Object.fromEntries(
    Object.entries(fields).filter((entry): entry is [string, string[]] =>
      Array.isArray(entry[1]),
    ),
  );
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: ErrorFields,
  ) {
    super(message);
  }
}

export async function parseJson<T>(request: Request, schema: ZodType<T>) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const result = await schema.safeParseAsync(payload);
  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    throw new ApiError(
      422,
      "VALIDATION_ERROR",
      "Payload is invalid.",
      compactFieldErrors(fieldErrors),
    );
  }

  return result.data;
}

export function parseQuery<T>(url: URL, schema: ZodType<T>) {
  const payload = Object.fromEntries(url.searchParams.entries());
  const result = schema.safeParse(payload);
  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    throw new ApiError(
      422,
      "VALIDATION_ERROR",
      "Query parameters are invalid.",
      compactFieldErrors(fieldErrors),
    );
  }
  return result.data;
}

export function parseParams<T>(payload: unknown, schema: ZodType<T>) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    throw new ApiError(
      422,
      "VALIDATION_ERROR",
      "Route parameters are invalid.",
      compactFieldErrors(fieldErrors),
    );
  }
  return result.data;
}

export function jsonResponse<T>(schema: ZodType<T>, payload: T, status = 200) {
  return NextResponse.json(schema.parse(payload), { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
        },
      },
      { status: error.status },
    );
  }

  console.error("Unhandled API error:", error);
  const databaseUnavailable =
    error instanceof Error &&
    ["MongooseServerSelectionError", "MongoNetworkError"].includes(error.name);

  return NextResponse.json(
    {
      error: {
        code: databaseUnavailable ? "DATABASE_UNAVAILABLE" : "INTERNAL_ERROR",
        message: databaseUnavailable
          ? "The database is temporarily unavailable."
          : "An unexpected error occurred.",
      },
    },
    { status: databaseUnavailable ? 503 : 500 },
  );
}
