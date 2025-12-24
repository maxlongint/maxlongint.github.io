import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Submit() {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 表单状态
    const [formData, setFormData] = useState({
        toolName: '',
        githubUrl: '',
        description: '',
        tags: '',
    });

    // GitHub 仓库信息
    const GITHUB_REPO = 'maxlongint/maxlongint.github.io';
    const GITHUB_TOKEN = ''; // 需要配置 GitHub Personal Access Token

    // 表单验证
    const validateForm = () => {
        if (!formData.toolName.trim()) {
            alert('请输入工具名称');
            return false;
        }
        if (!formData.githubUrl.trim()) {
            alert('请输入 GitHub 仓库地址');
            return false;
        }
        if (!formData.githubUrl.includes('github.com')) {
            alert('请输入有效的 GitHub URL');
            return false;
        }
        if (!formData.description.trim()) {
            alert('请输入工具描述');
            return false;
        }
        if (!formData.tags.trim()) {
            alert('请输入至少一个标签');
            return false;
        }
        return true;
    };

    // 构建 Issue 内容
    const buildIssueBody = () => {
        return `### 工具信息

**工具名称:** ${formData.toolName}
**GitHub 仓库地址:** ${formData.githubUrl}

### 描述

${formData.description}

### 标签

${formData.tags}

---

_此 Issue 由提交表单自动创建_`;
    };

    // 提交表单 - 直接创建 GitHub Issue
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // 如果没有配置 token，则跳转到 GitHub Issue 页面（带预填内容）
        if (!GITHUB_TOKEN) {
            const issueTitle = `[收录] ${formData.toolName}`;
            const issueBody = buildIssueBody();
            const url = `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(
                issueTitle
            )}&body=${encodeURIComponent(issueBody)}`;
            window.open(url, '_blank');
            return;
        }

        setIsSubmitting(true);

        try {
            // 调用 GitHub API 创建 Issue
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                },
                body: JSON.stringify({
                    title: `[收录] ${formData.toolName}`,
                    body: buildIssueBody(),
                    labels: ['收录申请', '待审核'],
                }),
            });

            if (response.ok) {
                const issue = await response.json();
                alert(`提交成功！Issue #${issue.number} 已创建。`);
                // 重置表单
                setFormData({
                    toolName: '',
                    githubUrl: '',
                    description: '',
                    tags: '',
                });
                // 跳转到 Issue 页面
                window.open(issue.html_url, '_blank');
            } else {
                throw new Error(`GitHub API 错误: ${response.status}`);
            }
        } catch (error) {
            console.error('提交失败:', error);
            alert('提交失败，请稍后重试。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header onOpenComments={() => setIsCommentsOpen(true)} />

            {/* Main Content */}
            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">提交新工具</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        帮助社区发现优秀的前端库。分享你喜欢的工具或自己的作品。
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Tool Information Section */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-semibold">ℹ️</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">工具信息</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Tool Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    工具名称 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="例如：React Query"
                                    value={formData.toolName}
                                    onChange={e => setFormData({ ...formData, toolName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* GitHub Repository */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    GitHub 仓库地址 <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="github.com/username/repo"
                                        value={formData.githubUrl}
                                        onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Short Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    工具描述 <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">简要说明。这个工具解决什么问题？</p>
                                <textarea
                                    rows={4}
                                    placeholder="简要描述这个工具..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    标签 <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    多个标签用逗号分隔（例如：TypeScript, React, 动画效果）
                                </p>
                                <input
                                    type="text"
                                    placeholder="TypeScript, React, 数据处理"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Moderation Process */}
                    <div className="p-6 bg-blue-50">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-blue-900 mb-1">审核流程</h3>
                                <p className="text-sm text-blue-700">
                                    每个提交都会由我们的团队人工审核以确保质量。通常需要 1-3
                                    个工作日，工具才会出现在主页上。 我们可能会编辑描述以提高清晰度。
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
                        <Link
                            to="/"
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            取消
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    提交中...
                                </>
                            ) : (
                                '提交工具'
                            )}
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    提交即表示您同意我们的{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                        提交指南
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    );
}
