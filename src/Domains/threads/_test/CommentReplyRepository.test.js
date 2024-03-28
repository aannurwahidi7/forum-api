const CommentReplyRepository = require('../CommentReplyRepository');

describe('CommentReplyRepository', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const commentReplyRepository = new CommentReplyRepository();

    // Action & Assert
    expect(commentReplyRepository.addReply({})).rejects.toThrowError('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(commentReplyRepository.getReplyById('')).rejects.toThrowError('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(commentReplyRepository.deleteReplyById('')).rejects.toThrowError('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(commentReplyRepository.verifyReply('', '')).rejects.toThrowError('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(commentReplyRepository.getReplyByThreadId('', '')).rejects.toThrowError('COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
