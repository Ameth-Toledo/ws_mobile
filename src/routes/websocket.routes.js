const { WebSocketServer } = require('ws')
const MessageUseCase = require('../use-cases/MessageUseCase')
const WebSocketController = require('../controllers/WebSocketController')
const MessageRepository = require('../repositories/MessageRepository')
const UserRepository = require('../repositories/UserRepository')

function setupWebSocketRoutes(server) {
  const wss = new WebSocketServer({ server, path: '/chat' })

  const messageRepository = new MessageRepository()
  const userRepository = new UserRepository()
  const messageUseCase = new MessageUseCase(messageRepository, userRepository)
  const wsController = new WebSocketController(messageUseCase)

  wss.on('connection', (ws, req) => {
    wsController.handleConnection(ws, req)
  })

  console.log('WebSocket activo en ws://localhost:3000/chat')
}

module.exports = setupWebSocketRoutes