const { v4: uuidv4 } = require('uuid')
const Message = require('../models/Message')

class MessageUseCase {
  constructor(messageRepository, userRepository) {
    this.messageRepository = messageRepository
    this.userRepository = userRepository
    this.clients = new Map()
  }

  async registerClient(ws, username) {
    const user = { id: uuidv4(), username, connectedAt: new Date().toISOString() }
    this.clients.set(ws, user)
    await this.userRepository.save(user)
    return user
  }

  async removeClient(ws) {
    const client = this.clients.get(ws)
    if (client) {
      this.clients.delete(ws)
      await this.userRepository.disconnect(client.id)
    }
    return client
  }

  async buildMessage(ws, rawData) {
    const client = this.clients.get(ws)
    if (!client) throw new Error('Cliente no registrado')

    const parsed = JSON.parse(rawData)
    if (!parsed.content?.trim()) throw new Error('El contenido no puede estar vacío')

    const message = new Message({
      userId: client.id,
      username: client.username,
      content: parsed.content.trim(),
    })

    await this.messageRepository.save(message)
    return message
  }

  broadcast(message) {
    const payload = JSON.stringify(message.toJSON ? message.toJSON() : message)
    for (const [clientWs] of this.clients) {
      if (clientWs.readyState === 1) clientWs.send(payload)
    }
  }

  async getHistory() {
    return this.messageRepository.findAll(50)
  }
}

module.exports = MessageUseCase