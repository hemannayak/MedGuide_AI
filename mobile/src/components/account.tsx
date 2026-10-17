import { useState } from "react";
import { router } from "expo-router";
import { Screen, Button, Field, Note } from "./ui";
import { loginUser, registerUser, googleSignIn } from "../services/api";
import { useSession } from "../contexts/session";
export function Account({ signup = false }: { signup?: boolean }) {
  const session = useSession();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit() {
    setBusy(true);
    setError("");
    try {
      if (signup) await registerUser(name, email, password, confirm);
      else await loginUser(email, password);
      session.signIn();
      router.replace("/setup");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen
      title={signup ? "Create your account" : "Welcome back"}
      subtitle="Use sample details to explore the mobile app."
    >
      {signup && (
        <Field label="Your name" value={name} onChangeText={setName} />
      )}
      <Field label="Email" value={email} onChangeText={setEmail} />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secure={!visible}
      />
      {signup && (
        <Field
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          secure={!visible}
        />
      )}
      <Button
        secondary
        label={visible ? "Hide password" : "Show password"}
        onPress={() => setVisible(!visible)}
      />
      {!!error && <Note>{error}</Note>}
      <Button
        disabled={busy}
        label={
          busy ? "Please wait…" : signup ? "Create sample account" : "Sign in"
        }
        onPress={submit}
      />
      <Button
        secondary
        label="Continue with Google"
        onPress={() => googleSignIn().catch((e) => setError(e.message))}
      />
      <Button
        secondary
        label={
          signup
            ? "Already have an account? Sign in"
            : "New here? Create an account"
        }
        onPress={() => router.replace(signup ? "/login" : "/signup")}
      />
      <Button
        secondary
        label="Back to welcome"
        onPress={() => router.replace("/")}
      />
      <Note>
        Authentication is simulated. No real account is created or verified.
      </Note>
    </Screen>
  );
}
