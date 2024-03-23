/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */

/* INTERFACE */
class ThreadCommentRepository {
  async addComment(addedThread, threadId, owner) {
    throw new Error('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getCommentById(id) {
    throw new Error('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteCommentById(id) {
    throw new Error('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyComment(id, owner) {
    throw new Error('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ThreadCommentRepository;
