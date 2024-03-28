const NewComment = require('../../Domains/threads/entities/NewComment');

class AddReplyUseCase {
  constructor({ threadRepository, threadCommentRepository, commentReplyRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
    this._commentReplyRepository = commentReplyRepository;
  }

  async execute(useCasePayload, credentialId, threadId, commentId) {
    await this._threadRepository.verifyThreadById(threadId);
    await this._threadCommentRepository.verifyComment(commentId);
    const newComment = new NewComment(useCasePayload, 'NEW_REPLY');
    return this._commentReplyRepository.addReply(newComment, credentialId, threadId, commentId);
  }
}

module.exports = AddReplyUseCase;
