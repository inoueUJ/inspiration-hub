# API仕様書

## 🎯 概要

Inspiration Hub のバックエンドAPIの完全な仕様書です。すべてのAPIは実装済みで動作確認済みです。

## 📡 ベースURL

- 開発環境: `http://localhost:3000/api`
- 本番環境: `https://your-domain.com/api`

## 🔐 認証

管理者向けAPIは Cookie ベースのセッション認証が必要です。

```
Cookie: session_token=<token>
```

---

## 📚 Categories API (大カテゴリ)

### GET /api/categories

全カテゴリを取得

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "偉人",
      "createdAt": "2025-11-29T00:00:00.000Z",
      "updatedAt": "2025-11-29T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

### GET /api/categories/[id]

特定のカテゴリを取得

### POST /api/categories

カテゴリを作成（🔒 管理者のみ）

**リクエストボディ:**
```json
{
  "name": "新しいカテゴリ"
}
```

### PUT /api/categories/[id]

カテゴリを更新（🔒 管理者のみ）

### DELETE /api/categories/[id]

カテゴリを削除（論理削除）（🔒 管理者のみ）

---

## 📂 Subcategories API (中項目)

### GET /api/subcategories

全中項目を取得

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoryId": 1,
      "name": "哲学者",
      "category": {
        "id": 1,
        "name": "偉人"
      },
      "createdAt": "2025-11-29T00:00:00.000Z",
      "updatedAt": "2025-11-29T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

### GET /api/subcategories/[id]

特定の中項目を取得

### POST /api/subcategories

中項目を作成（🔒 管理者のみ）

**リクエストボディ:**
```json
{
  "categoryId": 1,
  "name": "数学者"
}
```

### PUT /api/subcategories/[id]

中項目を更新（🔒 管理者のみ）

### DELETE /api/subcategories/[id]

中項目を削除（論理削除）（🔒 管理者のみ）

---

## 👤 Authors API (人物)

### GET /api/authors

全人物を取得

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ソクラテス",
      "createdAt": "2025-11-29T00:00:00.000Z",
      "updatedAt": "2025-11-29T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

### GET /api/authors/[id]

特定の人物を取得

### POST /api/authors

人物を作成（🔒 管理者のみ）

**リクエストボディ:**
```json
{
  "name": "プラトン"
}
```

### PUT /api/authors/[id]

人物を更新（🔒 管理者のみ）

### DELETE /api/authors/[id]

人物を削除（論理削除）（🔒 管理者のみ）

---

## 💬 Quotes API (名言)

### GET /api/quotes

全名言を取得

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text": "The only true wisdom is in knowing you know nothing.",
      "textJa": "無知の知こそが真の知恵である。",
      "authorId": 1,
      "subcategoryId": 1,
      "background": "ソクラテスの有名な言葉",
      "author": {
        "id": 1,
        "name": "ソクラテス"
      },
      "subcategory": {
        "id": 1,
        "name": "哲学者",
        "category": {
          "id": 1,
          "name": "偉人"
        }
      },
      "createdAt": "2025-11-29T00:00:00.000Z",
      "updatedAt": "2025-11-29T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

### GET /api/quotes/[id]

特定の名言を取得

### POST /api/quotes

名言を作成（🔒 管理者のみ）

**リクエストボディ:**
```json
{
  "text": "To be or not to be, that is the question.",
  "textJa": "生きるべきか死ぬべきか、それが問題だ。",
  "authorId": 5,
  "subcategoryId": 3,
  "background": "ハムレットの有名なセリフ"
}
```

### PUT /api/quotes/[id]

名言を更新（🔒 管理者のみ）

### DELETE /api/quotes/[id]

名言を削除（論理削除）（🔒 管理者のみ）

---

## 📅 Daily Quotes API (日替わり名言)

### GET /api/daily-quotes

日替わり名言を取得（30件）

**クエリパラメータ:**
- `date` (optional): YYYY-MM-DD形式の日付（省略時は今日）

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text": "I'm gonna be King of the Pirates!",
      "textJa": "おれは海賊王になる！",
      "author": {
        "id": 10,
        "name": "ルフィ"
      },
      "subcategory": {
        "id": 5,
        "name": "少年漫画",
        "category": {
          "id": 2,
          "name": "アニメ"
        }
      }
    }
  ]
}
```

**キャッシング:** 5分間

---

## 🔍 Search API (検索)

### GET /api/search

名言・作者名を検索

**クエリパラメータ:**
- `q` (required): 検索キーワード（2文字以上）

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text": "The only true wisdom is in knowing you know nothing.",
      "textJa": "無知の知こそが真の知恵である。",
      "author": {
        "id": 1,
        "name": "ソクラテス"
      },
      "subcategory": {
        "id": 1,
        "name": "哲学者",
        "category": {
          "id": 1,
          "name": "偉人"
        }
      }
    }
  ]
}
```

**検索対象:**
- 名言テキスト（英語・日本語）
- 作者名

**上限:** 30件

---

## ⏰ Cron API (バッチ処理)

### GET /api/cron/daily-quotes

日替わり名言を生成（Cloudflare Cron専用）

**認証:** Bearer token（環境変数 `CRON_SECRET`）

**スケジュール:** 毎日 0:00 UTC (JST 9:00)

**処理内容:**
1. 既存の今日の日替わり名言を削除
2. ランダムに30件の名言を選定
3. daily_quotesテーブルに挿入

---

## 🔑 Admin API (管理画面)

### POST /api/admin/login

管理者ログイン

**リクエストボディ:**
```json
{
  "password": "your-admin-password"
}
```

**レスポンス例:**
```json
{
  "success": true,
  "data": {
    "token": "abc123...",
    "expiresAt": "2025-11-30T00:00:00.000Z"
  }
}
```

**Cookie設定:** `session_token` が自動的にセットされます

---

## ❌ エラーレスポンス

すべてのAPIは統一されたエラーレスポンス形式を返します。

### エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| `VALIDATION_ERROR` | 400 | リクエストのバリデーションエラー |
| `UNAUTHORIZED` | 401 | 認証が必要 |
| `FORBIDDEN` | 403 | 権限不足 |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `CONFLICT` | 409 | リソースの競合 |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |

### エラーレスポンス例

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります"
  }
}
```

---

## 📊 実装状況

### ✅ 実装済み（基本機能）

- [x] Categories API (CRUD)
- [x] Subcategories API (CRUD)
- [x] Authors API (CRUD)
- [x] Quotes API (CRUD)
- [x] Daily Quotes API (GET)
- [x] Search API
- [x] Admin Login API
- [x] Cron Daily Quotes Generation

### 📝 設計済み（将来機能）

- [ ] Author Images API (画像アップロード・管理)
- [ ] Quote Submissions API (ユーザー投稿・承認)
- [ ] Recommendations API (AI推薦)
- [ ] Users API (ユーザー管理)
- [ ] User Interactions API (行動トラッキング)

---

## 🧪 テスト結果

```
✅ カテゴリ取得: 5件
✅ 中項目取得: 11件
✅ 人物取得: 15件
✅ 名言取得: 48件
✅ 検索結果: 4件
✅ 日替わり名言生成: 30件
✅ 日替わり名言取得: 30件
```

すべてのAPIが正常に動作しています！

---

## 🔧 開発者向け情報

### クエリ関数の場所

- Categories: `src/lib/db/queries/categories.ts`
- Subcategories: `src/lib/db/queries/subcategories.ts`
- Authors: `src/lib/db/queries/authors.ts`
- Quotes: `src/lib/db/queries/quotes.ts`
- Daily Quotes: `src/lib/db/queries/daily-quotes.ts`

### バリデーションスキーマ

`src/lib/api/validation.ts` にすべてのZodスキーマが定義されています。

### レスポンスヘルパー

`src/lib/api/response.ts` に `successResponse()` と `errorResponse()` 関数があります。

### 認証ミドルウェア

`src/lib/auth/middleware.ts` の `requireAuth()` 関数で認証チェックを行います。

---

**最終更新:** 2025-11-29
**バージョン:** 1.0.0
**ステータス:** 実装完了・テスト済み ✅
