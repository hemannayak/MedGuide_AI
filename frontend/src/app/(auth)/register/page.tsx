import type { Metadata } from "next";
import { AuthExperience } from "@/components/auth/auth-experience";
export const metadata: Metadata = { title: "Create Account | MedGuide AI", description: "Create your MedGuide account and choose your preferred language.", robots: { index: false, follow: false } };
export default function RegisterPage() { return <AuthExperience kind="register"/>; }
