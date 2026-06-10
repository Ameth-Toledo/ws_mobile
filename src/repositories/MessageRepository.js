const { pool } = require('../database/connection')

class MessageRepository {
  async save(message) {
    const { id, userId, username, content, type, timestamp } = message
    await pool.execute(
      `INSERT INTO messages (id, user_id, username, content, type, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, username, content, type, new Date(timestamp)]
    )
  }

  async findAll(limit = 50) {
    const [rows] = await pool.execute(
        `SELECT * FROM messages ORDER BY created_at DESC LIMIT ${parseInt(limit)}`,
    )
    return rows.reverse()
  }
}

module.exports = MessageRepository