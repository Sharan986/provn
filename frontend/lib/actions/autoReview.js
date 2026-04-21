'use server';

export async function autoReviewSubmission(submissionId) {
  // Handled by backend asynchronously upon submission creation.
  return { error: 'Auto-review is handled automatically by the backend.' };
}

export async function autoReviewPendingSubmissions(limit = 10) {
  // Handled by backend periodically or asynchronously.
  return { processed: 0, results: [] };
}

export async function triggerAutoReview(submissionId) {
  // Handled by backend asynchronously upon submission creation.
  return { queued: false, reason: 'Auto-review is automatically triggered by backend' };
}
