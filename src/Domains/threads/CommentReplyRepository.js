/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */

/* ABSTRACT CLASS */
class CommentReplyRepository {
  async addReply(addedThread, owner, threadId, commentId) {
    throw new Error('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getReplyById(id) {
    throw new Error('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteReplyById(id) {
    throw new Error('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyReply(id, owner) {
    throw new Error('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getReplyByThreadId(threadId) {
    throw new Error('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = CommentReplyRepository;
