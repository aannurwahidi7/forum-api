class AddLikeUseCase {
  constructor({ threadRepository, threadCommentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(credId, threadId, commentId) {
    await this._threadRepository.verifyThreadById(threadId);
    await this._threadCommentRepository.verifyComment(commentId);
    if (await this._commentLikeRepository.verifyLike(credId, commentId)) {
      return this._commentLikeRepository.deleteLikeByUserIdCommentId(credId, commentId);
    }
    return this._commentLikeRepository.addLike(credId, commentId);
  }
}

module.exports = AddLikeUseCase;
