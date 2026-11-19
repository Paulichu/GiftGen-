import { SlidingWindowLimiter } from "./ratelimit";

/** Shared so tests can reset the budget instead of depending on wall-clock windows. */
export const approveLimiter = new SlidingWindowLimiter(20, 60 * 60_000);

/**
 * Sending spends two separate budgets so a few typos in the approval password
 * cannot lock the seller out of sending for an hour: wrong passwords draw from
 * a short ten-minute budget, while real sends draw from the hourly one.
 */
export const sendPasswordLimiter = new SlidingWindowLimiter(5, 10 * 60_000);
export const sendLimiter = new SlidingWindowLimiter(5, 60 * 60_000);
