"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { createSubmissionWithinQuota } from "@/lib/data/submissions"
import { sha256Hex } from "@/lib/utils/hash"
import {
  QUOTE_SUBMISSION_FIELDS,
  QuoteSubmissionSchema,
} from "@/lib/validators/submission"
import type { SubmissionValues, SubmitQuoteState } from "@/types/submission"

/** 同一IPからの投稿は 10分あたり3件まで */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_SUBMISSIONS = 3

/** ボット対策のハニーポット（人間には見えない入力欄） */
const HONEYPOT_FIELD = "website"

/**
 * 送信元IPをハッシュ化して取得
 * 生のIPアドレスは保存せず、ソルト付き SHA-256 のみを保持する
 */
async function getSubmitterFingerprint(): Promise<string> {
  const headerList = await headers()
  const ip =
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  const salt = process.env.IP_HASH_SALT ?? "inspiration-hub"

  return sha256Hex(`${salt}:${ip}`)
}

function pickValues(formData: FormData): SubmissionValues {
  const values: SubmissionValues = {}
  for (const field of QUOTE_SUBMISSION_FIELDS) {
    const value = formData.get(field)
    if (typeof value === "string") values[field] = value
  }
  return values
}

/**
 * 名言投稿の Server Action（useActionState 用のシグネチャ）
 *
 * JS 読み込み前でも <form action> として動作する（Progressive Enhancement）。
 */
export async function submitQuoteAction(
  _previousState: SubmitQuoteState,
  formData: FormData
): Promise<SubmitQuoteState> {
  const values = pickValues(formData)

  // ハニーポットが埋まっていたらボットとみなし、成功を装って破棄する
  if (formData.get(HONEYPOT_FIELD)) {
    return { status: "success", message: "投稿を受け付けました。" }
  }

  const parsed = QuoteSubmissionSchema.safeParse(values)
  if (!parsed.success) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  try {
    const fingerprint = await getSubmitterFingerprint()
    const submission = await createSubmissionWithinQuota(parsed.data, fingerprint, {
      windowStart: new Date(Date.now() - RATE_LIMIT_WINDOW_MS),
      maxSubmissions: RATE_LIMIT_MAX_SUBMISSIONS,
    })

    if (!submission) {
      return {
        status: "error",
        message: "短時間に投稿が集中しています。しばらく時間をおいてから再度お試しください。",
        fieldErrors: {},
        values,
      }
    }

    return {
      status: "success",
      message: "投稿ありがとうございます！ 内容を確認のうえ、掲載させていただきます。",
    }
  } catch (error) {
    console.error("submitQuoteAction failed:", error)
    return {
      status: "error",
      message: "投稿に失敗しました。時間をおいて再度お試しください。",
      fieldErrors: {},
      values,
    }
  }
}
