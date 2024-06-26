/* eslint-disable class-methods-use-this */
class AddedComment {
  constructor(payload, name) {
    this._verifyPayload(payload, name);

    const { id, content, owner } = payload;

    this.id = id;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ id, content, owner }, name) {
    if (!id || !content || !owner) {
      throw new Error(`${name}.NOT_CONTAIN_NEEDED_PROPERTY`);
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error(`${name}.NOT_MEET_DATA_TYPE_SPECIFICATION`);
    }
  }
}

module.exports = AddedComment;
