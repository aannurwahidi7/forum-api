const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadCommentRepository = require('../../Domains/threads/ThreadCommentRepository');
const AddedComment = require('../../Domains/threads/entities/AddedComment');

class ThreadCommentRepositoryPostgres extends ThreadCommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newThread, threadId, owner) {
    const { content } = newThread;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, isDelete, owner, threadId],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] }, 'ADDED_COMMENT');
  }

  async getCommentById(id) {
    const query = {
      text: 'SELECT id, content, date, owner, is_delete FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('id tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE thread_comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus komentar');
    }
  }

  async verifyComment(id) {
    const query = {
      text: 'SELECT 1 FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    const curOwner = result.rows[0].owner;

    if (curOwner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT
              tc.id,
              u.username,
              tc.date,
              tc.is_delete,
              tc.content
            FROM thread_comments tc
            INNER JOIN users u ON tc.owner = u.id
            WHERE tc.thread_id = $1
            GROUP BY tc.id, u.username ORDER BY tc.date`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = ThreadCommentRepositoryPostgres;
