import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth-session";
import { createOpenLetter, listOpenLetters } from "@/lib/open-letter-store";

export const runtime = "nodejs";

type CreateOpenLetterBody = {
  recipientEmail?: unknown;
  recipientLabel?: unknown;
  subject?: unknown;
  body?: unknown;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const recipientEmail = request.nextUrl.searchParams
    .get("recipientEmail")
    ?.trim()
    .toLowerCase();
  const letters = await listOpenLetters();
  if (recipientEmail) {
    return NextResponse.json({
      letters: letters.filter(
        (letter) => letter.recipientEmail === recipientEmail,
      ),
    });
  }

  return NextResponse.json({ letters });
}

export async function POST(request: NextRequest) {
  const account = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!account) {
    return jsonError("A Gmail session is required to send open letters.", 401);
  }

  let payload: CreateOpenLetterBody;
  try {
    payload = (await request.json()) as CreateOpenLetterBody;
  } catch {
    return jsonError("Invalid JSON payload.", 400);
  }

  const recipientEmail = normalizeString(payload.recipientEmail).toLowerCase();
  const recipientLabel = normalizeString(payload.recipientLabel) || "someone";
  const subject = normalizeString(payload.subject);
  const body = normalizeString(payload.body);

  if (!isValidEmail(recipientEmail)) {
    return jsonError("Enter a valid recipient email address.", 400);
  }

  if (subject.length < 4 || subject.length > 80) {
    return jsonError("Subject must be between 4 and 80 characters.", 400);
  }

  if (body.length < 20 || body.length > 2000) {
    return jsonError("Letter must be between 20 and 2000 characters.", 400);
  }

  if (recipientLabel.length > 80) {
    return jsonError("Recipient label must be 80 characters or fewer.", 400);
  }

  const letter = await createOpenLetter({
    recipientEmail,
    recipientLabel,
    subject,
    body,
    senderAlias: account.alias,
  });

  return NextResponse.json({ letter }, { status: 201 });
}
