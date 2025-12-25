import fs from 'fs';
import path from 'path';
import { ImageResponse } from '@vercel/og';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从命令行参数获取工具名称或 URL
const toolIdentifier = process.argv[2];

if (!toolIdentifier) {
    console.error('错误: 请提供工具名称或 GitHub URL');
    console.error('用法: node generate-og-single.js <工具名称或URL>');
    process.exit(1);
}

// 读取数据
const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const statsPath = path.join(__dirname, '../src/data/github-stats.json');
const outputDir = path.join(__dirname, '../src/data/og-images');

const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf-8'));
const statsData = fs.existsSync(statsPath) ? JSON.parse(fs.readFileSync(statsPath, 'utf-8')) : { repos: {} };

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 查找工具
let bookmark = null;

// 先尝试按 URL 精确匹配
bookmark = bookmarksData.bookmarks.find(b => b.url === toolIdentifier);

// 如果没找到，尝试按标题匹配
if (!bookmark) {
    bookmark = bookmarksData.bookmarks.find(b => b.title === toolIdentifier);
}

// 如果还没找到，尝试模糊匹配
if (!bookmark) {
    const lowerIdentifier = toolIdentifier.toLowerCase();
    bookmark = bookmarksData.bookmarks.find(
        b => b.title.toLowerCase().includes(lowerIdentifier) || b.url.toLowerCase().includes(lowerIdentifier)
    );
}

if (!bookmark) {
    console.error(`错误: 未找到工具 "${toolIdentifier}"`);
    process.exit(1);
}

// 格式化 Stars 数量
function formatStars(stars) {
    if (!stars) return '0';
    if (stars >= 1000) {
        return (stars / 1000).toFixed(1) + 'k';
    }
    return stars.toString();
}

// 根据文字长度动态计算字体大小
function getDescriptionFontSize(textLength) {
    if (textLength <= 50) return 36;
    if (textLength <= 80) return 32;
    if (textLength <= 120) return 28;
    return 24;
}

// 生成单个 OG Image
async function generateOGImage(bookmark) {
    const routeName = bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    console.log(`正在为 "${bookmark.title}" 生成 OG 图片...`);

    // 获取 GitHub 信息
    const githubMatch = bookmark.url.match(/github\.com\/([^/]+)\/([^/]+)/);
    const owner = githubMatch ? githubMatch[1] : '';
    const repo = githubMatch ? githubMatch[2] : '';
    const urlKey = `github.com/${owner}/${repo}`;

    const repoStats = statsData.repos?.[urlKey];
    const stars = repoStats?.stargazers_count || 0;
    const starsText = formatStars(stars);

    // 根据描述长度动态调整字体大小
    const description = bookmark.description;
    const descriptionFontSize = getDescriptionFontSize(description.length);

    try {
        // 构建底部信息栏子元素
        const rightTopChildren = [];

        rightTopChildren.push(
            {
                type: 'div',
                props: {
                    style: {
                        fontSize: '28px',
                        color: 'rgba(255, 255, 255, 0.8)',
                    },
                    children: '前端工具库',
                },
            },
            {
                type: 'div',
                props: {
                    style: {
                        fontSize: '20px',
                        color: 'rgba(255, 255, 255, 0.6)',
                    },
                    children: 'https://snazzy.top',
                },
            }
        );

        // 构建左侧内容
        const leftContent = [];

        if (owner) {
            leftContent.push({
                type: 'img',
                props: {
                    src: `https://github.com/${owner}.png?size=240`,
                    width: 240,
                    height: 240,
                    style: {
                        borderRadius: '24px',
                        border: '8px solid rgba(255, 255, 255, 0.3)',
                    },
                },
            });
        }

        // 构建右侧内容
        const rightContent = [
            {
                type: 'div',
                props: {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginBottom: '24px',
                    },
                    children: rightTopChildren,
                },
            },
            {
                type: 'div',
                props: {
                    style: {
                        fontSize: '72px',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '24px',
                        lineHeight: 1.1,
                        textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    },
                    children: bookmark.title,
                },
            },
            {
                type: 'div',
                props: {
                    style: {
                        fontSize: `${descriptionFontSize}px`,
                        color: 'rgba(255, 255, 255, 0.95)',
                        lineHeight: 1.6,
                        marginBottom: '24px',
                    },
                    children: description,
                },
            },
        ];

        if (stars > 0) {
            rightContent.push({
                type: 'div',
                props: {
                    style: {
                        display: 'flex',
                        justifyContent: 'flex-start',
                    },
                    children: [
                        {
                            type: 'div',
                            props: {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    padding: '16px 32px',
                                    borderRadius: '16px',
                                },
                                children: [
                                    {
                                        type: 'span',
                                        props: {
                                            style: {
                                                fontSize: '32px',
                                            },
                                            children: '⭐',
                                        },
                                    },
                                    {
                                        type: 'span',
                                        props: {
                                            style: {
                                                fontSize: '36px',
                                                fontWeight: 'bold',
                                                color: 'white',
                                            },
                                            children: `${starsText} Stars`,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            });
        }

        const imageResponse = new ImageResponse(
            {
                type: 'div',
                props: {
                    style: {
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '80px',
                        fontFamily: 'sans-serif',
                        gap: '60px',
                        borderRadius: '24px',
                    },
                    children: [
                        {
                            type: 'div',
                            props: {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                                children: leftContent,
                            },
                        },
                        {
                            type: 'div',
                            props: {
                                style: {
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                },
                                children: rightContent,
                            },
                        },
                    ],
                },
            },
            {
                width: 1200,
                height: 630,
            }
        );

        const buffer = await imageResponse.arrayBuffer();
        const outputPath = path.join(outputDir, `${routeName}.png`);
        fs.writeFileSync(outputPath, Buffer.from(buffer));

        console.log(`✅ 生成成功: ${routeName}.png`);
        console.log(`   路径: ${outputPath}`);
        console.log(`   Stars: ${stars}`);
    } catch (error) {
        console.error(`❌ 生成失败: ${bookmark.title}`);
        console.error(error);
        process.exit(1);
    }
}

// 执行生成
generateOGImage(bookmark);
