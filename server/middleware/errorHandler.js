export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500
  const isProd = process.env.NODE_ENV === 'production'
  res.status(status).json({
    error: status < 500 ? err.message : 'Internal server error',
    ...(status < 500 && err.details && { details: err.details }),
    ...(!isProd && status >= 500 && { stack: err.stack })
  })
}
