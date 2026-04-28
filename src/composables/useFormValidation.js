// Contract: schema is a plain object mapping field names to arrays of validator functions.
// Each validator is (value, formData) => string | null (null = valid, string = error message).
import { ref, computed } from 'vue'

export function useFormValidation(schema) {
  const errors = ref({})

  function validate(field, formData = {}) {
    const validators = schema[field] ?? []
    const value = formData[field] ?? ''
    for (const fn of validators) {
      const msg = fn(value, formData)
      if (msg !== null) {
        errors.value[field] = msg
        return
      }
    }
    errors.value[field] = null
  }

  function validateAll(formData) {
    for (const field of Object.keys(schema)) {
      validate(field, formData)
    }
  }

  const isValid = computed(() =>
    Object.keys(schema).every(f => errors.value[f] == null)
  )

  return { errors, validate, validateAll, isValid }
}
