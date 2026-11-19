import { SlidingWindowLimiter } from "./ratelimit";

/** Shared so tests can reset the budget instead of depending on wall-clock windows. */
export const approveLimiter = new SlidingWindowLimiter(20, 60 * 60_000);
export const sendLimiter = new SlidingWindowLimiter(5, 60 * 60_000);
