/**
 * Firebase errors ko user-facing message me map karta hai.
 * Raw SDK errors (jaise "403 Forbidden") end-user ke liye useless hote hain.
 */
export function friendlyFirebaseError(error: unknown): string {
  const code =
    (error as { code?: string } | null)?.code ?? (error as { message?: string } | null)?.message ?? ''

  if (/permission-denied|\/databases\/.*:403|403 Forbidden|insufficient permissions/i.test(code)) {
    return 'Access denied. Firebase Security Rules ise allow nahi kar rahi (admin role check karo).'
  }
  if (/unavailable|deadline-exceeded|network-request-failed|failed to fetch|network/i.test(code)) {
    return 'Network issue. Internet connection check karke dobara try karo.'
  }
  if (/not-found|404/i.test(code)) {
    return 'Data nahi mila.'
  }
  if (/firestore.googleapis.com has not been used|API has not been used|403 Forbidden/i.test(code)) {
    return 'Cloud Firestore API project me disabled hai. Firebase Console se Enable karna hoga.'
  }
  if (/requires an index|failed-precondition/i.test(code)) {
    return 'Ye query ke liye Firestore index chahiye. Index deploy karna hoga (firebase deploy --only firestore:indexes).'
  }
  if (/storage-bucket|storage\/.*:404|404 Not Found.*storage/i.test(code)) {
    return 'Cloud Storage enabled nahi hai ya bucket galat hai.'
  }
  if (/storage|403 Forbidden/i.test(code)) {
    return 'Storage permission denied. Admin role check karo.'
  }

  return error instanceof Error ? error.message : 'Kuch gadbad ho gayi. Dobara try karo.'
}