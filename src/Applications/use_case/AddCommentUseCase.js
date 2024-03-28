const NewComment = require('../../Domains/threads/entities/NewComment');

class AddCommentUseCase {
  constructor({ threadCommentRepository, threadRepository }) {
    this._threadCommentRepository = threadCommentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, credentialId) {
    await this._threadRepository.verifyThreadById(threadId);
    const newComment = new NewComment(useCasePayload, 'NEW_COMMENT');
    return this._threadCommentRepository.addComment(newComment, threadId, credentialId);
  }
}

module.exports = AddCommentUseCase;
