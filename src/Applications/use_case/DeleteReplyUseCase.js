class DeleteReplyUseCase {
  constructor({ threadRepository, threadCommentRepository, commentReplyRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
    this._commentReplyRepository = commentReplyRepository;
  }

  async execute(credId, threadId, commentId, replyId) {
    await this._threadRepository.verifyThreadById(threadId);
    await this._threadCommentRepository.verifyComment(commentId);
    await this._commentReplyRepository.verifyReply(replyId, credId);
    await this._commentReplyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
