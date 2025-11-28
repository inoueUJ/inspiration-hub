---
applyTo: '**'
---

# GitHub Copilot Coding Agent 追加指示

このファイルは、GitHub Copilot Coding Agent 向けの追加指示です。

## 必須確認事項

コードを変更した場合、以下のコマンドが正常に完了することを確認してください：

```bash
# 型チェック
npx tsc --noEmit

# Lint
npm run lint

# ビルド
npm run build
```

## コミットメッセージ規約

以下の形式でコミットメッセージを作成してください：

```
<type>: <subject>
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット
- `refactor`: リファクタリング
- `test`: テスト追加
- `chore`: ビルド、設定変更

### 例

```
feat: Add quote dialog component
fix: Fix category list rendering
docs: Update README
```

## プルリクエスト作成時の注意

1. **日本語で説明を記載** - このプロジェクトは日本語で運用
2. **箇条書きで変更内容を明記** - 何を変更したか分かりやすく
3. **関連issueがあればリンク** - `Closes #123` 形式
4. **破壊的変更がある場合は明記** - `BREAKING CHANGE:` で開始

## 技術的な注意点

### Server Components / Client Components

- **デフォルトはServer Components** - `"use client"` は最小限に
- **ページコンポーネント全体を Client Component にしない**
- **Composition Pattern を活用** - Server Components で Client Components をラップ

### Zod バリデーション

- API リクエストは必ず Zod スキーマで検証
- `try-catch` で `z.ZodError` をハンドリング

### Drizzle ORM

- 型推論を活用（`$inferSelect` / `$inferInsert`）
- 削除は Soft Delete（`deletedAt` に日時を設定）
- 読み取りクエリでは `isNull(table.deletedAt)` でフィルタ

### Soft Delete

データの物理削除は行わず、`deletedAt` カラムに日時を設定：

```typescript
// DELETE (Soft Delete)
const [deleted] = await db
  .update(quotes)
  .set({ deletedAt: new Date() })
  .where(eq(quotes.id, id))
  .returning();
```

### エラーハンドリング

- 必ず `try-catch` で適切に処理
- `successResponse` / `errorResponse` ヘルパーを使用
- エラーログは `console.error` で記録

## 禁止事項

1. ❌ `any` 型の使用
2. ❌ ページ全体を `"use client"` にする
3. ❌ 未処理例外（必ず try-catch で処理）
4. ❌ `console.log` のコミット（開発時のみ使用）

## 参考ドキュメント

- [CLAUDE.md](../../CLAUDE.md) - メイン設定ファイル
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - アーキテクチャドキュメント
- [.github/copilot-instructions.md](../copilot-instructions.md) - 既存のCopilot指示ファイル
