/* eslint-disable max-len */
const CommentLikesRepository = require('../CommentLikesRepository');

describe('commentLikesRepository', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const commentLikesRepository = new CommentLikesRepository();

    // Action & Assert
    expect(commentLikesRepository.addLike({})).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(commentLikesRepository.getLikeCountByCommentId('')).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(commentLikesRepository.deleteLikeByUserIdCommentId('', '')).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(commentLikesRepository.verifyLike('', '')).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
