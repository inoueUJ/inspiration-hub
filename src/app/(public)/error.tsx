"use client"

import { ErrorView } from "@/components/features/error/error-view"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorView error={error} reset={reset} />
}
