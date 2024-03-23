/* eslint-disable camelcase */
/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadCommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'sebuah komentar', date = '2021-08-08T07:19:09.775Z', is_delete = false, owner, thread_id,
  }) {
    const query = {
      text: 'INSERT INTO thread_comments VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, is_delete, owner, thread_id],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1');
  },
};

module.exports = ThreadCommentsTableTestHelper;
