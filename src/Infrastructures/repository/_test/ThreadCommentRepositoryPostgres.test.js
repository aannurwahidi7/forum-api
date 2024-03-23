/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');

const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AddedComment = require('../../../Domains/threads/entities/AddedComment');
const NewComment = require('../../../Domains/threads/entities/NewComment');

const ThreadCommentRepositoryPostgres = require('../ThreadCommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ThreadCommentRepositoryPostgres', () => {
  let userId;
  let threadId;
  beforeAll(async () => {
    userId = await UsersTableTestHelper.addUser({});
    threadId = await ThreadsTableTestHelper.addThread({
      owner: userId,
    });
  });

  afterEach(async () => {
    await ThreadCommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewComment({
        content: 'sebuah comment',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadCommentRepositoryPostgres.addComment(newThread, threadId, userId);

      // Assert
      const comment = await ThreadCommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return addded comment correctly', async () => {
      // Arrange
      const newThread = new NewComment({
        content: 'sebuah komentar',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await threadCommentRepositoryPostgres.addComment(newThread, threadId, userId);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
      }));
    });
  });

  describe('getCommentById', () => {
    it('should throw InvariantError when comment not found', () => {
      // Arrange
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadCommentRepositoryPostgres.getCommentById('comment-123'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return id, content, date, owner when thread is found', async () => {
      // Arrange
      const expectedPayload = {
        id: 'comment-123',
        content: 'sebuah komentar',
        date: '2021-08-08T07:19:09.775Z',
        owner: userId,
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);
      await ThreadCommentsTableTestHelper.addComment({
        owner: expectedPayload.owner,
        thread_id: threadId,
      });

      // Action & Assert
      const data = await threadCommentRepositoryPostgres.getCommentById(expectedPayload.id);
      expect(data).toEqual(expectedPayload);
    });
  });

  describe('deleteCommentById', () => {
    it('should throw InvariantError when comment not found', () => {
      // Arrange
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadCommentRepositoryPostgres.deleteCommentById('comment-123'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should soft delete comment when deleted', async () => {
      // Arrange
      const expectedPayload = {
        id: 'comment-123',
        content: 'sebuah komentar',
        date: '2021-08-08T07:19:09.775Z',
        owner: userId,
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);
      await ThreadCommentsTableTestHelper.addComment({
        owner: expectedPayload.owner,
        thread_id: threadId,
      });

      // Action & Assert
      await threadCommentRepositoryPostgres.deleteCommentById(expectedPayload.id);
      const comment = await threadCommentRepositoryPostgres.getCommentById(expectedPayload.id);

      expect(comment.content).toEqual('**Komentar telah dihapus**');
    });
  });
  describe('verifyComment', () => {
    it('should throw NotFoundError when comment not found', () => {
      // Arrange
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadCommentRepositoryPostgres.verifyComment('comment-123', 'user-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when other user try to accessing to it', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);
      await ThreadCommentsTableTestHelper.addComment({
        owner: userId,
        thread_id: threadId,
      });

      // Action & Assert
      return expect(threadCommentRepositoryPostgres.verifyComment('comment-123', 'user-321'))
        .rejects
        .toThrowError(AuthorizationError);
    });
  });
});