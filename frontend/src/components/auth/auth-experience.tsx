"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Button } from "react-aria-components";
import { motion, useReducedMotion } from "motion/react";
import { Mail, Lock, UserRound, Phone, ArrowRight, ArrowLeft, Globe, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api/client";
import { isMockMode } from "@/lib/api/config";
import { saveSessionToken, safeReturnPath } from "@/lib/auth/session";
import { useLanguage } from "@/lib/i18n/context";
import { UserRole } from "@/types/user";
import { AuthTextField } from "./auth-text-field";
import { MarketingNavbar } from "@/components/marketing/homepage/hero-section";
import { MarketingFooter } from "@/components/marketing/homepage/marketing-footer";
import { Brand } from "@/components/marketing/homepage/shared";
import styles from "./auth-experience.module.css";
import brandStyles from "@/components/marketing/homepage/homepage.module.css";
export function AuthFrame({ kind, children }: {
    kind: "login" | "register" | "recovery";
    children: ReactNode;
}) {
    const reduced = useReducedMotion();
    return <div className={`${brandStyles.brandScope} ${styles.page}`}><div className={`${styles.stage} ${kind === "register" ? styles.signupStage : styles.signinStage}`}><MarketingNavbar /><main className={styles.layout}><div className={styles.story}><p className={styles.label}>{kind === "login" ? "WELCOME BACK" : kind === "register" ? "JOIN MEDGUIDE AI" : "ACCOUNT HELP"}</p><h1>{kind === "login" ? <>Your health questions,<br /><em>closer to home.</em></> : kind === "register" ? <>Create your<br /><em>account.</em></> : <>A clear way<br /><em>back to MedGuide.</em></>}</h1><p>{kind === "login" ? "Continue your conversations, revisit saved information, and prepare for your next conversation with a healthcare professional." : kind === "register" ? "Create your MedGuide account to explore understandable health information and choose the language that feels familiar." : "Get clear information about account access and the available recovery options."}</p><div className={styles.principles}><span><ShieldCheck size={18}/>Clear boundaries</span><span><Globe size={18}/>English · हिंदी · తెలుగు</span></div></div><motion.section className={styles.card} aria-label={kind === "register" ? "Create account" : "Account access"} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}><div className={styles.cardBrand}><Link href="/" aria-label="MedGuide AI home"><Brand /></Link></div>{children}</motion.section></main></div><MarketingFooter /></div>;
}
export function AuthExperience({ kind }: {
    kind: "login" | "register";
}) {
    const router = useRouter();
    const { setLanguage } = useLanguage();
    const signup = kind === "register";
    const [values, setValues] = useState({ name: "", email: "", phone: "", password: "", confirm: "", language: "en", role: UserRole.PATIENT });
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [confirmError, setConfirmError] = useState("");
    const update = (key: keyof typeof values) => (value: string) => { setValues(v => ({ ...v, [key]: value })); setError(""); if (key === "confirm" || key === "password")
        setConfirmError(""); };
    async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setError(""); if (signup && values.password !== values.confirm) {
        setConfirmError("Passwords do not match. Enter the same password again.");
        return;
    } setLoading(true); try {
        const result = signup ? await api.register({ full_name: values.name.trim(), email: values.email.trim(), phone_number: values.phone.trim() || undefined, password: values.password, preferred_language: values.language as "en" | "hi" | "te", role: values.role }) : await api.login({ email_or_phone: values.email.trim(), password: values.password });
        if (!result.success || !result.data?.access_token) {
            setError(result.message || "We could not complete this request. Check your details and try again.");
            return;
        }
        saveSessionToken(result.data.access_token, signup ? false : remember);
        if (signup)
            setLanguage(values.language as "en" | "hi" | "te");
        setSuccess(true);
        router.replace(signup ? "/onboarding" : safeReturnPath(new URLSearchParams(window.location.search).get("redirect")));
    }
    catch {
        setError("We couldn’t connect to MedGuide. Please try again when the service is available.");
    }
    finally {
        setLoading(false);
    } }
    return <AuthFrame kind={kind}><h2>{signup ? "Create your MedGuide account" : "Welcome back to MedGuide"}</h2><p className={styles.intro}>{signup ? "Choose your language and establish your account details." : "Sign in to continue to your MedGuide workspace."}</p>{isMockMode() && <p className={styles.status}>Preview mode: this uses the existing mock service. Credentials are not verified against a live account. Use sample details.</p>}{error && <p role="alert" className={styles.error}>{error}</p>}{success && <p role="status" className={styles.status}>{signup ? "Account setup complete. Opening onboarding…" : "Signed in. Opening MedGuide…"}</p>}<Form onSubmit={submit} validationBehavior="native" className={styles.form} aria-busy={loading}>
 {signup && <AuthTextField label="Full name" name="full-name" value={values.name} onChange={update("name")} icon={<UserRound size={17}/>} isRequired autoComplete="name"/>}
 <AuthTextField label={signup ? "Email address" : "Email or phone number"} name="email" type={signup ? "email" : "text"} value={values.email} onChange={update("email")} icon={<Mail size={17}/>} isRequired autoComplete={signup ? "email" : "username"}/>
 <AuthTextField label="Password" name="password" type="password" value={values.password} onChange={update("password")} icon={<Lock size={17}/>} isRequired minLength={signup ? 8 : undefined} description={signup ? "Use at least 8 characters." : undefined} autoComplete={signup ? "new-password" : "current-password"}/>
 {signup ? <><AuthTextField label="Confirm password" name="confirm-password" type="password" value={values.confirm} onChange={update("confirm")} icon={<Lock size={17}/>} isRequired autoComplete="new-password" errorMessage={confirmError}/><AuthTextField label="Phone number (optional)" name="phone" type="tel" value={values.phone} onChange={update("phone")} icon={<Phone size={17}/>} autoComplete="tel"/><div className={styles.row}><label className={styles.select}>Preferred language<select value={values.language} onChange={e => update("language")(e.target.value)}><option value="en">English</option><option value="hi">हिंदी</option><option value="te">తెలుగు</option></select></label><label className={styles.select}>Account type<select value={values.role} onChange={e => update("role")(e.target.value)}><option value={UserRole.PATIENT}>Patient / Citizen</option><option value={UserRole.HEALTHCARE_WORKER}>Healthcare worker</option></select></label></div><label className={styles.check}><input name="terms" type="checkbox" required/><span>I agree to the <Link href="/terms">Terms of Service</Link> and acknowledge the <Link href="/privacy">Privacy Policy</Link>.</span></label></> : <div className={styles.options}><label className={styles.check}><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/>Remember me on this device</label><Link href="/forgot-password">Forgot password?</Link></div>}
 <Button type="submit" isDisabled={loading || success} className={styles.submit}>{loading ? <><span className={styles.loading} aria-hidden="true"/>{signup ? "Creating account…" : "Signing in…"}</> : <>{signup ? "Create account" : "Sign in"}<ArrowRight size={17} aria-hidden="true"/></>}</Button></Form><p className={styles.switch}>{signup ? "Already have an account?" : "New to MedGuide?"} <Link href={signup ? "/login" : "/register"}>{signup ? "Sign in" : "Create an account"}</Link></p></AuthFrame>;
}
export function RecoveryExperience() { return <AuthFrame kind="recovery"><h2>Forgot your password?</h2><p className={styles.intro}>Password recovery is not connected yet.</p><p className={styles.status}>Reset emails and verification codes cannot be sent from this version. If you are exploring the preview, return to sign in and use sample details. Live recovery will be available when the authentication service is connected.</p><Link href="/login" className={styles.back}><ArrowLeft size={17}/>Back to sign in</Link><p className={styles.switch}>Need help? <Link href="/contact">Contact & feedback</Link></p></AuthFrame>; }
