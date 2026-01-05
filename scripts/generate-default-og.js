import fs from 'fs';
import path from 'path';
import { ImageResponse } from '@vercel/og';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '../public/og-images');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateDefaultOG() {
    try {
        // 读取 logo.png 并转换为 base64
        const logoPath = path.join(__dirname, '../public/logo.png');
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

        const imageResponse = new ImageResponse(
            {
                type: 'div',
                props: {
                    style: {
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '60px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                    },
                    children: [
                        // Logo
                        {
                            type: 'img',
                            props: {
                                src: logoBase64,
                                width: 160,
                                height: 160,
                                style: {
                                    marginBottom: '40px',
                                    borderRadius: '32px',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                                    backgroundColor: 'white',
                                    padding: '12px',
                                },
                            },
                        },
                        // 标题
                        {
                            type: 'div',
                            props: {
                                style: {
                                    fontSize: '96px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    marginBottom: '32px',
                                    textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                },
                                children: '前端工具库',
                            },
                        },
                        // 描述
                        {
                            type: 'div',
                            props: {
                                style: {
                                    fontSize: '42px',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    textAlign: 'center',
                                    lineHeight: 1.6,
                                    maxWidth: '80%',
                                    marginBottom: '32px',
                                },
                                children: '精心整理的前端开发工具与资源\n让你的开发更高效',
                            },
                        },
                        // 网站地址
                        {
                            type: 'div',
                            props: {
                                style: {
                                    fontSize: '32px',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textAlign: 'center',
                                },
                                children: 'https://snazzy.top',
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

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const outputPath = path.join(outputDir, 'default.png');
        fs.writeFileSync(outputPath, buffer);

        console.log('✓ Generated default OG image');
    } catch (error) {
        console.error('✗ Failed to generate default OG image:', error.message);
    }
}

generateDefaultOG().catch(console.error);
