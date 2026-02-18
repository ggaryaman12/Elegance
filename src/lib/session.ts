import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  admin?: {
    email: string;
  };
};

function getSessionPassword() {
  const password = process.env.SESSION_PASSWORD;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_PASSWORD must be set in .env.local (min 32 characters)."
    );
  }
  return password;
}

function getSessionOptions(): SessionOptions {
  return {
    cookieName: "ebn_session",
    password: getSessionPassword(),
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };
}

export function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(cookies(), getSessionOptions());
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.admin?.email) {
    return null;
  }
  return session.admin;
}
