import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import LoadingFallback from './components/LoadingFallback';
import ClarityProvider from './components/ClarityProvider';
import { loadGitHubData } from './utils/github';

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const BookmarkDetail = lazy(() => import('./pages/BookmarkDetail'));
const Trending = lazy(() => import('./pages/Trending'));
const Submit = lazy(() => import('./pages/Submit'));
const Contact = lazy(() => import('./pages/Contact'));
const Compare = lazy(() => import('./pages/Compare'));
const Favorites = lazy(() => import('./pages/Favorites'));

// 异步加载 GitHub 数据，不阻塞初始渲染
setTimeout(() => {
    loadGitHubData();
}, 100); // 等待初始渲染完成后加载

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <HashRouter>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/trending" element={<Trending />} />
                        <Route path="/compare" element={<Compare />} />
                        <Route path="/submit" element={<Submit />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/:id" element={<BookmarkDetail />} />
                    </Routes>
                </Suspense>
            </HashRouter>
            {/* Clarity 全局初始化，只初始化一次 */}
            <ClarityProvider projectId="t7y8qtm5hl" enabled={true} />
        </ThemeProvider>
    </StrictMode>
);
