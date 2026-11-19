import { SlidingWindowLimiter } from "./ratelimit";

/** Shared so tests can reset the budget instead of depending on wall-clock windows. */
export const approveLimiter = new SlidingWindowLimiter(20, 60 * 60_000);

/**
 * Approving and sending spend two separate budgets so a few typos in the
 * approval password cannot lock the seller out of signing or sending for an
 * hour: wrong passwords draw from a short ten-minute budget, while real
 * approvals and real sends draw from their own hourly one.
 */
export const approvePasswordLimiter = new SlidingWindowLimiter(5, 10 * 60_000);
export const sendPasswordLimiter = new SlidingWindowLimiter(5, 10 * 60_000);
export const sendLimiter = new SlidingWindowLimiter(5, 60 * 60_000);
