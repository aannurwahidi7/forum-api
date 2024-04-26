const ThreadCommentRepository = require('../../../Domains/threads/ThreadCommentRepository');
const CommentLikeRepository = require('../../../Domains/threads/CommentLikesRepository');
const AddLikeUseCase = require('../AddLikeUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddLikeUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add like action correctly when user did not like', async () => {
    // Arrange
    const credId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new ThreadCommentRepository();
    const mockLikeRepository = new CommentLikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLike = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getLikeUseCase = new AddLikeUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockCommentRepository,
      commentLikeRepository: mockLikeRepository,
    });

    // Action
    await getLikeUseCase.execute(credId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId);
    expect(mockLikeRepository.verifyLike).toBeCalledWith(credId, commentId);
    expect(mockLikeRepository.addLike).toBeCalledWith(credId, commentId);
  });

  it('should orchestrating the add like action correctly when user did like', async () => {
    // Arrange
    const credId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new ThreadCommentRepository();
    const mockLikeRepository = new CommentLikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLike = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLikeByUserIdCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getLikeUseCase = new AddLikeUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockCommentRepository,
      commentLikeRepository: mockLikeRepository,
    });

    // Action
    await getLikeUseCase.execute(credId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId);
    expect(mockLikeRepository.verifyLike).toBeCalledWith(credId, commentId);
    expect(mockLikeRepository.deleteLikeByUserIdCommentId).toBeCalledWith(credId, commentId);
  });
});
