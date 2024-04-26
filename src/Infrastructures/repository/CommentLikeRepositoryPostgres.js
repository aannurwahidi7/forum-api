const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentLikeRepository = require('../../Domains/threads/CommentLikesRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(owner, commentId) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES ($1, $2, $3)',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) as like_count FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async deleteLikeByUserIdCommentId(owner, commentId) {
    const query = {
      text: 'DELETE FROM likes WHERE owner = $1 AND comment_id = $2 RETURNING id',
      values: [owner, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('like tidak ditemukan');
    }
  }
}

module.exports = CommentLikeRepositoryPostgres;
