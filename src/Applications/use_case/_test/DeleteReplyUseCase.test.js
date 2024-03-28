const CommentReplyRepository = require('../../../Domains/threads/CommentReplyRepository');
const ThreadCommentRepository = require('../../../Domains/threads/ThreadCommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const credId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';

    /** creating dependency of use case */
    const mockReplyRepository = new CommentReplyRepository();
    const mockCommentRepository = new ThreadCommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReply = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockCommentRepository,
      commentReplyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(credId, threadId, commentId, replyId);

    // Assert
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId);
    expect(mockReplyRepository.verifyReply).toBeCalledWith(replyId, credId);
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(replyId);
  });
});
