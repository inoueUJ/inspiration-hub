"use client"

import { useActionState, useId } from "react"
import { useFormStatus } from "react-dom"
import { CheckCircle2, Loader2, Send } from "lucide-react"
import { submitQuoteAction } from "@/server/actions/submit-quote"
import type { QuoteSubmissionField } from "@/lib/validators/submission"
import type { SubmitQuoteState } from "@/types/submission"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SubmitQuoteFormProps {
  categoryNames: string[]
}

const initialState: SubmitQuoteState = { status: "idle" }

/**
 * 名言投稿フォーム
 *
 * - useActionState: Server Action の戻り値（成功 / フィールドエラー）をそのまま state に
 * - useFormStatus: 送信ボタンが自分の属する <form> の送信状態を購読（props のバケツリレー不要）
 * - useId: SSR とハイドレーションで一致する ID で label / aria-describedby を結ぶ
 * - Progressive Enhancement: JS 読み込み前でもネイティブの form 送信として動作する
 */
export function SubmitQuoteForm({ categoryNames }: SubmitQuoteFormProps) {
  const [state, formAction] = useActionState(submitQuoteAction, initialState)
  const formId = useId()

  const values = state.status === "error" ? state.values : {}
  const fieldErrors = state.status === "error" ? state.fieldErrors : {}

  function fieldProps(name: QuoteSubmissionField) {
    const errors = fieldErrors[name]
    return {
      id: `${formId}-${name}`,
      name,
      defaultValue: values[name] ?? "",
      "aria-invalid": errors ? true : undefined,
      "aria-describedby": errors ? `${formId}-${name}-error` : undefined,
    }
  }

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.status === "success" && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm"
        >
          <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
          <p>{state.message}</p>
        </div>
      )}
      {state.status === "error" && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className="mb-4 text-lg font-semibold">名言</legend>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-text`}>
            名言（原文）<Required />
          </Label>
          <Textarea {...fieldProps("text")} required maxLength={1000} rows={3} placeholder="Stay hungry, stay foolish." />
          <FieldError id={`${formId}-text-error`} errors={fieldErrors.text} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-textJa`}>日本語訳</Label>
          <Textarea {...fieldProps("textJa")} maxLength={1000} rows={2} placeholder="ハングリーであれ、愚か者であれ。" />
          <FieldError id={`${formId}-textJa-error`} errors={fieldErrors.textJa} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-authorName`}>
              人物名<Required />
            </Label>
            <Input {...fieldProps("authorName")} required maxLength={100} placeholder="スティーブ・ジョブズ" />
            <FieldError id={`${formId}-authorName-error`} errors={fieldErrors.authorName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-categoryName`}>カテゴリ</Label>
            {/* key で値の復元時に defaultValue を確実に反映させる */}
            <select
              key={values.categoryName ?? ""}
              {...fieldProps("categoryName")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 md:text-sm"
            >
              <option value="">選択してください</option>
              {categoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <FieldError id={`${formId}-categoryName-error`} errors={fieldErrors.categoryName} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-subcategoryName`}>中項目（作品名・職業など）</Label>
          <Input {...fieldProps("subcategoryName")} maxLength={100} placeholder="起業家" />
          <FieldError id={`${formId}-subcategoryName-error`} errors={fieldErrors.subcategoryName} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-background`}>背景・エピソード</Label>
          <Textarea
            {...fieldProps("background")}
            maxLength={2000}
            rows={3}
            placeholder="2005年、スタンフォード大学の卒業式でのスピーチより。"
          />
          <FieldError id={`${formId}-background-error`} errors={fieldErrors.background} />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-1 text-lg font-semibold">投稿者情報（任意）</legend>
        <p className="text-sm text-muted-foreground">
          掲載時のお礼や確認のご連絡にのみ使用します。
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-submitterName`}>ニックネーム</Label>
            <Input {...fieldProps("submitterName")} maxLength={50} autoComplete="nickname" />
            <FieldError id={`${formId}-submitterName-error`} errors={fieldErrors.submitterName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-submitterEmail`}>メールアドレス</Label>
            <Input {...fieldProps("submitterEmail")} type="email" autoComplete="email" />
            <FieldError id={`${formId}-submitterEmail-error`} errors={fieldErrors.submitterEmail} />
          </div>
        </div>
      </fieldset>

      {/* ハニーポット: 人間には見えず、ボットだけが埋める */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <SubmitButton />
    </form>
  )
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null
  return (
    <p id={id} className="text-sm text-destructive">
      {errors[0]}
    </p>
  )
}

function Required() {
  return (
    <span className="text-xs font-normal text-destructive" aria-label="必須">
      *
    </span>
  )
}

/**
 * 親の <form> の送信状態を useFormStatus で取得する送信ボタン
 */
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" disabled={pending} aria-busy={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 aria-hidden className="animate-spin" /> : <Send aria-hidden />}
      {pending ? "送信中…" : "名言を投稿する"}
    </Button>
  )
}
