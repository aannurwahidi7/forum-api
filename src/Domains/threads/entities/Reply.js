/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
class Reply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.content = (payload.is_delete) ? '**Balasan telah dihapus**' : payload.content;
  }

  _verifyPayload(payload) {
    const {
      id, username, date, content, is_delete,
    } = payload;

    if (!id || !username || !date || !content || is_delete === undefined) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string'
    || typeof date !== 'string' || typeof content !== 'string'
    || typeof is_delete !== 'boolean') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
