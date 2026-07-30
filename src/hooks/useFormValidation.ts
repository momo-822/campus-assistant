import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
  custom?: (value: string) => string | null
}

export interface FieldRules {
  [field: string]: ValidationRule[]
}

export function useFormValidation(rules: FieldRules) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = useCallback(
    (field: string, value: string) => {
      const fieldRules = rules[field]
      if (!fieldRules) return ''

      for (const rule of fieldRules) {
        if (rule.required && !value.trim()) {
          const msg = rule.message || `${field}不能为空`
          setErrors((prev) => ({ ...prev, [field]: msg }))
          return msg
        }
        if (rule.minLength && value.length < rule.minLength) {
          const msg = rule.message || `${field}长度不能少于${rule.minLength}个字符`
          setErrors((prev) => ({ ...prev, [field]: msg }))
          return msg
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          const msg = rule.message || `${field}长度不能超过${rule.maxLength}个字符`
          setErrors((prev) => ({ ...prev, [field]: msg }))
          return msg
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          const msg = rule.message || `${field}格式不正确`
          setErrors((prev) => ({ ...prev, [field]: msg }))
          return msg
        }
        if (rule.custom) {
          const customMsg = rule.custom(value)
          if (customMsg) {
            setErrors((prev) => ({ ...prev, [field]: customMsg }))
            return customMsg
          }
        }
      }

      setErrors((prev) => ({ ...prev, [field]: '' }))
      return ''
    },
    [rules]
  )

  const validateAll = useCallback(
    (values: Record<string, string>) => {
      const newErrors: Record<string, string> = {}
      let isValid = true

      for (const field of Object.keys(rules)) {
        const value = values[field] || ''
        const fieldRules = rules[field]

        for (const rule of fieldRules) {
          if (rule.required && !value.trim()) {
            newErrors[field] = rule.message || `${field}不能为空`
            isValid = false
            break
          }
          if (rule.minLength && value.length < rule.minLength) {
            newErrors[field] = rule.message || `${field}长度不能少于${rule.minLength}个字符`
            isValid = false
            break
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            newErrors[field] = rule.message || `${field}长度不能超过${rule.maxLength}个字符`
            isValid = false
            break
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            newErrors[field] = rule.message || `${field}格式不正确`
            isValid = false
            break
          }
          if (rule.custom) {
            const customMsg = rule.custom(value)
            if (customMsg) {
              newErrors[field] = customMsg
              isValid = false
              break
            }
          }
        }
      }

      setErrors(newErrors)
      setTouched((prev) => {
        const allTouched = { ...prev }
        for (const field of Object.keys(rules)) {
          allTouched[field] = true
        }
        return allTouched
      })
      return isValid
    },
    [rules]
  )

  const handleBlur = useCallback(
    (field: string, value: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      validateField(field, value)
    },
    [validateField]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  return {
    errors,
    touched,
    validateField,
    validateAll,
    handleBlur,
    clearErrors,
  }
}