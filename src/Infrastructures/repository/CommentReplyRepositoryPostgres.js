const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentReplyRepository = require('../../Domains/threads/CommentReplyRepository');
const AddedComment = require('../../Domains/threads/entities/AddedComment');

class CommentReplyRepositoryPostgres extends CommentReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply, owner, threadId, commentId) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, date, isDelete, owner, threadId, commentId],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] }, 'ADDED_REPLY');
  }

  async getReplyById(id) {
    const query = {
      text: 'SELECT id, content, date, owner, is_delete FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('id tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus balasan');
    }
  }

  async verifyReply(id, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async getReplyByThreadId(threadId) {
    const query = {
      text: `SELECT
              r.id,
              u.username,
              r.date,
              r.is_delete,
              r.content,
              r.comment_id
            FROM replies r
            INNER JOIN users u ON r.owner = u.id
            WHERE r.thread_id = $1
            GROUP BY r.id, u.username ORDER BY r.date`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = CommentReplyRepositoryPostgres;
