import { useState } from "react";
import LoginForm from "../LoginForm";
import RegisterForm from "../RegisterForm";

type Mode = "login" | "register";

export default function AuthScreen({
  initialMode = "login",
}: {
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  if (mode === "login") {
    return <LoginForm onSwitch={() => setMode("register")} />;
  }
  return <RegisterForm onSwitch={() => setMode("login")} />;
}
