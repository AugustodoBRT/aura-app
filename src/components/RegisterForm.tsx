import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./RegisterForm.css";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface RegisterFormProps {
  onGoToLogin: () => void;
}

export default function RegisterForm({ onGoToLogin }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nome completo é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não correspondem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        await signUp(formData.email, formData.password, formData.fullName);
        // Se o cadastro foi bem sucedido, mostrar mensagem de sucesso
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setErrors({
          general:
            "Cadastro realizado com sucesso! Verifique seu email para confirmar.",
        });
        setTimeout(() => {
          setErrors({});
        }, 3000);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao cadastrar";
        setErrors({ general: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Criar Conta</h1>
        <p className="register-subtitle">
          Preencha os dados abaixo para se cadastrar
        </p>

        {errors.general && (
          <div
            style={{
              color: errors.general.includes("sucesso") ? "#155724" : "#dc3545",
              backgroundColor: errors.general.includes("sucesso")
                ? "#d4edda"
                : "#f8d7da",
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "14px",
              border: `1px solid ${
                errors.general.includes("sucesso") ? "#c3e6cb" : "#f5c6cb"
              }`,
            }}
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">Nome Completo</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder=""
              className={errors.fullName ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.fullName && (
              <span className="error-text">{errors.fullName}</span>
            )}
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder=""
              className={errors.confirmPassword ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </button>

          {/* Login Link */}
          <p className="login-link">
            Já tem conta?{" "}
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                onGoToLogin();
              }}
              style={{ cursor: "pointer" }}
            >
              Faça login aqui
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
