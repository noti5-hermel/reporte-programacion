import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";

export function useLogin() {
  const { login, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (field: "username" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(formData);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al iniciar sesión");
    }
  };

  return { isLoading, handleSubmit, handleChange, formData, errorMsg };
}
