/* eslint-disable class-methods-use-this */
class NewComment {
  constructor(payload, name) {
    this._verifyPayload(payload, name);

    const { content } = payload;

    this.content = content;
  }

  _verifyPayload({ content }, name) {
    if (!content) {
      throw new Error(`${name}.NOT_CONTAIN_NEEDED_PROPERTY`);
    }

    if (typeof content !== 'string') {
      throw new Error(`${name}.NOT_MEET_DATA_TYPE_SPECIFICATION`);
    }
  }
}

module.exports = NewComment;
