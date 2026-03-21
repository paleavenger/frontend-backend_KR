import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../styles/main.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await api.login({ email, password });
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Ошибка входа");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <h1 className="auth-title">IGRAI.RU</h1>
                <h2 className="auth-subtitle">Вход в систему</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="primary-btn auth-btn">
                        Войти
                    </button>
                </form>

                <p className="auth-link">
                    Нет аккаунта?{" "}
                    <Link to="/register">Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
}
