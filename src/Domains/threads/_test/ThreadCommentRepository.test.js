/* eslint-disable max-len */
const ThreadCommentRepository = require('../ThreadCommentRepository');

describe('ThreadRepository', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadCommentRepository = new ThreadCommentRepository();

    // Action & Assert
    expect(threadCommentRepository.addComment({})).rejects.toThrowError('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(threadCommentRepository.getCommentById('')).rejects.toThrowError('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(threadCommentRepository.deleteCommentById('')).rejects.toThrowError('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(threadCommentRepository.verifyComment('', '')).rejects.toThrowError('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
