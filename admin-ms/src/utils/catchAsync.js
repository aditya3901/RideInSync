/**
 * Wraps an async function and catches any errors, passing them to next()
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - The wrapped function
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
