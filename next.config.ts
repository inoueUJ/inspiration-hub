import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * React Compiler
     * コンポーネント / フックを自動でメモ化するため、useMemo・useCallback・memo を
     * 手書きせずに「再レンダリングしても安い」コードを書ける。
     * useDeferredValue / useTransition の効果（重い子ツリーのスキップ）もこれで担保する。
     */
    reactCompiler: true,
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
