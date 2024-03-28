const ThreadCommentRepository = require('../../../Domains/threads/ThreadCommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const credId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    /** creating dependency of use case */
    const mockCommentRepository = new ThreadCommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(credId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, credId);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(commentId);
  });
});
