export function required(value, label) {
  if (value === null || value === undefined || String(value).trim() === '') {
    throw new Error(`${label} is required`)
  }
  return value
}

export function money(value, label = 'Amount') {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) throw new Error(`${label} must be a valid non-negative amount`)
  return Number(n.toFixed(2))
}

export function date(value, label = 'Date') {
  if (!value || Number.isNaN(new Date(value).getTime())) throw new Error(`${label} must be a valid date`)
  return value
}

export function cleanPayload(payload, fields = []) {
  return Object.fromEntries(fields.filter((key) => payload[key] !== undefined).map((key) => [key, payload[key]]))
}
