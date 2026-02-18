"use server";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

type LoginState = { error?: string };

export async function adminLogin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || !adminPassword) {
    return { error: "Admin credentials are not configured." };
  }

  if (email !== adminEmail || password !== adminPassword) {
    return { error: "Invalid email or password." };
  }

  const session = await getSession();
  session.admin = { email };
  await session.save();

  redirect("/admin");
}

export async function adminLogout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}

