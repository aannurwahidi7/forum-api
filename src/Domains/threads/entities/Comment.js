/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
class Comment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.content = (payload.is_delete) ? '**Komentar telah dihapus**' : payload.content;
    this.replies = payload.replies;
  }

  _verifyPayload(payload) {
    const {
      id, username, date, content, replies, is_delete,
    } = payload;

    if (!id || !username || !date || !content || !replies || is_delete === undefined) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string'
    || typeof date !== 'string' || typeof content !== 'string' || typeof replies !== 'object'
    || typeof is_delete !== 'boolean') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
