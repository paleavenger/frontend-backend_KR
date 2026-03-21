import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ShopPage from "./pages/ShopPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UsersPage from "./pages/UsersPage";
import { getRole } from "./api";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("accessToken");
    return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
    const token = localStorage.getItem("accessToken");
    if (!token) return <Navigate to="/login" replace />;
    if (getRole() !== "admin") return <Navigate to="/" replace />;
    return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <ShopPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <AdminRoute>
                            <UsersPage />
                        </AdminRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
