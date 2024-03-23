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

    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentById(id) {
    const query = {
      text: 'SELECT id, content, date, owner FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('id tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteCommentById(id) {
    const isDelete = true;
    const newComment = '**Komentar telah dihapus**';
    const query = {
      text: 'UPDATE thread_comments SET is_delete = $1, content = $2 WHERE id = $3 RETURNING id',
      values: [isDelete, newComment, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus komentar');
    }
  }

  async verifyComment(id, owner) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = ThreadCommentRepositoryPostgres;
