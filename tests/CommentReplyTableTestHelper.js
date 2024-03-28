/* eslint-disable camelcase */
/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentReplyTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'sebuah balasan', date = '2021-08-08T08:20:19.775Z', is_delete = false, owner, thread_id, comment_id,
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5, $6, $7)',
      values: [id, content, date, is_delete, owner, thread_id, comment_id],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = CommentReplyTableTestHelper;
