export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">前端工具库</span>
                        <span className="text-gray-400">© 2024</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            关于
                        </a>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            隐私政策
                        </a>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            联系我们
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
