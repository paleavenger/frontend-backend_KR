import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import "../styles/main.css";

const ROLE_LABELS = { user: "Пользователь", seller: "Продавец", admin: "Администратор" };

export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null); // { id, first_name, last_name, role }

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.getUsers();
            setUsers(res.data);
        } catch {
            navigate("/");
        }
    };

    const handleBlock = async (id) => {
        if (!window.confirm("Заблокировать пользователя?")) return;
        await api.blockUser(id);
        loadUsers();
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await api.updateUser(editingUser.id, {
            first_name: editingUser.first_name,
            last_name: editingUser.last_name,
            role: editingUser.role,
        });
        setEditingUser(null);
        loadUsers();
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    return (
        <>
            <header className="header">
                <div className="header-inner">Игровой Магазин IGRAI.RU</div>
                <div className="header-right">
                    <Link to="/" className="nav-link">Товары</Link>
                    <button className="logout-button" onClick={handleLogout}>Выйти</button>
                </div>
            </header>

            <div className="page-container">
                <h2 className="section-title">Управление пользователями</h2>

                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Имя</th>
                            <th>Фамилия</th>
                            <th>Роль</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className={u.blocked ? "row-blocked" : ""}>
                                <td>{u.email}</td>
                                <td>{u.first_name}</td>
                                <td>{u.last_name}</td>
                                <td>
                                    <span className={`role-badge role-badge--${u.role}`}>
                                        {ROLE_LABELS[u.role] || u.role}
                                    </span>
                                </td>
                                <td>{u.blocked ? "Заблокирован" : "Активен"}</td>
                                <td className="user-actions">
                                    {!u.blocked && (
                                        <>
                                            <button
                                                className="btn-edit"
                                                onClick={() => setEditingUser({ ...u })}
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                className="btn-block"
                                                onClick={() => handleBlock(u.id)}
                                            >
                                                Заблокировать
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
                    <div className="modal-window" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Редактировать пользователя</h2>
                            <button className="modal-close" onClick={() => setEditingUser(null)}>✕</button>
                        </div>
                        <form className="modal-form" onSubmit={handleEditSubmit}>
                            <input
                                placeholder="Имя"
                                value={editingUser.first_name}
                                onChange={e => setEditingUser({ ...editingUser, first_name: e.target.value })}
                            />
                            <input
                                placeholder="Фамилия"
                                value={editingUser.last_name}
                                onChange={e => setEditingUser({ ...editingUser, last_name: e.target.value })}
                            />
                            <select
                                value={editingUser.role}
                                onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                className="auth-select"
                            >
                                <option value="user">Пользователь</option>
                                <option value="seller">Продавец</option>
                                <option value="admin">Администратор</option>
                            </select>
                            <div className="modal-buttons">
                                <button type="submit" className="primary-btn">Сохранить</button>
                                <button type="button" onClick={() => setEditingUser(null)}>Отмена</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
