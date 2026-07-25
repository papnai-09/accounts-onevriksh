import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db/connect";
import User from "@/models/User";
import type { Metadata } from "next";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = { title: "Personal Profile" };

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("onevriksh_access")?.value;
  if (!accessToken) redirect("/login");

  const decoded = await verifyAccessToken(accessToken);
  if (!decoded) redirect("/login");

  let user: Record<string, unknown> | null = null;

  try {
    await connectToDatabase();
    const dbUser = (await User.findById(decoded.userId).lean()) as any;
    if (!dbUser || dbUser.isDeleted) redirect("/login");

    user = {
      id: dbUser._id.toString(),
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      username: dbUser.username || "",
      email: dbUser.email,
      phone: dbUser.phone || "",
      avatarUrl: dbUser.avatarUrl || "",
      coverUrl: dbUser.coverUrl || "",
      bio: dbUser.bio || "",
      country: dbUser.country || "",
      state: dbUser.state || "",
      city: dbUser.city || "",
      address: dbUser.address || "",
      dateOfBirth: dbUser.dateOfBirth ? new Date(dbUser.dateOfBirth).toISOString().split("T")[0] : "",
      gender: dbUser.gender || "PREFER_NOT_TO_SAY",
      language: dbUser.language || "en",
      timezone: dbUser.timezone || "UTC",
      website: dbUser.website || "",
      occupation: dbUser.occupation || "",
      company: dbUser.company || "",
      socialLinks: dbUser.socialLinks || {},
    };
  } catch {
    user = {
      id: decoded.userId,
      firstName: "Demo",
      lastName: "User",
      username: "",
      email: decoded.email,
      phone: "",
      avatarUrl: "",
      coverUrl: "",
      bio: "",
      country: "",
      state: "",
      city: "",
      address: "",
      dateOfBirth: "",
      gender: "PREFER_NOT_TO_SAY",
      language: "en",
      timezone: "UTC",
      website: "",
      occupation: "",
      company: "",
      socialLinks: {},
    };
  }

  return <ProfileClient user={user} />;
}
