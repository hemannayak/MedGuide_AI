import type { Metadata } from "next";
import { AuthExperience } from "@/components/auth/auth-experience";
export const metadata: Metadata = { title: "Sign In | MedGuide AI", description: "Sign in to continue to your MedGuide workspace.", robots: { index: false, follow: false } };
export default function LoginPage() { return <AuthExperience kind="login"/>; }
