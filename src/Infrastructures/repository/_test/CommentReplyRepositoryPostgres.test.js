/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');

const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

const AddedComment = require('../../../Domains/threads/entities/AddedComment');
const NewComment = require('../../../Domains/threads/entities/NewComment');

const CommentReplyRepositoryPostgres = require('../CommentReplyRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const CommentReplyTableTestHelper = require('../../../../tests/CommentReplyTableTestHelper');

describe('ThreadCommentRepositoryPostgres', () => {
  let userId;
  let threadId;
  let commentId;
  beforeAll(async () => {
    userId = await UsersTableTestHelper.addUser({});
    threadId = await ThreadsTableTestHelper.addThread({
      owner: userId,
    });
    commentId = await ThreadCommentsTableTestHelper.addComment({
      owner: userId,
      thread_id: threadId,
    });
  });

  afterEach(async () => {
    await CommentReplyTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      const newReply = new NewComment({
        content: 'sebuah balasan',
      }, 'NEW_REPLY');
      const fakeIdGenerator = () => '123'; // stub!
      const commentReplyRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentReplyRepositoryPostgres.addReply(newReply, userId, threadId, commentId);

      // Assert
      const reply = await CommentReplyTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
    });

    it('should return addded reply correctly', async () => {
      // Arrange
      const newReply = new NewComment({
        content: 'sebuah balasan',
      }, 'NEW_REPLY');
      const fakeIdGenerator = () => '123'; // stub!
      const commentReplyRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await commentReplyRepositoryPostgres.addReply(newReply, userId, threadId, commentId);

      // Assert
      expect(addedReply).toStrictEqual(new AddedComment({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      }, 'ADDED_REPLY'));
    });
  });

  describe('getReplyById', () => {
    it('should throw InvariantError when Reply not found', () => {
      // Arrange
      const commentReplyRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentReplyRepositoryPostgres.getReplyById('reply-123'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return id, content, date, owner, is_delete when reply is found', async () => {
      // Arrange
      const expectedPayload = {
        id: 'reply-123',
        content: 'sebuah balasan',
        date: '2021-08-08T08:20:19.775Z',
        owner: userId,
        is_delete: false,
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentReplytRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, fakeIdGenerator);
      await CommentReplyTableTestHelper.addReply({
        owner: userId,
        thread_id: threadId,
        comment_id: commentId,
      });

      // Action & Assert
      const data = await commentReplytRepositoryPostgres.getReplyById(expectedPayload.id);
      expect(data).toEqual(expectedPayload);
    });
  });

  describe('deleteReplyById', () => {
    it('should throw InvariantError when reply not found', () => {
      // Arrange
      const commentReplyRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentReplyRepositoryPostgres.deleteReplyById('reply-123'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should soft delete reply when deleted', async () => {
      // Arrange
      const expectedPayload = {
        id: 'reply-123',
        content: 'sebuah balasam',
        date: '2021-08-08T08:20:19.775Z',
        owner: userId,
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentReplyRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, fakeIdGenerator);
      await CommentReplyTableTestHelper.addReply({
        owner: userId,
        thread_id: threadId,
        comment_id: commentId,
      });

      // Action & Assert
      await commentReplyRepositoryPostgres.deleteReplyById(expectedPayload.id);
      const reply = await commentReplyRepositoryPostgres.getReplyById(expectedPayload.id);

      expect(reply.is_delete).toEqual(true);
    });
  });
  describe('verifyReply', () => {
    it('should throw NotFoundError when reply not found', () => {
      // Arrange
      const commentReplyRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentReplyRepositoryPostgres.verifyReply('reply-123', 'user-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when other user try to accessing to it', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentReplyRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, fakeIdGenerator);
      await CommentReplyTableTestHelper.addReply({
        owner: userId,
        thread_id: threadId,
        comment_id: commentId,
      });

      // Action & Assert
      return expect(commentReplyRepositoryPostgres.verifyReply('reply-123', 'user-321'))
        .rejects
        .toThrowError(AuthorizationError);
    });
    it('should not NotFoundError and AuthorizationError when reply found and its owner', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentReplyRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, fakeIdGenerator);
      await CommentReplyTableTestHelper.addReply({
        owner: userId,
        thread_id: threadId,
        comment_id: commentId,
      });

      // Action & Assert
      expect(commentReplyRepositoryPostgres.verifyReply('reply-123', userId))
        .resolves.not
        .toThrowError(NotFoundError);
      return expect(commentReplyRepositoryPostgres.verifyReply('reply-123', userId))
        .resolves.not
        .toThrowError(AuthorizationError);
    });
  });

  describe('getReplyByThreadId', () => {
    it('should return list id, username, date, content when replies are found', async () => {
      // Arrange
      const { username: userN } = await UsersTableTestHelper.findUsernameById(userId);
      const expectedPayload = {
        id: 'reply-123',
        username: userN,
        date: '2021-08-08T08:20:19.775Z',
        content: 'sebuah balasan',
        is_delete: false,
        comment_id: commentId,
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentReplyRepositoryPostgres = new CommentReplyRepositoryPostgres(pool, fakeIdGenerator);
      await CommentReplyTableTestHelper.addReply({
        owner: userId,
        thread_id: threadId,
        comment_id: commentId,
      });

      // Action & Assert
      const data = await commentReplyRepositoryPostgres.getReplyByThreadId(threadId);
      expect(data[0]).toEqual(expectedPayload);
    });
  });
});
