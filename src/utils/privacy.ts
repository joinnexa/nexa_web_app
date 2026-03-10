export const maskPhone = (phone?: string | null): string => {
  if (!phone) return '—'
  const clean = phone.trim()
  if (clean.length < 6) return clean
  return `${clean.slice(0, 3)}***${clean.slice(-3)}`
}

export const shortId = (id?: string | null): string => {
  if (!id) return '—'
  return id.length > 12 ? `${id.slice(0, 8)}...` : id
}
