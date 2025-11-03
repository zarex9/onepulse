export const validateRecipient = (recipient: string): boolean => {
  const sanitized = recipient.trim()
  return sanitized !== "" && /^0x[a-fA-F0-9]{40}$/.test(sanitized)
}
