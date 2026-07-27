export function isQuotaError(error: any): boolean {
  const msg = typeof error === 'string' ? error : error?.message || '';
  return msg.includes('Quota limit exceeded') || msg.includes('Quota exceeded');
}
