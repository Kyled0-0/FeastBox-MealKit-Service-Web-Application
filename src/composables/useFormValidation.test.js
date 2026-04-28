import { describe, it, expect } from 'vitest'
import { useFormValidation } from './useFormValidation'
import { required, email, digits, accepted } from './validators'

describe('useFormValidation', () => {
  it('errors are null initially', () => {
    const { errors } = useFormValidation({ name: [required()] })
    expect(errors.value.name).toBeUndefined()
  })

  it('validate sets error when required field is empty', () => {
    const { errors, validate } = useFormValidation({ name: [required()] })
    validate('name', { name: '' })
    expect(errors.value.name).toBeTruthy()
  })

  it('validate clears error when field becomes valid', () => {
    const { errors, validate } = useFormValidation({ name: [required()] })
    validate('name', { name: '' })
    validate('name', { name: 'Alice' })
    expect(errors.value.name).toBeNull()
  })

  it('isValid is false when errors exist', () => {
    const { validate, isValid } = useFormValidation({ name: [required()] })
    validate('name', { name: '' })
    expect(isValid.value).toBe(false)
  })

  it('isValid is true when all fields valid', () => {
    const { validate, isValid } = useFormValidation({ name: [required()] })
    validate('name', { name: 'Alice' })
    expect(isValid.value).toBe(true)
  })

  it('validateAll checks all fields', () => {
    const { errors, validateAll } = useFormValidation({
      name: [required()],
      email: [required(), email()]
    })
    validateAll({ name: '', email: 'bad' })
    expect(errors.value.name).toBeTruthy()
    expect(errors.value.email).toBeTruthy()
  })

  it('digits validator rejects non-digit strings', () => {
    const { errors, validate } = useFormValidation({ phone: [digits(10)] })
    validate('phone', { phone: '123456789a' })
    expect(errors.value.phone).toBeTruthy()
  })

  it('accepted validator rejects false', () => {
    const { errors, validate } = useFormValidation({ terms: [accepted()] })
    validate('terms', { terms: false })
    expect(errors.value.terms).toBeTruthy()
  })

  it('stops at the first failing validator and does not overwrite with later errors', () => {
    const { errors, validate } = useFormValidation({ email: [required(), email()] })
    validate('email', { email: '' })
    expect(errors.value.email).toBe("This field can't be blank")
  })
})
