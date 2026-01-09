import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import bookmarksData from '../data/bookmarks.json';

// ============================================================================
// Sub-component Interfaces
// ============================================================================

interface SubmitHeroProps {
    title: string;
    description: string;
}

interface FormInputProps {
    label: string;
    required?: boolean;
    hint?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

interface TagSelectorProps {
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
    existingTags: string[];
    newTagInput: string;
    setNewTagInput: (value: string) => void;
    showTagDropdown: boolean;
    setShowTagDropdown: (show: boolean) => void;
}

interface SubmitActionsProps {
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

// ============================================================================
// Sub-components
// ============================================================================

function SubmitHero({ title, description }: SubmitHeroProps) {
    return (
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{description}</p>
        </div>
    );
}


function SubmissionGuide() {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span>📝</span>
                        如何提交新工具？
                    </h2>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">1.</span>
                            <p>
                                <strong className="text-gray-900 dark:text-white">填写下方表单</strong>
                                ：输入工具名称、GitHub 地址、描述和标签
                            </p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">2.</span>
                            <p>
                                <strong className="text-gray-900 dark:text-white">点击"提交工具"</strong>
                                ：系统会自动跳转到 GitHub Issues 页面，内容已预填好
                            </p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">3.</span>
                            <p>
                                <strong className="text-gray-900 dark:text-white">在 GitHub 确认提交</strong>
                                ：检查信息无误后，点击 "Submit new issue" 即可
                            </p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">4.</span>
                            <p>
                                <strong className="text-gray-900 dark:text-white">等待审核</strong>：我们会在
                                1-3 个工作日内审核，通过后工具会出现在主页
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <svg
                                className="w-4 h-4 text-blue-500 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>
                                <strong>提示：</strong>需要 GitHub 账号才能提交。如果还没有，请先到{' '}
                                <a
                                    href="https://github.com/signup"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    GitHub.com
                                </a>{' '}
                                注册。
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormInput({ label, required, hint, icon, children }: FormInputProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{hint}</p>}
            {icon ? (
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                    {children}
                </div>
            ) : (
                children
            )}
        </div>
    );
}


function TagSelector({
    selectedTags,
    setSelectedTags,
    existingTags,
    newTagInput,
    setNewTagInput,
    showTagDropdown,
    setShowTagDropdown,
}: TagSelectorProps) {
    const filteredTags = existingTags.filter(
        tag => tag.toLowerCase().includes(newTagInput.toLowerCase()) && !selectedTags.includes(tag)
    );

    const handleAddTag = (tag: string) => {
        if (tag && !selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
            setNewTagInput('');
            setShowTagDropdown(false);
        }
    };

    const handleRemoveTag = (tag: string) => {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                标签 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                选择已有标签或输入新标签后按回车添加
            </p>

            {/* 已选标签 */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    {selectedTags.map(tag => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-blue-900"
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* 标签输入框 */}
            <div className="relative tag-input-container">
                <input
                    type="text"
                    placeholder="输入标签名称..."
                    value={newTagInput}
                    onChange={e => {
                        setNewTagInput(e.target.value);
                        setShowTagDropdown(true);
                    }}
                    onFocus={() => setShowTagDropdown(true)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(newTagInput.trim());
                        } else if (e.key === 'Escape') {
                            setShowTagDropdown(false);
                        }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* 标签下拉列表 */}
                {showTagDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredTags.length === 0 && !newTagInput.trim() ? (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                输入标签名称或从下方选择
                            </div>
                        ) : (
                            <>
                                {/* 如果有输入且不存在，显示"添加新标签"选项 */}
                                {newTagInput.trim() && !existingTags.includes(newTagInput.trim()) && (
                                    <button
                                        type="button"
                                        onClick={() => handleAddTag(newTagInput.trim())}
                                        className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium border-b border-gray-200 dark:border-gray-700"
                                    >
                                        + 添加新标签 "{newTagInput.trim()}"
                                    </button>
                                )}

                                {/* 已有标签列表 */}
                                {filteredTags.length > 0 && (
                                    <div className="py-1">
                                        <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            选择已有标签
                                        </div>
                                        {filteredTags.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleAddTag(tag)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* 如果没有匹配结果 */}
                                {filteredTags.length === 0 &&
                                    newTagInput.trim() &&
                                    existingTags.includes(newTagInput.trim()) && (
                                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                            此标签已选择
                                        </div>
                                    )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* 提示文本 */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 提示：输入后按回车添加标签，或从下拉列表选择已有标签
            </p>
        </div>
    );
}


function ModerationNotice() {
    return (
        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-900">
            <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
                        ⏰ 审核流程说明
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        提交后会自动创建 GitHub Issue，我们会在 1-3
                        个工作日内审核。审核通过后，工具会自动添加到主页。我们可能会编辑描述以提高清晰度。
                    </p>
                </div>
            </div>
        </div>
    );
}

function SubmitActions({ isSubmitting, onSubmit }: SubmitActionsProps) {
    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                <svg
                    className="w-4 h-4 inline mr-1 text-gray-400 dark:text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                    />
                </svg>
                点击提交后将跳转到 GitHub 创建 Issue
            </p>
            <div className="flex items-center gap-3">
                <Link
                    to="/"
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    取消
                </Link>
                <button
                    onClick={onSubmit}
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
                        <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            提交到 GitHub
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function SubmitTips() {
    return (
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start gap-3">
                <svg
                    className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">✨ 提交建议</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 dark:text-gray-500">•</span>
                            <span>确保工具是开源的，并且在 GitHub 上有活跃维护</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 dark:text-gray-500">•</span>
                            <span>描述应简洁明了，突出工具的核心价值和使用场景</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 dark:text-gray-500">•</span>
                            <span>标签应准确反映工具的技术栈和应用领域</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}


// ============================================================================
// Main Component
// ============================================================================

export default function Submit() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 表单状态
    const [formData, setFormData] = useState({
        toolName: '',
        githubUrl: '',
        npmUrl: '',
        description: '',
    });

    // 选中的标签（数组）
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    // 新标签输入
    const [newTagInput, setNewTagInput] = useState('');
    // 是否显示标签下拉框
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    // 获取所有已存在的标签（排除 All 和 __meta__）
    const existingTags = useMemo(() => {
        return Object.keys(bookmarksData.tags)
            .filter(tag => tag !== 'All' && tag !== '__meta__')
            .sort();
    }, []);

    // 点击外部关闭标签下拉框
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (showTagDropdown && !target.closest('.tag-input-container')) {
                setShowTagDropdown(false);
            }
        };

        if (showTagDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTagDropdown]);

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
        if (selectedTags.length === 0) {
            alert('请选择或输入至少一个标签');
            return false;
        }
        return true;
    };

    // 构建 Issue 内容
    const buildIssueBody = () => {
        return `### 工具信息

**工具名称:** ${formData.toolName}
**GitHub 仓库地址:** ${formData.githubUrl}
${formData.npmUrl ? `**npm 地址:** ${formData.npmUrl}` : ''}

### 描述

${formData.description}

### 标签

${selectedTags.join(', ')}

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
                    npmUrl: '',
                    description: '',
                });
                setSelectedTags([]);
                setNewTagInput('');
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

    // Icon components for form inputs
    const githubIcon = (
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
    );

    const npmIcon = (
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <SubmitHero
                    title="提交新工具"
                    description="帮助社区发现优秀的前端库。分享你喜欢的工具或自己的作品。"
                />

                <SubmissionGuide />

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Tool Information Section */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-300 text-sm font-semibold">ℹ️</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">工具信息</h2>
                        </div>

                        <div className="space-y-4">
                            <FormInput label="工具名称" required>
                                <input
                                    type="text"
                                    placeholder="例如：React Query"
                                    value={formData.toolName}
                                    onChange={e => setFormData({ ...formData, toolName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </FormInput>

                            <FormInput label="GitHub 仓库地址" required icon={githubIcon}>
                                <input
                                    type="text"
                                    placeholder="github.com/username/repo"
                                    value={formData.githubUrl}
                                    onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </FormInput>

                            <FormInput
                                label="npm 地址"
                                hint="如果 npm 包名与仓库名一致可以不填"
                                icon={npmIcon}
                            >
                                <input
                                    type="text"
                                    placeholder="https://www.npmjs.com/package/package-name"
                                    value={formData.npmUrl}
                                    onChange={e => setFormData({ ...formData, npmUrl: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </FormInput>

                            <FormInput label="工具描述" required hint="简要说明。这个工具解决什么问题？">
                                <textarea
                                    rows={4}
                                    placeholder="简要描述这个工具..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </FormInput>

                            <TagSelector
                                selectedTags={selectedTags}
                                setSelectedTags={setSelectedTags}
                                existingTags={existingTags}
                                newTagInput={newTagInput}
                                setNewTagInput={setNewTagInput}
                                showTagDropdown={showTagDropdown}
                                setShowTagDropdown={setShowTagDropdown}
                            />
                        </div>
                    </div>

                    <ModerationNotice />
                    <SubmitActions isSubmitting={isSubmitting} onSubmit={handleSubmit} />
                </div>

                <SubmitTips />
            </main>

            <Footer />
        </div>
    );
}
