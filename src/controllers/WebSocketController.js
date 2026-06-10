const Message = require('../models/Message')

class WebSocketController {
  constructor(messageUseCase) {
    this.messageUseCase = messageUseCase
  }

  handleConnection(ws, req) {
    console.log('[+] Nueva conexión entrante')

    ws.on('message', (data) => this.handleMessage(ws, data))
    ws.on('close', () => this.handleDisconnect(ws))
    ws.on('error', (err) => console.error('[ERROR]', err.message))
  }

  async handleMessage(ws, data) {
    try {
      const parsed = JSON.parse(data)

      if (!parsed.username || !parsed.username.trim()) {
        ws.send(JSON.stringify({ type: 'error', content: 'El campo username es requerido' }))
        return
      }

      if (!parsed.content || !parsed.content.trim()) {
        ws.send(JSON.stringify({ type: 'error', content: 'El campo content es requerido' }))
        return
      }

      const isNew = !this.messageUseCase.isRegistered(ws)

      if (isNew) {
        await this.messageUseCase.registerClient(ws, parsed.username.trim())
        const history = await this.messageUseCase.getHistory()
        ws.send(JSON.stringify({ type: 'history', messages: history }))
        const joinMsg = Message.systemMessage(`${parsed.username.trim()} se unió al chat`)
        this.messageUseCase.broadcast(joinMsg)
        console.log(`[+] Registrado: ${parsed.username.trim()}`)
      }

      const message = await this.messageUseCase.buildMessage(ws, parsed.content.trim())
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