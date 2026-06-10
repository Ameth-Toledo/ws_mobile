const Message = require('../models/Message')

class WebSocketController {
  constructor(messageUseCase) {
    this.messageUseCase = messageUseCase
  }

  async handleConnection(ws, req) {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const username = url.searchParams.get('username')?.trim()

    if (!username) {
      ws.send(JSON.stringify({ type: 'error', content: 'Se requiere ?username=' }))
      ws.close()
      return
    }

    await this.messageUseCase.registerClient(ws, username)
    console.log(`[+] Conectado: ${username}`)

    const history = await this.messageUseCase.getHistory()
    ws.send(JSON.stringify({ type: 'history', messages: history }))

    const joinMsg = Message.systemMessage(`${username} se unió al chat`)
    this.messageUseCase.broadcast(joinMsg)

    ws.on('message', (data) => this.handleMessage(ws, data))
    ws.on('close', () => this.handleDisconnect(ws))
    ws.on('error', (err) => console.error('[ERROR]', err.message))
  }

  async handleMessage(ws, data) {
    try {
      const message = await this.messageUseCase.buildMessage(ws, data)
      this.messageUseCase.broadcast(message)
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', content: err.message }))
    }
  }

  async handleDisconnect(ws) {
    const client = await this.messageUseCase.removeClient(ws)
    if (client) {
      console.log(`[-] Desconectado: ${client.username}`)
      const leaveMsg = Message.systemMessage(`${client.username} salió del chat`)
      this.messageUseCase.broadcast(leaveMsg)
    }
  }
}

module.exports = WebSocketController