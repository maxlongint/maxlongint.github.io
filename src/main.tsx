import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './pages/Home';
import BookmarkDetail from './pages/BookmarkDetail';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:id" element={<BookmarkDetail />} />
            </Routes>
        </HashRouter>
    </StrictMode>
);
