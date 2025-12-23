import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './pages/Home';
import BookmarkDetail from './pages/BookmarkDetail';
import { loadGitHubData } from './utils/github';

// 在应用启动时加载所有 GitHub 预构建数据（stats + readmes）
loadGitHubData();

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
