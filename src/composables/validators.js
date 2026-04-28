export const required = (msg = "This field can't be blank") =>
  (v) => (v == null || String(v).trim() === '') ? msg : null

export const email = (msg = 'Please enter a valid email') =>
  (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()) ? null : msg

export const digits = (n, msg) => {
  const re = new RegExp(`^\\d{${n}}$`)
  return (v) => re.test(v) ? null : (msg ?? `Must be exactly ${n} digits`)
}

export const minLength = (n, msg) =>
  (v) => String(v).trim().length >= n ? null : (msg ?? `Must be at least ${n} characters`)

export const pattern = (regex, msg = 'Invalid format') =>
  (v) => regex.test(v) ? null : msg

export const oneOf = (values, msg = 'Please select a valid option') =>
  (v) => values.includes(v) ? null : msg

export const accepted = (msg = 'Must be accepted to proceed') =>
  (v) => v === true ? null : msg

export const notZero = (msg = 'Please select a topic') =>
  (v) => v !== '0' && v !== 0 ? null : msg
