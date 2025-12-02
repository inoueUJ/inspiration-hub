# Next.js 15 + React 19 コーディング規約

**Tech Stack**: Next.js 15, React 19, TypeScript (strict mode), Drizzle ORM, Cloudflare D1, Tailwind CSS v4, shadcn/ui, Zod

**最終更新**: 2025-12-02

---

## 目次

1. [原則](#原則)
2. [Rule 1: デフォルト Server Component](#rule-1-デフォルト-server-component)
3. [Rule 2: Colocation + React cache()](#rule-2-colocation--react-cache)
4. [Rule 3: 粒度の細かい Suspense 境界](#rule-3-粒度の細かい-suspense-境界)
5. [Rule 4: ページレベルの Loading UI](#rule-4-ページレベルの-loading-ui)
6. [Rule 5: Server Actions vs Route Handlers](#rule-5-server-actions-vs-route-handlers)
7. [Rule 6: Middleware の軽量化](#rule-6-middleware-の軽量化)
8. [Rule 7: 型安全性 - Zod による Runtime Validation](#rule-7-型安全性---zod-による-runtime-validation)
9. [ディレクトリ構造](#ディレクトリ構造)
10. [チェックリスト](#チェックリスト)

---

## 原則

### 「Don't make me wait」哲学

ユーザーがデータ取得を待つことなく、ページレンダリングを待つことなく、レイアウトシフトを経験しない設計。

### Server-First Architecture

- デフォルトはすべてのコンポーネントが Server Component
- JavaScript バンドルサイズを最小化（インタラクティブな部分のみクライアント化）
- Drizzle + D1 へのアクセスはサーバー側に限定

---

## Rule 1: デフォルト Server Component

### 概要

App Router のすべてのコンポーネントはデフォルトで Server Component として動作します。**インタラクティブな機能が必要な場合のみ** `'use client'` ディレクティブを追加してください。

### ✅ 正しい例

```typescript
// app/dashboard/page.tsx (Server Component - デフォルト)
import { Suspense } from 'react'
import CarePlanSection from './CarePlanSection'
import ReportSection from './ReportSection'

export default async function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="py-4">
        <h1>ダッシュボード</h1>
      </header>
      
      <Suspense fallback={<CarePlanSkeleton />}>
        <CarePlanSection />
      </Suspense>
      
      <Suspense fallback={<ReportSkeleton />}>
        <ReportSection />
      </Suspense>
    </div>
  )
}

// app/dashboard/CarePlanSection.tsx (Server Component)
import { db } from '@/db'
import { carePlans } from '@/db/schema'
import { eq } from 'drizzle-orm'

async function CarePlanSection() {
  const plans = await db
    .select()
    .from(carePlans)
    .limit(10)
  
  return (
    <section>
      {plans.map((plan) => (
        <CarePlanCard key={plan.id} plan={plan} />
      ))}
    </section>
  )
}

// components/CarePlanCard.tsx (Client Component - インタラクティブ)
'use client'

import { useState } from 'react'
import type { CarePlan } from '@/db/schema'

export function CarePlanCard({ plan }: { plan: CarePlan }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div>
      <h3>{plan.title}</h3>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? '閉じる' : '詳細'}
      </button>
      {isExpanded && <p>{plan.description}</p>}
    </div>
  )
}
```

### ❌ 避けるべき例

```typescript
// ❌ クライアントコンポーネントで useEffect でデータ取得
'use client'

import { useEffect, useState } from 'react'

function CarePlanSection() {
  const [plans, setPlans] = useState([])
  
  useEffect(() => {
    fetch('/api/care-plans')
      .then(res => res.json())
      .then(setPlans)
    // 問題: ブラウザで実行される、遅延がある
  }, [])
  
  return <div>{/* plans */}</div>
}
```

### チェックリスト

- [ ] `useState`、`useEffect` を使わない（必要な場合のみ `'use client'`）
- [ ] Drizzle ORM へのアクセスはすべて Server Component
- [ ] API キーやセンシティブ情報をブラウザに露出させていない

---

## Rule 2: Colocation + React cache()

### 概要

データ取得ロジックを、それを使用するコンポーネント内に配置します（Colocation）。複数コンポーネント間で同じデータを使う場合は、`React.cache()` で自動的な重複排除を活用します。

### ✅ 正しい例

```typescript
// lib/data.ts
import { cache } from 'react'
import { db } from '@/db'
import { patients, carePlans } from '@/db/schema'
import { eq } from 'drizzle-orm'

// cache() で memoize - 同一リクエスト内での重複排除
export const getPatient = cache(async (patientId: string) => {
  return await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .then(res => res[0])
})

export const getPatientCarePlans = cache(async (patientId: string) => {
  return await db
    .select()
    .from(carePlans)
    .where(eq(carePlans.patientId, patientId))
})

// app/patients/[id]/page.tsx
import { getPatient, getPatientCarePlans } from '@/lib/data'

async function PatientPage({ params }: { params: { id: string } }) {
  // 最初の呼び出し - DB query 実行
  const patient = await getPatient(params.id)
  
  // 同じ patient data が必要な場合、別コンポーネントで呼び出しても
  // cache により同じデータが返される（DB query は1回）
  
  return (
    <div>
      <PatientInfo patientId={params.id} />
      <CarePlanList patientId={params.id} />
      <VitalsChart patientId={params.id} />
    </div>
  )
}

// app/patients/[id]/PatientInfo.tsx
async function PatientInfo({ patientId }: { patientId: string }) {
  const patient = await getPatient(patientId) // キャッシュされたデータ
  return <div>{patient.name}</div>
}

// app/patients/[id]/CarePlanList.tsx
async function CarePlanList({ patientId }: { patientId: string }) {
  const carePlans = await getPatientCarePlans(patientId) // キャッシュ
  return <div>{carePlans.length} plans</div>
}

// app/patients/[id]/VitalsChart.tsx
async function VitalsChart({ patientId }: { patientId: string }) {
  const patient = await getPatient(patientId) // 再度呼び出しても同じデータ
  return <div>Patient: {patient.name}</div>
}
```

### ❌ 避けるべき例

```typescript
// ❌ 毎コンポーネントで直接 DB query（重複）
async function PatientInfo({ patientId }: { patientId: string }) {
  const patient = await db.select().from(patients).where(eq(patients.id, patientId))
  // query 1回目
}

async function VitalsChart({ patientId }: { patientId: string }) {
  const patient = await db.select().from(patients).where(eq(patients.id, patientId))
  // query 2回目 - 重複!
}
```

### チェックリスト

- [ ] 複数コンポーネント間で共有するデータ取得は `lib/data.ts` に定義
- [ ] `React.cache()` でラップして自動重複排除を活用
- [ ] 各コンポーネントは `lib/data.ts` の関数を呼び出す

---

## Rule 3: 粒度の細かい Suspense 境界

### 概要

コンポーネント単位でデータ取得時間が異なる場合、`<Suspense>` 境界で分割してストリーミングを実現します。ページ全体ではなく、必要な部分のみローディング状態を表示。

### ✅ 正しい例

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import CarePlanSection from './sections/CarePlanSection'
import ReportSection from './sections/ReportSection'
import AnalyticsSection from './sections/AnalyticsSection'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* ヘッダーはすぐにレンダリング */}
      <header>
        <h1>ダッシュボード</h1>
        <p>患者情報と訪問記録</p>
      </header>
      
      {/* セクションごとに独立した Suspense 境界 */}
      <Suspense fallback={<CarePlanSkeleton />}>
        <CarePlanSection />
      </Suspense>
      
      <Suspense fallback={<ReportSkeleton />}>
        <ReportSection />
      </Suspense>
      
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsSection />
      </Suspense>
    </div>
  )
}

// Skeleton コンポーネント（小さく、軽量）
function CarePlanSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  )
}

// sections/CarePlanSection.tsx
async function CarePlanSection() {
  // 時間がかかるデータ取得（例：3秒）
  const plans = await getCarePlans()
  
  return (
    <section className="border rounded-lg p-4">
      <h2>ケアプラン</h2>
      {plans.map(plan => (
        <CarePlanCard key={plan.id} plan={plan} />
      ))}
    </section>
  )
}
```

### ❌ 避けるべき例

```typescript
// ❌ Suspense を使わない（全体が遅い）
export default async function DashboardPage() {
  // ここで全てのデータを待つ
  const plans = await getCarePlans() // 3秒
  const reports = await getReports()   // 2秒
  const analytics = await getAnalytics() // 5秒
  // → 最遅は 5秒、ページ全体が 5秒待つ
  
  return (
    <div>
      <header>
        {/* 5秒待ってからこれが表示される */}
      </header>
      <CarePlanSection plans={plans} />
      <ReportSection reports={reports} />
      <AnalyticsSection analytics={analytics} />
    </div>
  )
}
```

### チェックリスト

- [ ] ページ内で時間がかかるセクションごとに `<Suspense>` を張っている
- [ ] ローディング UI（Skeleton）は軽量で、すぐに表示可能
- [ ] 独立したセクションの `<Suspense>` は separate している

---

## Rule 4: ページレベルの Loading UI

### 概要

ルートセグメント全体がデータ取得を待つ場合、ページレベルのローディング状態は `loading.tsx` ファイルで定義します。Next.js が自動的に `<Suspense>` で wrap します。

### ✅ 正しい例

```typescript
// app/patients/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function PatientLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-10 w-1/3" /> {/* 名前 */}
      <Skeleton className="h-6 w-full" />  {/* 説明 */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-40" />      {/* グラフ */}
        <Skeleton className="h-40" />      {/* テーブル */}
      </div>
    </div>
  )
}

// app/patients/[id]/page.tsx
async function PatientPage({ params }: { params: { id: string } }) {
  const patient = await getPatient(params.id)
  
  return (
    <div className="space-y-4 p-6">
      <h1>{patient.name}</h1>
      <p>{patient.description}</p>
      {/* ... */}
    </div>
  )
}
```

### ❌ 避けるべき例

```typescript
// ❌ loading.tsx と Suspense の混在（二重になる）
// app/patients/[id]/loading.tsx
export default function Loading() {
  return <Skeleton />
}

// app/patients/[id]/page.tsx
export default async function Page() {
  const patient = await getPatient(params.id)
  
  return (
    <Suspense fallback={<Skeleton />}>  {/* 二重の loading UI */}
      <div>{patient.name}</div>
    </Suspense>
  )
}
```

### チェックリスト

- [ ] ページセグメント直下に `loading.tsx` を配置している
- [ ] loading UI は実際のコンテンツと同じレイアウト形状
- [ ] 過度に複雑ではない（2-3秒で完成する Skeleton）

---

## Rule 5: Server Actions vs Route Handlers

### 概要

**Server Actions**: フォーム送信や単純なミューテーション向け。  
**Route Handlers**: 複雑なロジック、複数ステップ、外部 API 統合向け。

### ✅ Server Actions（シンプルな操作）

```typescript
// server/actions/careplan.ts
'use server'

import { db } from '@/db'
import { carePlans } from '@/db/schema'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

const UpdateCarePlanSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, '最低1文字必要').max(255),
  description: z.string().max(2000).optional(),
})

export async function updateCarePlan(formData: FormData) {
  const data = Object.fromEntries(formData)
  const validated = UpdateCarePlanSchema.parse(data)
  
  try {
    await db
      .update(carePlans)
      .set({
        title: validated.title,
        description: validated.description,
      })
      .where(eq(carePlans.id, validated.id))
    
    revalidatePath('/dashboard/care-plans')
    
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Update failed' }
  }
}

// components/UpdateCarePlanForm.tsx
'use client'

import { useActionState } from 'react'
import { updateCarePlan } from '@/server/actions/careplan'

export function UpdateCarePlanForm({ carePlanId }: { carePlanId: string }) {
  const [state, formAction, isPending] = useActionState(updateCarePlan, null)
  
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={carePlanId} />
      
      <div>
        <label htmlFor="title">タイトル</label>
        <input
          id="title"
          name="title"
          required
          disabled={isPending}
        />
      </div>
      
      <div>
        <label htmlFor="description">説明</label>
        <textarea
          id="description"
          name="description"
          disabled={isPending}
        />
      </div>
      
      <button type="submit" disabled={isPending}>
        {isPending ? '更新中...' : '更新'}
      </button>
      
      {state?.error && (
        <p className="text-red-500">{state.error}</p>
      )}
    </form>
  )
}
```

### ✅ Route Handlers（複雑なロジック）

```typescript
// app/api/care-plans/[id]/route.ts
import { db } from '@/db'
import { carePlans } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const UpdateCarePlanSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 入力検証
    const body = await request.json()
    const validated = UpdateCarePlanSchema.parse(body)
    
    // 2. DB更新
    const updated = await db
      .update(carePlans)
      .set(validated)
      .where(eq(carePlans.id, params.id))
      .returning()
    
    if (!updated[0]) {
      return Response.json(
        { error: 'Care plan not found' },
        { status: 404 }
      )
    }
    
    // 3. 副作用（外部API、メール送信など）
    await sendNotification({
      type: 'care-plan:updated',
      data: updated[0],
    })
    
    await triggerWebhook('care-plan:updated', updated[0])
    
    // 4. 応答
    return Response.json(updated[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### チェックリスト

- [ ] シンプルなフォーム送信 → Server Actions
- [ ] 複雑なロジック・複数ステップ → Route Handlers
- [ ] Server Actions は Zod で検証
- [ ] Route Handlers はエラーハンドリングが明確

---

## Rule 6: Middleware の軽量化

### 概要

Middleware はリクエスト処理の最初の段階で実行されるため、複雑なロジックは避け、情報の付与（Header に設定）に徹します。複雑なロジックは `server/` ディレクトリに分離。

### ✅ 正しい例

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { detectDevice } from '@/lib/device'
import { getLocaleFromURL } from '@/lib/locale'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 軽量な情報付与のみ
  const userAgent = request.headers.get('user-agent') || ''
  const deviceType = detectDevice(userAgent)
  const locale = getLocaleFromURL(request.url)
  
  response.headers.set('x-device-type', deviceType)
  response.headers.set('x-locale', locale)
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

// コンポーネント層で Header を読む
// lib/device.ts
export async function getDeviceType(): Promise<'mobile' | 'desktop'> {
  const { headers } = await import('next/headers')
  const headersList = headers()
  return (headersList.get('x-device-type') as 'mobile' | 'desktop') || 'desktop'
}

// components/ResponsiveLayout.tsx
async function ResponsiveLayout() {
  const deviceType = await getDeviceType()
  
  return (
    <div>
      {deviceType === 'mobile' ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  )
}
```

### ❌ 避けるべき例

```typescript
// ❌ middleware.ts が肥大化
export function middleware(request: NextRequest) {
  // 認証チェック（複雑）
  const token = request.cookies.get('auth-token')?.value
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // JWT 検証（複雑）
  const payload = verifyJWT(token)
  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
  
  // ユーザー情報取得（DB query - 遅い！）
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  })
  
  // 権限チェック（複雑）
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // → 全リクエストが遅くなる
}
```

### チェックリスト

- [ ] Middleware は情報付与（Header）に徹している
- [ ] 認証・認可などの複雑なロジックは分離
- [ ] DB query や外部 API はしていない

---

## Rule 7: 型安全性 - Zod による Runtime Validation

### 概要

TypeScript strict mode に加えて、Zod で Runtime validation を必ず実施。フォーム入力や API 応答の検証を強制。

### ✅ 正しい例

```typescript
// lib/validators.ts
import { z } from 'zod'

export const PatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '最低1文字必要').max(100),
  email: z.string().email('有効なメールアドレスを入力してください'),
  age: z.number().int().min(0).max(150),
  notes: z.string().max(500).optional(),
})

export type Patient = z.infer<typeof PatientSchema>

// server/actions/patient.ts
'use server'

import { db } from '@/db'
import { patients } from '@/db/schema'
import { PatientSchema } from '@/lib/validators'

export async function createPatient(formData: FormData) {
  try {
    const data = Object.fromEntries(formData)
    const validated = PatientSchema.parse(data)
    
    await db.insert(patients).values(validated)
    
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      }
    }
    
    return { success: false, error: 'Internal server error' }
  }
}

// components/PatientForm.tsx
'use client'

import { useActionState } from 'react'
import { createPatient } from '@/server/actions/patient'
import { PatientSchema } from '@/lib/validators'

export function PatientForm() {
  const [state, formAction] = useActionState(createPatient, null)
  
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name">名前</label>
        <input
          id="name"
          name="name"
          required
        />
        {state?.errors?.name && (
          <p className="text-red-500">{state.errors.name[0]}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email">メール</label>
        <input
          id="email"
          name="email"
          type="email"
          required
        />
        {state?.errors?.email && (
          <p className="text-red-500">{state.errors.email[0]}</p>
        )}
      </div>
      
      <button type="submit">作成</button>
    </form>
  )
}
```

### ❌ 避けるべき例

```typescript
// ❌ Runtime validation なし（危険）
'use server'

export async function createPatient(formData: FormData) {
  const data = Object.fromEntries(formData)
  
  // バリデーションなし！
  // 無効なデータが DB に入る可能性
  await db.insert(patients).values(data)
}
```

### チェックリスト

- [ ] すべてのフォーム入力に Zod validation を実施
- [ ] API 応答データも Zod で検証
- [ ] validation エラーはユーザーに返す
- [ ] `z.infer<typeof Schema>` で型を生成

---

## ディレクトリ構造

推奨される構成：

```
app/
├── layout.tsx
├── page.tsx
├── (auth)/
│   ├── login/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── register/
│       ├── page.tsx
│       └── loading.tsx
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── care-plans/
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── components/
│   │   │       ├── CarePlanForm.tsx
│   │   │       └── CarePlanDetail.tsx
│   │   └── page.tsx
│   └── reports/
│       └── page.tsx
├── api/
│   ├── care-plans/
│   │   └── [id]/
│   │       └── route.ts
│   └── reports/
│       └── route.ts
components/
├── ui/                 {shadcn/ui components}
├── forms/              {フォームコンポーネント}
├── sections/           {ページセクション}
└── skeletons/          {Loading skeleton UI}
lib/
├── data.ts             {cache() 付きのデータ取得関数}
├── validators.ts       {Zod schemas}
├── device.ts           {Device detection utilities}
└── locale.ts           {Locale utilities}
server/
├── actions/            {Server Actions}
│   ├── careplan.ts
│   └── patient.ts
└── middleware/         {複雑な middleware ロジック}
    └── auth.ts
middleware.ts          {Next.js middleware}
```

---

## チェックリスト

コード審査時に確認する項目：

### Server Components

- [ ] デフォルトは Server Component か（`'use client'` は明確な理由がある）
- [ ] `useState`、`useEffect` は Client Component のみで使用
- [ ] Drizzle + D1 アクセスはすべて Server Component か

### データフェッチング

- [ ] 複数コンポーネント間の共有データは `React.cache()` を使用
- [ ] データ取得は使用コンポーネントの近くに配置（Colocation）
- [ ] 無駄な重複取得がないか

### UI と Loading

- [ ] 時間がかかるセクションごとに `<Suspense>` 境界を張っているか
- [ ] ページレベルのローディングは `loading.tsx` か
- [ ] Skeleton UI は軽量で実際のレイアウトに近いか

### ミューテーション

- [ ] シンプルなフォーム送信 → Server Actions
- [ ] 複雑なロジック → Route Handlers
- [ ] すべて Zod で検証しているか
- [ ] `revalidatePath` または `revalidateTag` でキャッシュ無効化

### 型安全性

- [ ] TypeScript strict mode
- [ ] Zod validation（Runtime）
- [ ] エラーメッセージはユーザーに返す

### パフォーマンス

- [ ] Cloudflare Workers での実行を考慮（Edge runtime）
- [ ] Client-side JavaScript は最小化
- [ ] 不要な re-renders がないか

---

## レビュー時の質問テンプレート

このドキュメントを使用して、AIにコードレビューを依頼する場合：

```
以下のコード規約に従って、このコードをレビューしてください：

[CODING_STANDARDS.md を提供]

以下のポイントを特に見てください：
1. Server Component vs Client Component の分け方は正しいか
2. Colocation + React.cache() は適切か
3. Suspense 境界は粒度正しいか
4. Server Actions vs Route Handlers の使い分けは正確か
5. Zod validation は実施されているか
6. 改善提案がある場合は、具体的な修正例を示してください
```

---

## 参考資料

- [Next.js 15 App Router Documentation](https://nextjs.org/docs)
- [React 19 Server Components](https://react.dev/reference/rsc/server-components)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**作成日**: 2025-12-02  
**バージョン**: 1.0  
**最後にレビュー**: [日付を更新]