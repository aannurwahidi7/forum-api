const AddReplyUseCase = require('../AddReplyUseCase');
const NewComment = require('../../../Domains/threads/entities/NewComment');
const AddedComment = require('../../../Domains/threads/entities/AddedComment');
const ThreadCommentRepository = require('../../../Domains/threads/ThreadCommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentReplyRepository = require('../../../Domains/threads/CommentReplyRepository');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'dicoding',
    };

    const credId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockAddedReply = new AddedComment({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: credId,
    }, 'ADDED_REPLY');

    /** creating dependency of use case */
    const mockCommentRepository = new ThreadCommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentReplyRepository = new CommentReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: credId,
      }, 'ADDED_REPLY')));

    /** creating use case instance */
    const getReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockCommentRepository,
      commentReplyRepository: mockCommentReplyRepository,
    });

    // Action
    const addedComment = await getReplyUseCase.execute(useCasePayload, credId, threadId, commentId);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: credId,
    }, 'ADDED_REPLY'));

    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyComment).toBeCalledWith(commentId);
    expect(mockCommentReplyRepository.addReply).toBeCalledWith(new NewComment({
      content: useCasePayload.content,
    }, 'NEW_REPLY'), credId, threadId, commentId);
    expect(addedComment).toStrictEqual(mockAddedReply);
  });
});
