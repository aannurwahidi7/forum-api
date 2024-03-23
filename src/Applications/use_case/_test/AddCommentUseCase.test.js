const NewComment = require('../../../Domains/threads/entities/NewComment');
const AddedComment = require('../../../Domains/threads/entities/AddedComment');
const ThreadCommentRepository = require('../../../Domains/threads/ThreadCommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'dicoding',
    };

    const credId = 'user-123';
    const threadId = 'thread-123';

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: credId,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new ThreadCommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: credId,
      })));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      threadCommentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePayload, threadId, credId);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: credId,
    }));

    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(new NewComment({
      content: useCasePayload.content,
    }), threadId, credId);
    expect(addedComment).toStrictEqual(mockAddedComment);
  });
});
