import type { Metadata } from "next"
import { getAllCategories } from "@/lib/data/categories"
import { PageHeader } from "@/components/layouts/page-header"
import { SubmitQuoteForm } from "@/components/features/submit/submit-quote-form"

export const metadata: Metadata = {
  title: "名言を投稿する",
  description: "あなたの心に残っている名言を教えてください。",
}

export default async function SubmitPage() {
  const categories = await getAllCategories()

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "名言を投稿" }]}
        title="名言を投稿する"
        description="あなたを支えてくれた言葉を、次の誰かへ。投稿いただいた名言は運営が確認したうえで掲載します。"
      />
      <div className="rounded-2xl border bg-card p-6 sm:p-8">
        <SubmitQuoteForm categoryNames={categories.map((category) => category.name)} />
      </div>
    </div>
  )
}
