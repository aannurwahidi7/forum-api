const CommentLikesRepository = require('../../../Domains/threads/CommentLikesRepository');
const CommentReplyRepository = require('../../../Domains/threads/CommentReplyRepository');
const ThreadCommentRepository = require('../../../Domains/threads/ThreadCommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

const Comment = require('../../../Domains/threads/entities/Comment');
const Reply = require('../../../Domains/threads/entities/Reply');
const Thread = require('../../../Domains/threads/entities/Thread');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const mockReply = new Reply({
      id: 'reply-123',
      username: 'user',
      date: '2021-08-08T07:25:33.555Z',
      content: 'sebuah balasan',
      is_delete: false,
    });

    const mockComment = new Comment({
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:25:33.555Z',
      content: 'sebuah komentar',
      likeCount: 0,
      replies: [
        mockReply,
      ],
      is_delete: false,
    });

    const mockThread = new Thread({
      id: 'thread-123',
      title: 'sebuah judul',
      body: 'sebuah body',
      date: '2021-08-08T07:22:33.555Z',
      username: 'john doe',
      comments: [
        mockComment,
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new ThreadCommentRepository();
    const mockReplyRepository = new CommentReplyRepository();
    const mockCommentLikeRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.getLikeCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve({
        like_count: 0,
      }));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2021-08-08T07:25:33.555Z',
          content: 'sebuah komentar',
          is_delete: false,
        },
      ]));
    mockReplyRepository.getReplyByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          username: 'user',
          date: '2021-08-08T07:25:33.555Z',
          content: 'sebuah balasan',
          is_delete: false,
          comment_id: 'comment-123',
        },
      ]));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'sebuah judul',
        body: 'sebuah body',
        date: '2021-08-08T07:22:33.555Z',
        username: 'john doe',
      }));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockCommentRepository,
      commentReplyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockReplyRepository.getReplyByThreadId).toBeCalledWith(threadId);
    expect(mockCommentLikeRepository.getLikeCountByCommentId).toBeCalledTimes(1);
    expect(thread).toStrictEqual(mockThread);
  });
});
