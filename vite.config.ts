import { crx, defineManifest } from '@crxjs/vite-plugin';
import { defineConfig } from 'vite';

const manifest = defineManifest({
    manifest_version: 3,
    name: 'GitHub-VideoPlayer',
    description: 'GitHubのコントリビューション履歴のテーブルで動画を再生するプログラムです',
    version: '1.0.0',
    permissions: [
        'storage',
        'activeTab',
    ],
    host_permissions: [
        '*://github.com/*',
        '*://*.github.com/*'
    ],
    content_scripts: [
        {
            matches: [
                'https://github.com/*'
            ],
            js: [
                'src/index.ts',
                'src/videoPlayer.ts'
            ],
            run_at: 'document_start'
        }
    ],
    action: {
        default_title: 'GitHub-VideoPlayer',
        default_popup: 'src/popup/popup.html', // ポップアップ用のHTMLファイル
        default_icon: {
            "128": "public/images/logo-128.png"
        }
    }
});

export default defineConfig({
    plugins: [crx({ manifest })],
    build: {
        rollupOptions: {
            input: {
                popup: 'src/popup/popup.html',
            }
        },
        outDir: 'dist',
        emptyOutDir: true,
    },
    //  WebSocket connection to 'ws://localhost/' failed:  というエラーの対策
    // https://github.com/crxjs/chrome-extension-tools/issues/746#issuecomment-1647484887
    server: {
        port: 5174,
        strictPort: true,
        hmr: {
            port: 5174,
        },
    },
});