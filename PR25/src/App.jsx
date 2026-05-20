import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';

const AboutPage = lazy(() => import('./pages/AboutPage'));

export default function App() {
    return (
        <div>
            <nav style={{ padding: '16px', borderBottom: '1px solid #ccc', display: 'flex', gap: '16px' }}>
                <Link to="/">Главная</Link>
                <Link to="/about">О нас</Link>
            </nav>

            <Suspense fallback={<div style={{ padding: '16px' }}>Загрузка...</div>}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                </Routes>
            </Suspense>
        </div>
    );
}
