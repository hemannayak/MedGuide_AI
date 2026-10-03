import Link from "next/link";
import { AuthFrame } from "@/components/auth/auth-experience";
export default function VerificationPage() { return <AuthFrame kind="recovery"><h2>Account verification</h2><p>Email verification and code delivery are not connected yet. No verification code has been sent from this version.</p><p><Link href="/login">Return to sign in</Link> · <Link href="/contact">Get help</Link></p></AuthFrame>; }
