const fs = require('fs');
const https = require('https');

/**
 * 解析 Issue 正文内容
 * @param {string} body - Issue 正文
 * @returns {Object} 解析后的工具信息
 */
function parseIssueBody(body) {
    const result = { toolName: '', githubUrl: '', npmUrl: '', description: '', tags: [] };

    // 匹配 **工具名称:** Mock.js
    const nameMatch = body.match(/\*\*工具名称:\*\*\s*([^\n]+)/i);
    if (nameMatch) result.toolName = nameMatch[1].trim();

    // 匹配 **GitHub 仓库地址:** https://...
    const urlMatch = body.match(/\*\*GitHub\s*仓库地址:\*\*\s*([^\n]+)/i);
    if (urlMatch) {
        result.githubUrl = urlMatch[1].trim();
        if (!result.githubUrl.startsWith('http')) result.githubUrl = 'https://' + result.githubUrl;
    }

    // 匹配 **npm 地址:** https://www.npmjs.com/package/...
    const npmMatch = body.match(/\*\*npm\s*地址:\*\*\s*([^\n]+)/i);
    if (npmMatch) {
        result.npmUrl = npmMatch[1].trim();
        // 确保是有效的 npm URL
        if (result.npmUrl && !result.npmUrl.startsWith('http')) {
            result.npmUrl = 'https://' + result.npmUrl;
        }
    }

    // 匹配 ### 描述 后面的内容
    const descMatch = body.match(/###\s*描述\s*\n+([\s\S]+?)(?=\n###|---)/i);
    if (descMatch) result.description = descMatch[1].trim();

    // 匹配 ### 标签 后面的内容
    const tagsMatch = body.match(/###\s*标签\s*\n+([^\n]+)/i);
    if (tagsMatch) {
        result.tags = tagsMatch[1]
            .trim()
            .split(/[,，]/)
            .map(t => t.trim())
            .filter(t => t);
    }
    return result;
}

/**
 * 自定义 JSON 格式化，保持与原文件一致的格式
 * - 4个空格缩进
 * - tags 数组在一行
 * - 其他属性分行显示
 * @param {Object} data - 要格式化的数据
 * @returns {string} 格式化后的 JSON 字符串
 */
function formatBookmarksJson(data) {
    // 使用标准的 JSON.stringify，但需要特殊处理 tags 数组
    // 先正常序列化，然后处理 tags 数组格式
    let json = JSON.stringify(data, null, 4);

    // 将 tags 数组从多行格式转换为单行格式
    // 匹配模式: "tags": [\n            "tag1",\n            "tag2"\n        ]
    // 替换为: "tags": ["tag1", "tag2"]
    json = json.replace(/"tags":\s*\[\s*([^\]]+?)\s*\]/g, (match, content) => {
        // 提取所有标签值
        const tags = content.match(/"[^"]+"/g) || [];
        return `"tags": [${tags.join(', ')}]`;
    });

    return json;
}

/**
 * 生成标签颜色
 * @param {number} index - 标签索引
 * @returns {Object} 颜色配置
 */
function generateTagColor(index) {
    const goldenAngle = 137.5;
    const hue = (index * goldenAngle) % 360;
    const saturation = 45 + (index % 3) * 10;
    const lightnessBase = 88;
    const lightnessStep = 2;
    const maxSteps = 6;
    const lightness = lightnessBase - (index % maxSteps) * lightnessStep;
    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const textLightness = Math.max(20, lightness - 50);
    const textColor = `hsl(${hue}, ${Math.min(saturation + 20, 80)}%, ${textLightness}%)`;

    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0,
            g = 0,
            b = 0;
        if (0 <= h && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (60 <= h && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (120 <= h && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (180 <= h && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (240 <= h && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else if (300 <= h && h < 360) {
            r = c;
            g = 0;
            b = x;
        }
        const toHex = num => {
            const hex = Math.round((num + m) * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    const hexColor = hslToHex(hue, saturation, lightness);
    return {
        className: '',
        color: hexColor,
        backgroundColor: backgroundColor,
        textColor: textColor,
    };
}

/**
 * 获取 GitHub 仓库数据
 * @param {string} fullName - 仓库全名 (owner/repo)
 * @param {string} token - GitHub Token
 * @returns {Promise<Object>} 仓库数据
 */
function fetchGitHubData(fullName, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${fullName}`,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Actions-Bot',
            },
        };

        https
            .get(options, res => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            })
            .on('error', reject);
    });
}

/**
 * 获取 npm 包版本
 * @param {string} packageName - npm 包名
 * @returns {Promise<string>} 版本号
 */
function fetchNpmData(packageName) {
    return new Promise(resolve => {
        const options = {
            hostname: 'registry.npmjs.org',
            path: `/${encodeURIComponent(packageName)}`,
            headers: { 'User-Agent': 'GitHub-Actions-Bot' },
        };

        https
            .get(options, res => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const npmData = JSON.parse(data);
                            resolve(npmData['dist-tags']?.latest || 'N/A');
                        } catch (e) {
                            resolve('N/A');
                        }
                    } else {
                        resolve('N/A');
                    }
                });
            })
            .on('error', () => resolve('N/A'));
    });
}

/**
 * 获取 GitHub README 内容
 * @param {string} fullName - 仓库全名 (owner/repo)
 * @param {string} token - GitHub Token
 * @returns {Promise<string|null>} README 内容
 */
function fetchReadme(fullName, token) {
    return new Promise(resolve => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${fullName}/readme`,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3.raw',
                'User-Agent': 'GitHub-Actions-Bot',
            },
        };

        https
            .get(options, res => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        resolve(null);
                    }
                });
            })
            .on('error', () => resolve(null));
    });
}

/**
 * 主处理函数
 */
async function main() {
    const issueBody = process.env.ISSUE_BODY;
    const githubToken = process.env.GITHUB_TOKEN;

    console.log('=== Issue Body ===');
    console.log(issueBody);
    console.log('==================');

    const parsed = parseIssueBody(issueBody);

    console.log('=== Parsed Result ===');
    console.log('Tool Name:', parsed.toolName);
    console.log('GitHub URL:', parsed.githubUrl);
    console.log('npm URL:', parsed.npmUrl || '(未提供)');
    console.log('Description:', parsed.description);
    console.log('Tags:', parsed.tags);
    console.log('=====================');

    if (!parsed.toolName || !parsed.githubUrl || !parsed.description || parsed.tags.length === 0) {
        console.error('Missing required fields');
        process.exit(1);
    }

    const bookmarksData = JSON.parse(fs.readFileSync('./src/data/bookmarks.json', 'utf8'));
    const exists = bookmarksData.bookmarks.some(b => b.url === parsed.githubUrl);
    if (exists) {
        fs.writeFileSync(process.env.GITHUB_OUTPUT, 'already_exists=true', { flag: 'a' });
        process.exit(0);
    }

    // 自动为新标签生成样式
    let tagsUpdated = false;
    let nextColorIndex = 0;
    if (bookmarksData.tags.__meta__ && typeof bookmarksData.tags.__meta__.lastColorIndex === 'number') {
        nextColorIndex = bookmarksData.tags.__meta__.lastColorIndex + 1;
    } else {
        const existingTags = Object.keys(bookmarksData.tags).filter(k => k !== 'All' && k !== '__meta__');
        nextColorIndex = existingTags.length;
    }

    parsed.tags.forEach(tag => {
        if (!bookmarksData.tags[tag]) {
            const newColorConfig = generateTagColor(nextColorIndex);
            bookmarksData.tags[tag] = newColorConfig;
            console.log(`添加新标签: ${tag}`);
            nextColorIndex++;
            tagsUpdated = true;
        }
    });

    if (tagsUpdated) {
        bookmarksData.tags.__meta__ = {
            lastColorIndex: nextColorIndex - 1,
            totalTags: Object.keys(bookmarksData.tags).filter(k => k !== 'All' && k !== '__meta__').length,
            lastUpdated: new Date().toISOString(),
        };
    }

    const newBookmark = {
        title: parsed.toolName,
        url: parsed.githubUrl,
        description: parsed.description,
        tags: parsed.tags,
    };

    // 如果有 npm URL，添加到 bookmark
    if (parsed.npmUrl) {
        newBookmark.npmUrl = parsed.npmUrl;
    }

    // 添加到数组最后
    bookmarksData.bookmarks.push(newBookmark);

    // 使用自定义格式化保存文件，保持紧凑风格
    const formattedJson = formatBookmarksJson(bookmarksData);
    fs.writeFileSync('./src/data/bookmarks.json', formattedJson + '\n', 'utf8');

    // 实时获取GitHub仓库信息并添加到预设数据
    const match = parsed.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '');
        const fullName = `${owner}/${repo}`;

        console.log(`正在获取 ${fullName} 的实时数据...`);

        try {
            const repoData = await fetchGitHubData(fullName, githubToken);
            const npmVersion = await fetchNpmData(repoData.name);

            const presetData = {
                stargazers_count: repoData.stargazers_count || 0,
                npm_version: npmVersion,
                name: repoData.name,
                full_name: repoData.full_name,
                pushed_at: repoData.pushed_at || new Date().toISOString(),
            };

            console.log(`  ✓ Stars: ${presetData.stargazers_count}`);
            console.log(`  ✓ npm版本: ${presetData.npm_version}`);
            console.log(`  ✓ 最后更新: ${presetData.pushed_at}`);

            // 读取同步数据文件
            const statsDataPath = './src/data/github-stats.json';
            let statsDataFile = { updated_at: '', repos: {} };
            if (fs.existsSync(statsDataPath)) {
                statsDataFile = JSON.parse(fs.readFileSync(statsDataPath, 'utf8'));
            }

            // 添加新的仓库数据
            const urlKey = `github.com/${fullName}`;
            statsDataFile.repos[urlKey] = presetData;
            statsDataFile.updated_at = new Date().toISOString();

            fs.writeFileSync(statsDataPath, JSON.stringify(statsDataFile, null, 2) + '\n', 'utf8');
            console.log(`  ✓ 已添加数据到 src/data/github-stats.json`);

            // 同步获取 README 内容
            const readmeContent = await fetchReadme(fullName, githubToken);
            if (readmeContent) {
                const readmesDataPath = './src/data/github-readmes.json';
                let readmesDataFile = { updated_at: '', readmes: {} };
                if (fs.existsSync(readmesDataPath)) {
                    readmesDataFile = JSON.parse(fs.readFileSync(readmesDataPath, 'utf8'));
                }

                const readmeKey = `${owner}/${repo}`;
                readmesDataFile.readmes[readmeKey] = readmeContent;
                readmesDataFile.updated_at = new Date().toISOString();

                fs.writeFileSync(readmesDataPath, JSON.stringify(readmesDataFile, null, 2) + '\n', 'utf8');
                console.log(`  ✓ 已添加 README 到 src/data/github-readmes.json`);

                // 标记需要提交 README 文件
                fs.appendFileSync(process.env.GITHUB_OUTPUT, 'readme_data_added=true\n');
            } else {
                console.log(`  ⚠️ 未找到 README 文件`);
            }

            // 标记需要提交数据文件
            fs.appendFileSync(process.env.GITHUB_OUTPUT, 'stats_data_added=true\n');
        } catch (error) {
            console.log(`  ✗ 获取GitHub数据失败: ${error.message}`);
            console.log(`  → 数据将在下次定时更新时同步`);
        }
    }

    const output = `tool_name=${parsed.toolName}\ntool_url=${parsed.githubUrl}\nalready_exists=false\ntags_updated=${tagsUpdated}`;
    fs.writeFileSync(process.env.GITHUB_OUTPUT, output, { flag: 'a' });
}

// 执行主函数
if (require.main === module) {
    main().catch(err => {
        console.error('执行失败:', err);
        process.exit(1);
    });
}

module.exports = { parseIssueBody, formatBookmarksJson, generateTagColor, fetchGitHubData, fetchNpmData, fetchReadme };
