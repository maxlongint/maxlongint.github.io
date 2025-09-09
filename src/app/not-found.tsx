import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-xl text-gray-600 mb-8">页面未找到</h2>
                <p className="text-gray-500 mb-8">抱歉，您访问的页面不存在。</p>
                <Link
                    href="/"
                    className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    返回首页
                </Link>
            </div>
        </div>
    );
}
