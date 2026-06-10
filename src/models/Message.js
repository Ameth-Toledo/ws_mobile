const { v4: uuidv4 } = require('uuid')

class Message {
  constructor({ userId, username, content, type = 'message' }) {
    this.id = uuidv4()
    this.userId = userId
    this.username = username
    this.content = content
    this.type = type
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      content: this.content,
      type: this.type,
      timestamp: this.timestamp,
    }
  }

  static systemMessage(content) {
    return {
      id: uuidv4(),
      userId: 'system',
      username: 'system',
      content,
      type: 'system',
      timestamp: new Date().toISOString(),
    }
  }
}

module.exports = Message