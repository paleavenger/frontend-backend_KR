import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, getRole } from "../api";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal.jsx";
import "../styles/main.css";

export default function ShopPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const role = getRole();

    const canManage  = role === "seller" || role === "admin"; // создание и редактирование
    const canDelete  = role === "admin";                       // удаление

    useEffect(() => {
        loadProducts();
        loadUser();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await api.getProducts();
            setProducts(res.data);
        } catch {
            handleLogout();
        }
    };

    const loadUser = async () => {
        try {
            const res = await api.me();
            setUser(res.data);
        } catch {
            // не критично
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingProduct, setEditingProduct] = useState(null);

    const openCreate = () => {
        setModalMode("create");
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setModalMode("edit");
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить товар?")) return;
        await api.deleteProduct(id);
        loadProducts();
    };

    const handleSubmit = async (data) => {
        if (modalMode === "create") {
            await api.createProduct(data);
        } else {
            await api.updateProduct(editingProduct.id, data);
        }
        setModalOpen(false);
        loadProducts();
    };

    return (
        <>
            <header className="header">
                <div className="header-inner">
                    Игровой Магазин IGRAI.RU
                </div>
                <div className="header-right">
                    {user && (
                        <span className="header-user">
                            {user.first_name} {user.last_name}
                            <span className="role-badge role-badge--{role}">{role}</span>
                        </span>
                    )}
                    {role === "admin" && (
                        <Link to="/users" className="nav-link">
                            Пользователи
                        </Link>
                    )}
                    {canManage && (
                        <button className="add-button" onClick={openCreate}>
                            + Добавить товар
                        </button>
                    )}
                    <button className="logout-button" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </header>

            <div className="page-container">
                <div className="cards">
                    {products.map(p => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            onEdit={canManage ? openEdit : null}
                            onDelete={canDelete ? handleDelete : null}
                        />
                    ))}
                </div>
            </div>

            <ProductModal
                open={modalOpen}
                mode={modalMode}
                initialData={editingProduct}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </>
    );
}
