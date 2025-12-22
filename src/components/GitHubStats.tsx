import { useState, useEffect } from 'react';

interface Window {
    __GITHUB_STATS__?: Record<string, GitHubRepoInfo>;
}

interface GitHubStatsProps {
    url: string;
}

interface GitHubRepoInfo {
    stargazers_count: number;
    npm_version: string;
    name: string;
    full_name: string;
    pushed_at?: string;
}

// 获取GitHub仓库信息的工具函数
export const getGitHubRepoInfo = (url: string): GitHubRepoInfo | null => {
    if (!url.includes('github.com')) return null;

    const urlKey = url
        .replace(/^https?:\/\//, '')
        .split('?')[0]
        .split('#')[0];

    // 优先从运行时加载的数据获取
    const runtimeData = (window as Window).__GITHUB_STATS__;
    if (runtimeData && runtimeData[urlKey]) {
        return runtimeData[urlKey];
    }

    // 否则返回预设数据
    return presetRepoData[urlKey] || null;
};

// 在浏览器空闲时加载最新的GitHub数据
export const useIdleGitHubDataUpdate = () => {
    useEffect(() => {
        // 尝试加载构建时生成的最新数据
        const loadLatestData = async () => {
            try {
                const response = await fetch('/github-stats.json');
                if (response.ok) {
                    const data = await response.json();
                    // 存储到全局变量供getGitHubRepoInfo使用
                    (window as Window).__GITHUB_STATS__ = data.repos;
                    console.log(`GitHub stats loaded (updated at: ${data.updated_at})`);
                } else {
                    console.log('No github-stats.json found, using preset data');
                }
            } catch {
                console.log('Failed to load github-stats.json, using preset data');
            }
        };

        // 页面加载后立即尝试加载
        loadLatestData();
    }, []);
};

// 预设的 GitHub 仓库数据
const presetRepoData: Record<string, GitHubRepoInfo> = {
    'github.com/unadlib/mutative': {
        stargazers_count: 2100,
        npm_version: '1.0.11',
        name: 'mutative',
        full_name: 'unadlib/mutative',
        pushed_at: '2024-12-18T02:30:00Z',
    },
    'github.com/immerjs/immer': {
        stargazers_count: 27500,
        npm_version: '10.1.1',
        name: 'immer',
        full_name: 'immerjs/immer',
        pushed_at: '2024-12-16T11:45:00Z',
    },
    'github.com/fabian-hiller/valibot': {
        stargazers_count: 6200,
        npm_version: '0.42.1',
        name: 'valibot',
        full_name: 'fabian-hiller/valibot',
        pushed_at: '2024-12-17T15:20:00Z',
    },
    'github.com/colinhacks/zod': {
        stargazers_count: 33800,
        npm_version: '3.23.8',
        name: 'zod',
        full_name: 'colinhacks/zod',
        pushed_at: '2024-12-15T09:30:00Z',
    },
    'github.com/typestack/class-validator': {
        stargazers_count: 10800,
        npm_version: '0.14.1',
        name: 'class-validator',
        full_name: 'typestack/class-validator',
        pushed_at: '2024-12-10T08:15:00Z',
    },
    'github.com/Mage-Icons/mage-icons': {
        stargazers_count: 850,
        npm_version: 'N/A',
        name: 'mage-icons',
        full_name: 'Mage-Icons/mage-icons',
        pushed_at: '2024-12-15T10:00:00Z',
    },
    'github.com/iconoir-icons/iconoir': {
        stargazers_count: 3900,
        npm_version: '7.9.0',
        name: 'iconoir',
        full_name: 'iconoir-icons/iconoir',
        pushed_at: '2024-12-16T14:30:00Z',
    },
    'github.com/cure53/DOMPurify': {
        stargazers_count: 13500,
        npm_version: '3.2.0',
        name: 'dompurify',
        full_name: 'cure53/DOMPurify',
        pushed_at: '2024-12-12T09:45:00Z',
    },
    'github.com/zumerlab/snapdom': {
        stargazers_count: 420,
        npm_version: '0.4.2',
        name: 'snapdom',
        full_name: 'zumerlab/snapdom',
        pushed_at: '2024-12-14T11:20:00Z',
    },
    'github.com/juliangarnier/anime': {
        stargazers_count: 49800,
        npm_version: '3.2.1',
        name: 'animejs',
        full_name: 'juliangarnier/anime',
        pushed_at: '2024-11-25T16:00:00Z',
    },
    'github.com/animate-css/animate.css': {
        stargazers_count: 80300,
        npm_version: '4.1.1',
        name: 'animate.css',
        full_name: 'animate-css/animate.css',
        pushed_at: '2024-12-01T13:10:00Z',
    },
    'github.com/inorganik/CountUp.js': {
        stargazers_count: 3800,
        npm_version: '2.8.0',
        name: 'countup.js',
        full_name: 'inorganik/CountUp.js',
        pushed_at: '2024-11-20T10:00:00Z',
    },
    'github.com/SortableJS/Sortable': {
        stargazers_count: 29100,
        npm_version: '1.15.6',
        name: 'sortablejs',
        full_name: 'SortableJS/Sortable',
        pushed_at: '2024-12-15T14:20:00Z',
    },
    'github.com/josdejong/jsoneditor': {
        stargazers_count: 11500,
        npm_version: '10.1.0',
        name: 'jsoneditor',
        full_name: 'josdejong/jsoneditor',
        pushed_at: '2024-12-05T09:30:00Z',
    },
    'github.com/MikeMcl/bignumber.js': {
        stargazers_count: 6600,
        npm_version: '9.1.2',
        name: 'bignumber.js',
        full_name: 'MikeMcl/bignumber.js',
        pushed_at: '2024-11-28T15:45:00Z',
    },
    'github.com/MikeMcl/decimal.js': {
        stargazers_count: 1800,
        npm_version: '10.4.3',
        name: 'decimal.js',
        full_name: 'MikeMcl/decimal.js',
        pushed_at: '2024-11-30T11:20:00Z',
    },
    'github.com/dinerojs/dinero.js': {
        stargazers_count: 6100,
        npm_version: '2.0.0',
        name: 'dinero.js',
        full_name: 'dinerojs/dinero.js',
        pushed_at: '2024-10-15T08:00:00Z',
    },
    'github.com/cnwhy/nzh': {
        stargazers_count: 1100,
        npm_version: '1.0.4',
        name: 'nzh',
        full_name: 'cnwhy/nzh',
        pushed_at: '2024-09-10T14:00:00Z',
    },
    'github.com/adamwdraper/Numeral-js': {
        stargazers_count: 9500,
        npm_version: '2.0.6',
        name: 'numeral',
        full_name: 'adamwdraper/Numeral-js',
        pushed_at: '2023-08-20T10:00:00Z',
    },
    'github.com/katspaugh/wavesurfer.js': {
        stargazers_count: 8600,
        npm_version: '7.8.6',
        name: 'wavesurfer.js',
        full_name: 'katspaugh/wavesurfer.js',
        pushed_at: '2024-12-17T16:30:00Z',
    },
    'github.com/marcuswestin/store.js': {
        stargazers_count: 14000,
        npm_version: '2.0.12',
        name: 'store',
        full_name: 'marcuswestin/store.js',
        pushed_at: '2024-10-25T13:15:00Z',
    },
    'github.com/jaames/iro.js': {
        stargazers_count: 2300,
        npm_version: '5.5.2',
        name: '@irojs/iro-core',
        full_name: 'jaames/iro.js',
        pushed_at: '2024-11-12T10:40:00Z',
    },
    'github.com/simonwep/pickr': {
        stargazers_count: 4200,
        npm_version: '1.9.1',
        name: '@simonwep/pickr',
        full_name: 'simonwep/pickr',
        pushed_at: '2024-08-30T09:20:00Z',
    },
    'github.com/KingSora/OverlayScrollbars': {
        stargazers_count: 3800,
        npm_version: '2.10.1',
        name: 'overlayscrollbars',
        full_name: 'KingSora/OverlayScrollbars',
        pushed_at: '2024-12-16T12:00:00Z',
    },
    'github.com/russellsamora/scrollama': {
        stargazers_count: 3100,
        npm_version: '3.2.0',
        name: 'scrollama',
        full_name: 'russellsamora/scrollama',
        pushed_at: '2024-09-05T14:30:00Z',
    },
    'github.com/szimek/signature_pad': {
        stargazers_count: 3700,
        npm_version: '5.0.4',
        name: 'signature_pad',
        full_name: 'szimek/signature_pad',
        pushed_at: '2024-11-22T11:15:00Z',
    },
    'github.com/hodgef/simple-keyboard': {
        stargazers_count: 2100,
        npm_version: '3.8.9',
        name: 'simple-keyboard',
        full_name: 'hodgef/simple-keyboard',
        pushed_at: '2024-12-10T15:50:00Z',
    },
    'github.com/uuidjs/uuid': {
        stargazers_count: 14500,
        npm_version: '11.0.3',
        name: 'uuid',
        full_name: 'uuidjs/uuid',
        pushed_at: '2024-12-14T09:25:00Z',
    },
    'github.com/atomiks/tippyjs': {
        stargazers_count: 11800,
        npm_version: '6.3.7',
        name: 'tippy.js',
        full_name: 'atomiks/tippyjs',
        pushed_at: '2024-10-18T13:40:00Z',
    },
    'github.com/iamkun/dayjs': {
        stargazers_count: 46800,
        npm_version: '1.11.13',
        name: 'dayjs',
        full_name: 'iamkun/dayjs',
        pushed_at: '2024-12-17T10:15:00Z',
    },
    'github.com/moment/moment': {
        stargazers_count: 47900,
        npm_version: '2.30.1',
        name: 'moment',
        full_name: 'moment/moment',
        pushed_at: '2024-07-18T14:20:00Z',
    },
    'github.com/socketio/socket.io': {
        stargazers_count: 61000,
        npm_version: '4.8.1',
        name: 'socket.io',
        full_name: 'socketio/socket.io',
        pushed_at: '2024-12-18T08:30:00Z',
    },
    'github.com/jamiebuilds/tinykeys': {
        stargazers_count: 3500,
        npm_version: '3.0.0',
        name: 'tinykeys',
        full_name: 'jamiebuilds/tinykeys',
        pushed_at: '2024-07-15T12:00:00Z',
    },
    'github.com/zh-lx/pinyin-pro': {
        stargazers_count: 4800,
        npm_version: '3.24.2',
        name: 'pinyin-pro',
        full_name: 'zh-lx/pinyin-pro',
        pushed_at: '2024-12-16T14:20:00Z',
    },
    'github.com/bpmn-io/bpmn-js': {
        stargazers_count: 8700,
        npm_version: '17.11.1',
        name: 'bpmn-js',
        full_name: 'bpmn-io/bpmn-js',
        pushed_at: '2024-12-17T11:30:00Z',
    },
    'github.com/davidshimjs/qrcodejs': {
        stargazers_count: 4500,
        npm_version: 'N/A',
        name: 'qrcode',
        full_name: 'davidshimjs/qrcodejs',
        pushed_at: '2023-05-10T10:00:00Z',
    },
    'github.com/fullcalendar/fullcalendar': {
        stargazers_count: 18300,
        npm_version: '6.1.15',
        name: 'fullcalendar',
        full_name: 'fullcalendar/fullcalendar',
        pushed_at: '2024-12-15T13:45:00Z',
    },
    'github.com/zenorocha/clipboard.js': {
        stargazers_count: 34000,
        npm_version: '2.0.11',
        name: 'clipboard',
        full_name: 'zenorocha/clipboard.js',
        pushed_at: '2024-08-22T09:30:00Z',
    },
    'github.com/fengyuanchen/cropperjs': {
        stargazers_count: 12800,
        npm_version: '2.0.0-rc.2',
        name: 'cropperjs',
        full_name: 'fengyuanchen/cropperjs',
        pushed_at: '2024-12-11T15:20:00Z',
    },
    'github.com/videojs/video.js': {
        stargazers_count: 37800,
        npm_version: '8.12.0',
        name: 'video.js',
        full_name: 'videojs/video.js',
        pushed_at: '2024-12-16T10:40:00Z',
    },
    'github.com/video-dev/hls.js': {
        stargazers_count: 14700,
        npm_version: '1.5.17',
        name: 'hls.js',
        full_name: 'video-dev/hls.js',
        pushed_at: '2024-12-17T14:15:00Z',
    },
    'github.com/sampotts/plyr': {
        stargazers_count: 26200,
        npm_version: '3.7.8',
        name: 'plyr',
        full_name: 'sampotts/plyr',
        pushed_at: '2024-11-28T11:50:00Z',
    },
    'github.com/pqina/filepond': {
        stargazers_count: 15300,
        npm_version: '4.31.1',
        name: 'filepond',
        full_name: 'pqina/filepond',
        pushed_at: '2024-12-13T16:30:00Z',
    },
    'github.com/brix/crypto-js': {
        stargazers_count: 15800,
        npm_version: '4.2.0',
        name: 'crypto-js',
        full_name: 'brix/crypto-js',
        pushed_at: '2024-09-20T10:15:00Z',
    },
    'github.com/usablica/intro.js': {
        stargazers_count: 22600,
        npm_version: '7.2.0',
        name: 'intro.js',
        full_name: 'usablica/intro.js',
        pushed_at: '2024-12-09T13:25:00Z',
    },
    'github.com/kamranahmedse/driver.js': {
        stargazers_count: 22000,
        npm_version: '1.3.1',
        name: 'driver.js',
        full_name: 'kamranahmedse/driver.js',
        pushed_at: '2024-12-17T09:40:00Z',
    },
    'github.com/axios/axios': {
        stargazers_count: 105000,
        npm_version: '1.7.9',
        name: 'axios',
        full_name: 'axios/axios',
        pushed_at: '2024-12-18T07:55:00Z',
    },
    'github.com/js-cookie/js-cookie': {
        stargazers_count: 21600,
        npm_version: '3.0.5',
        name: 'js-cookie',
        full_name: 'js-cookie/js-cookie',
        pushed_at: '2024-10-30T14:10:00Z',
    },
    'github.com/ConnorAtherton/loaders.css': {
        stargazers_count: 10200,
        npm_version: 'N/A',
        name: 'loaders.css',
        full_name: 'ConnorAtherton/loaders.css',
        pushed_at: '2023-03-15T11:00:00Z',
    },
    'github.com/fengyuanchen/viewerjs': {
        stargazers_count: 7800,
        npm_version: '1.11.6',
        name: 'viewerjs',
        full_name: 'fengyuanchen/viewerjs',
        pushed_at: '2024-11-18T10:30:00Z',
    },
    'github.com/nolimits4web/swiper': {
        stargazers_count: 39700,
        npm_version: '11.1.14',
        name: 'swiper',
        full_name: 'nolimits4web/swiper',
        pushed_at: '2024-12-17T15:45:00Z',
    },
    'github.com/highlightjs/highlight.js': {
        stargazers_count: 23200,
        npm_version: '11.10.0',
        name: 'highlight.js',
        full_name: 'highlightjs/highlight.js',
        pushed_at: '2024-12-16T13:20:00Z',
    },
    'github.com/necolas/normalize.css': {
        stargazers_count: 52200,
        npm_version: '8.0.1',
        name: 'normalize.css',
        full_name: 'necolas/normalize.css',
        pushed_at: '2024-06-12T09:00:00Z',
    },
    'github.com/hakimel/reveal.js': {
        stargazers_count: 67600,
        npm_version: '5.1.0',
        name: 'reveal.js',
        full_name: 'hakimel/reveal.js',
        pushed_at: '2024-12-14T11:35:00Z',
    },
    'github.com/hammerjs/hammer.js': {
        stargazers_count: 24000,
        npm_version: '2.0.8',
        name: 'hammerjs',
        full_name: 'hammerjs/hammer.js',
        pushed_at: '2023-12-10T10:00:00Z',
    },
    'github.com/markedjs/marked': {
        stargazers_count: 32800,
        npm_version: '15.0.2',
        name: 'marked',
        full_name: 'markedjs/marked',
        pushed_at: '2024-12-17T12:50:00Z',
    },
    'github.com/Milkdown/milkdown': {
        stargazers_count: 8800,
        npm_version: '7.5.0',
        name: '@milkdown/core',
        full_name: 'Milkdown/milkdown',
        pushed_at: '2024-12-15T14:15:00Z',
    },
    'github.com/TahaSh/swapy': {
        stargazers_count: 5600,
        npm_version: '0.1.7',
        name: 'swapy',
        full_name: 'TahaSh/swapy',
        pushed_at: '2024-12-16T16:20:00Z',
    },
    'github.com/patrick-steele-idem/morphdom': {
        stargazers_count: 3000,
        npm_version: '2.7.4',
        name: 'morphdom',
        full_name: 'patrick-steele-idem/morphdom',
        pushed_at: '2024-07-25T13:10:00Z',
    },
    'github.com/transloadit/uppy': {
        stargazers_count: 29000,
        npm_version: '4.5.0',
        name: '@uppy/core',
        full_name: 'transloadit/uppy',
        pushed_at: '2024-12-18T09:40:00Z',
    },
    'github.com/lucide-icons/lucide': {
        stargazers_count: 11000,
        npm_version: '0.460.0',
        name: 'lucide-react',
        full_name: 'lucide-icons/lucide',
        pushed_at: '2024-12-18T06:25:00Z',
    },
    'github.com/VolodymyrBaydalka/docxjs': {
        stargazers_count: 480,
        npm_version: 'N/A',
        name: 'docx-preview',
        full_name: 'VolodymyrBaydalka/docxjs',
        pushed_at: '2024-11-05T10:00:00Z',
    },
    'github.com/nhn/tui.image-editor': {
        stargazers_count: 6900,
        npm_version: '3.15.3',
        name: 'tui-image-editor',
        full_name: 'nhn/tui.image-editor',
        pushed_at: '2024-10-20T14:30:00Z',
    },
    'github.com/taye/interact.js': {
        stargazers_count: 12200,
        npm_version: '1.10.27',
        name: 'interactjs',
        full_name: 'taye/interact.js',
        pushed_at: '2024-12-12T11:45:00Z',
    },
    'github.com/lodash/lodash': {
        stargazers_count: 59800,
        npm_version: '4.17.21',
        name: 'lodash',
        full_name: 'lodash/lodash',
        pushed_at: '2024-11-15T09:20:00Z',
    },
    'github.com/codemirror/codemirror5': {
        stargazers_count: 26700,
        npm_version: '5.65.18',
        name: 'codemirror',
        full_name: 'codemirror/codemirror5',
        pushed_at: '2024-12-10T13:55:00Z',
    },
    'github.com/xtermjs/xterm.js': {
        stargazers_count: 17600,
        npm_version: '5.5.0',
        name: 'xterm',
        full_name: 'xtermjs/xterm.js',
        pushed_at: '2024-12-16T15:30:00Z',
    },
    'github.com/sindresorhus/file-type': {
        stargazers_count: 3700,
        npm_version: '19.6.0',
        name: 'file-type',
        full_name: 'sindresorhus/file-type',
        pushed_at: '2024-12-13T10:15:00Z',
    },
    'github.com/microsoft/monaco-editor': {
        stargazers_count: 40500,
        npm_version: '0.52.2',
        name: 'monaco-editor',
        full_name: 'microsoft/monaco-editor',
        pushed_at: '2024-12-17T14:50:00Z',
    },
    'github.com/bgrins/TinyColor': {
        stargazers_count: 5100,
        npm_version: '1.6.0',
        name: 'tinycolor2',
        full_name: 'bgrins/TinyColor',
        pushed_at: '2024-08-15T11:20:00Z',
    },
    'github.com/dankogai/js-base64': {
        stargazers_count: 4200,
        npm_version: '3.7.7',
        name: 'js-base64',
        full_name: 'dankogai/js-base64',
        pushed_at: '2024-11-20T13:40:00Z',
    },
    'github.com/apache/echarts': {
        stargazers_count: 60800,
        npm_version: '5.5.1',
        name: 'echarts',
        full_name: 'apache/echarts',
        pushed_at: '2024-12-17T16:10:00Z',
    },
    'github.com/sodiray/radash': {
        stargazers_count: 4500,
        npm_version: '12.1.0',
        name: 'radash',
        full_name: 'sodiray/radash',
        pushed_at: '2024-12-15T12:30:00Z',
    },
    'github.com/KaTeX/KaTeX': {
        stargazers_count: 18400,
        npm_version: '0.16.11',
        name: 'katex',
        full_name: 'KaTeX/KaTeX',
        pushed_at: '2024-12-16T10:25:00Z',
    },
};

export default function GitHubStats({ url }: GitHubStatsProps) {
    const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!url.includes('github.com')) return;

        const urlKey = url
            .replace(/^https?:\/\//g, '')
            .split('?')[0]
            .split('#')[0];

        // 优先从运行时数据获取
        const runtimeData = (window as Window).__GITHUB_STATS__;
        if (runtimeData && runtimeData[urlKey]) {
            setRepoInfo(runtimeData[urlKey]);
        } else if (presetRepoData[urlKey]) {
            setRepoInfo(presetRepoData[urlKey]);
        }
    }, [url, refreshKey]);

    // 监听全局数据变化，检查是否有新数据
    useEffect(() => {
        const checkUpdate = setInterval(() => {
            const runtimeData = (window as Window).__GITHUB_STATS__;
            if (runtimeData) {
                // 触发重新加载
                setRefreshKey(prev => prev + 1);
            }
        }, 1000);

        return () => clearInterval(checkUpdate);
    }, []);

    if (!url.includes('github.com') || !repoInfo) {
        return null;
    }

    // 格式化更新时间为中文
    const formatUpdateTime = (dateStr: string) => {
        // 使用 ISO 8601 标准解析日期
        const date = new Date(dateStr);
        const now = new Date();

        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            return '未知';
        }

        // 计算时差（毫秒）
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return '今天';
        if (diffDays === 1) return '昨天';
        if (diffDays < 7) return `${diffDays}天前`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
        return `${Math.floor(diffDays / 365)}年前`;
    };

    return (
        <div className="flex items-center gap-3 text-xs text-gray-500">
            {/* Update Time */}
            {repoInfo.pushed_at && (
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>{formatUpdateTime(repoInfo.pushed_at)}</span>
                </span>
            )}

            {/* npm Version - 普通文字显示 */}
            {repoInfo.npm_version && repoInfo.npm_version !== 'N/A' && (
                <a
                    href={`https://www.npmjs.com/package/${repoInfo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    title="查看 npm 包"
                >
                    <span className="text-red-500">📦</span>
                    <span className="font-mono">v{repoInfo.npm_version}</span>
                </a>
            )}

            {/* License - MIT */}
            <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <span>MIT</span>
            </span>
        </div>
    );
}
