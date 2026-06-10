const { pool } = require('../database/connection')

class UserRepository {
  async save(user) {
    const { id, username, connectedAt } = user
    await pool.execute(
      `INSERT INTO users (id, username, connected_at, is_active)
       VALUES (?, ?, ?, 1)`,
      [id, username, new Date(connectedAt)]
    )
  }

  async disconnect(userId) {
    await pool.execute(
      `UPDATE users SET disconnected_at = NOW(), is_active = 0 WHERE id = ?`,
      [userId]
    )
  }

  async findActive() {
    const [rows] = await pool.execute(
      `SELECT id, username, connected_at FROM users WHERE is_active = 1`
    )
    return rows
  }
}

module.exports = UserRepository