class DeleteCommentUseCase {
  constructor({ threadRepository, threadCommentRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
  }

  async execute(credId, threadId, commentId) {
    await this._threadRepository.verifyThreadById(threadId);
    await this._threadCommentRepository.verifyCommentOwner(commentId, credId);
    await this._threadCommentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
