const ThreadCommentRepository = require('../../../Domains/threads/ThreadCommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteAuthenticationUseCase', () => {
  it('should orchestrating the delete authentication action correctly', async () => {
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
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(credId, threadId, commentId);

    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId, credId);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(credId, threadId, commentId);
  });
});
