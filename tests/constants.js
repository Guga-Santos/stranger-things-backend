module.exports = {
  evalId: process.env.EVAL_CONTAINER_NAME || `trybe-stranger-things-backend-${Date.now()}`,
  containerWorkDir: '/usr/local/',
  defaultDelay: 10000
}
