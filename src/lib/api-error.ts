import axios from 'axios'

export type ApiFieldError = {
  field: string
  message: string
}

export type ApiResponseError = {
  success?: boolean
  message?: string
  errors?: ApiFieldError[] | { stack?: string } | null
}

export type NormalizedFormError = {
  message: string | null
  fieldErrors: Record<string, string>
}

export function normalizeApiError(
  error: unknown,
  fallbackMessage: string,
  overrideMessage?: string,
): NormalizedFormError {
  if (!axios.isAxiosError(error)) {
    return {
      message: overrideMessage ?? fallbackMessage,
      fieldErrors: {},
    }
  }

  const responseData = error.response?.data as ApiResponseError | undefined
  const fieldErrors: Record<string, string> = {}

  if (Array.isArray(responseData?.errors)) {
    for (const detail of responseData.errors) {
      if (detail && 'field' in detail && 'message' in detail && detail.field) {
        fieldErrors[detail.field] = detail.message
      }
    }
  }

  return {
    message:
      overrideMessage ??
      responseData?.message ??
      error.response?.statusText ??
      fallbackMessage,
    fieldErrors,
  }
}
