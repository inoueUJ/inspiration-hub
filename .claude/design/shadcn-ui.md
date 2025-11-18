# shadcn/ui 統合ガイド

## shadcn/uiとは

shadcn/uiは、Radix UIとTailwind CSSをベースにした、コピー&ペースト可能なコンポーネントライブラリです。

### 特徴

- **コピー&ペースト方式**: npmパッケージではなく、コードを直接プロジェクトにコピー
- **完全なカスタマイズ性**: ソースコードを直接編集可能
- **アクセシビリティ**: Radix UIベースで高いアクセシビリティ
- **TypeScript対応**: 完全な型安全性
- **Tailwind CSS**: スタイリングにTailwind CSSを使用

## セットアップ手順

### 1. shadcn/ui初期化

```bash
npx shadcn@latest init
```

初期化時の設定:
```
✔ Preflight and global styles? … yes
✔ Would you like to use CSS variables for theming? … yes
✔ Where is your global CSS file? … src/app/globals.css
✔ Would you like to use the New York or Default style? … Default
✔ Where is your Tailwind config located? … tailwind.config.ts
✔ Configure the import alias for components? … @/components
✔ Configure the import alias for utils? … @/lib/utils
✔ Are you using React Server Components? … yes
```

### 2. 必要なコンポーネントのインストール

```bash
# 基本コンポーネント
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add skeleton
npx shadcn@latest add badge
npx shadcn@latest add separator

# フォーム関連
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add textarea

# ナビゲーション
npx shadcn@latest add breadcrumb
npx shadcn@latest add sheet

# フィードバック
npx shadcn@latest add toast
npx shadcn@latest add alert

# テーブル（管理画面用）
npx shadcn@latest add table
npx shadcn@latest add dropdown-menu
```

### 3. components.json設定

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## テーマカスタマイズ

### globals.css設定

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### カスタムカラーの追加

```css
:root {
  /* 既存の変数... */

  /* カスタムカラー */
  --quote-highlight: 45 93% 47%;
  --category-primary: 271 91% 65%;
  --author-accent: 142 71% 45%;
}

.dark {
  /* 既存の変数... */

  /* ダークモード用カスタムカラー */
  --quote-highlight: 45 93% 57%;
  --category-primary: 271 91% 75%;
  --author-accent: 142 71% 55%;
}
```

## プロジェクトで使用するコンポーネント

### Button（ボタン）

```tsx
import { Button } from '@/components/ui/button'

// 使用例
<Button>デフォルト</Button>
<Button variant="destructive">削除</Button>
<Button variant="outline">アウトライン</Button>
<Button variant="ghost">ゴースト</Button>
<Button size="sm">小</Button>
<Button size="lg">大</Button>
<Button asChild>
  <Link href="/about">リンクとして</Link>
</Button>
```

### Card（カード）

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

// 名言カードでの使用例
<Card>
  <CardHeader>
    <CardTitle>カテゴリ・人物名</CardTitle>
  </CardHeader>
  <CardContent>
    <p>名言テキスト</p>
  </CardContent>
</Card>
```

### Dialog（ダイアログ）

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// 名言詳細ダイアログでの使用例
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>名言詳細</DialogTitle>
    </DialogHeader>
    <div>
      {/* 名言内容 */}
    </div>
    <DialogFooter>
      <Button onClick={handlePrev}>前へ</Button>
      <Button onClick={handleNext}>次へ</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Input（入力フィールド）

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// 検索バーでの使用例
<div>
  <Label htmlFor="search">検索</Label>
  <Input
    id="search"
    type="search"
    placeholder="名言・作者を検索"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />
</div>
```

### Form（フォーム）

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  text: z.string().min(1, '名言を入力してください'),
  textJa: z.string().optional(),
})

// 管理画面での使用例
function QuoteForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      textJa: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // 送信処理
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名言（原文）</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                名言の原文を入力してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">登録</Button>
      </form>
    </Form>
  )
}
```

### Skeleton（スケルトン）

```tsx
import { Skeleton } from '@/components/ui/skeleton'

// Loading UIでの使用例
export function QuoteCardSkeleton() {
  return (
    <div className="rounded-lg border p-6">
      <div className="mb-2 flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  )
}
```

### Badge（バッジ）

```tsx
import { Badge } from '@/components/ui/badge'

// カテゴリバッジでの使用例
<Badge>哲学者</Badge>
<Badge variant="secondary">30件</Badge>
<Badge variant="outline">偉人</Badge>
<Badge variant="destructive">削除済み</Badge>
```

### Sheet（シート/サイドメニュー）

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// モバイルナビゲーションでの使用例
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>メニュー</SheetTitle>
    </SheetHeader>
    <nav className="flex flex-col space-y-4">
      <Link href="/">ホーム</Link>
      <Link href="/categories">カテゴリ</Link>
    </nav>
  </SheetContent>
</Sheet>
```

### Breadcrumb（パンくずリスト）

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// ページナビゲーションでの使用例
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">ホーム</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/category/1">偉人</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>哲学者</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Toast（トースト通知）

```tsx
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

// 使用例
function Component() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "名言を追加しました",
          description: "新しい名言が正常に登録されました",
        })
      }}
    >
      名言を追加
    </Button>
  )
}

// Toasterをlayout.tsxに追加
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### Table（テーブル - 管理画面用）

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// 名言一覧管理画面での使用例
<Table>
  <TableCaption>名言一覧</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>名言</TableHead>
      <TableHead>作者</TableHead>
      <TableHead>カテゴリ</TableHead>
      <TableHead>操作</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {quotes.map((quote) => (
      <TableRow key={quote.id}>
        <TableCell>{quote.id}</TableCell>
        <TableCell>{quote.textJa || quote.text}</TableCell>
        <TableCell>{quote.author.name}</TableCell>
        <TableCell>{quote.subcategory.name}</TableCell>
        <TableCell>
          <Button size="sm" variant="ghost">編集</Button>
          <Button size="sm" variant="ghost">削除</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### DropdownMenu（ドロップダウンメニュー）

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// 操作メニューでの使用例
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>編集</DropdownMenuItem>
    <DropdownMenuItem>削除</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## カスタムコンポーネントの作成

### 名言専用カードコンポーネント

```tsx
// src/components/ui/quote-card-wrapper.tsx
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuoteCardWrapperProps {
  children: React.ReactNode
  variant?: 'default' | 'highlight'
  className?: string
}

export function QuoteCardWrapper({
  children,
  variant = 'default',
  className,
}: QuoteCardWrapperProps) {
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-lg',
        variant === 'highlight' && 'border-primary',
        className
      )}
    >
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}
```

## アイコンライブラリ（lucide-react）

shadcn/uiはlucide-reactを使用

```bash
npm install lucide-react
```

```tsx
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Menu,
  Home,
  BookOpen,
  User,
  Settings,
  LogOut,
} from 'lucide-react'

// 使用例
<Button>
  <Search className="mr-2 h-4 w-4" />
  検索
</Button>
```

## レスポンシブデザイン

Tailwind CSSのブレークポイントを活用

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* グリッドアイテム */}
</div>

<Card className="p-4 sm:p-6 lg:p-8">
  {/* レスポンシブパディング */}
</Card>

<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  {/* レスポンシブテキストサイズ */}
</h1>
```

## ダークモード対応

### next-themesの使用

```bash
npm install next-themes
```

```tsx
// src/components/theme-provider.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// src/app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### テーマ切り替えボタン

```tsx
// src/components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">テーマ切り替え</span>
    </Button>
  )
}
```

## アクセシビリティ

shadcn/uiはRadix UIベースで高いアクセシビリティを提供

### 確認事項

- [ ] キーボードナビゲーション対応
- [ ] スクリーンリーダー対応
- [ ] 適切なARIAラベル
- [ ] フォーカス管理
- [ ] カラーコントラスト

```tsx
// 良い例
<Button aria-label="検索を実行">
  <Search className="h-4 w-4" />
</Button>

<Dialog>
  <DialogContent aria-describedby="dialog-description">
    <DialogTitle>名言詳細</DialogTitle>
    <p id="dialog-description">名言の詳細情報を表示します</p>
  </DialogContent>
</Dialog>
```

## カスタマイズのベストプラクティス

### 1. コンポーネントの拡張

```tsx
// src/components/ui/button.tsx を拡張
import { buttonVariants } from '@/components/ui/button'

// 新しいバリアントを追加
const customButtonVariants = cva(
  buttonVariants.base,
  {
    variants: {
      ...buttonVariants.variants,
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    },
  }
)
```

### 2. 共通スタイルの抽出

```tsx
// src/lib/styles.ts
export const cardStyles = {
  base: "rounded-lg border bg-card text-card-foreground shadow-sm",
  interactive: "transition-all hover:shadow-lg cursor-pointer",
  highlight: "border-primary bg-primary/5",
}
```

### 3. cn()ヘルパーの活用

```tsx
import { cn } from '@/lib/utils'

<Card className={cn(
  "p-6",
  isHighlighted && "border-primary",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  {/* コンテンツ */}
</Card>
```

## まとめ

### shadcn/ui導入チェックリスト

- [ ] shadcn/uiを初期化
- [ ] 必要なコンポーネントをインストール
- [ ] テーマカスタマイズ
- [ ] ダークモード対応
- [ ] アイコンライブラリ導入
- [ ] レスポンシブ対応確認
- [ ] アクセシビリティ確認
- [ ] カスタムコンポーネント作成

### 使用コンポーネント一覧

| コンポーネント | 用途 | 優先度 |
|--------------|------|--------|
| Button | 各種ボタン | 高 |
| Card | 名言カード表示 | 高 |
| Dialog | 名言詳細ダイアログ | 高 |
| Input | 検索、フォーム入力 | 高 |
| Skeleton | ローディングUI | 高 |
| Form | 管理画面フォーム | 高 |
| Badge | カテゴリタグ | 中 |
| Breadcrumb | パンくずリスト | 中 |
| Sheet | モバイルナビ | 中 |
| Toast | 通知 | 中 |
| Table | 管理画面一覧 | 中 |
| DropdownMenu | 操作メニュー | 低 |
| Alert | エラー表示 | 低 |
