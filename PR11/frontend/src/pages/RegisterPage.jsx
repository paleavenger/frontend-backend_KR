import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../styles/main.css";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await api.register({
                email,
                first_name: firstName,
                last_name: lastName,
                password,
                role,
            });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.error || "Ошибка регистрации");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <h1 className="auth-title">IGRAI.RU</h1>
                <h2 className="auth-subtitle">Регистрация</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        placeholder="Имя"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <input
                        placeholder="Фамилия"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="auth-select"
                    >
                        <option value="user">Пользователь</option>
                        <option value="seller">Продавец</option>
                        <option value="admin">Администратор</option>
                    </select>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="primary-btn auth-btn">
                        Зарегистрироваться
                    </button>
                </form>

                <p className="auth-link">
                    Уже есть аккаунт?{" "}
                    <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
}
