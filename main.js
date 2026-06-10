const http = require('http')
const express = require('express')
const cors = require('cors')
const { testConnection } = require('./src/database/connection')
const setupWebSocketRoutes = require('./src/routes/websocket.routes')
require('dotenv').config()

const app = express()
const server = http.createServer(app)

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3000

testConnection()
  .then(() => {
    setupWebSocketRoutes(server)
    server.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('[DB] Error al conectar:', err.message)
    process.exit(1)
  })