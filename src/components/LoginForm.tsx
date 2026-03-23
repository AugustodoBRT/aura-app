import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./LoginForm.css";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginFormProps {
  onGoToRegister: () => void;
}

export default function LoginForm({ onGoToRegister }: LoginFormProps) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        await signIn(formData.email, formData.password);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao fazer login";
        setErrors({ general: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <p className="login-subtitle">Entre com suas credenciais</p>

        {errors.general && (
          <div
            style={{
              color: "#dc3545",
              marginBottom: "15px",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=""
              className={errors.email ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=""
              className={errors.password ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>

          {/* Register Link */}
          <p className="register-link">
            Não tem conta?{" "}
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                onGoToRegister();
              }}
              style={{ cursor: "pointer" }}
            >
              Cadastre-se aqui
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
