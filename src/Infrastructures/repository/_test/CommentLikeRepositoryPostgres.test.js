/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');

const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const CommentLikeTableTestHelper = require('../../../../tests/CommentLikeTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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
    await CommentLikeTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist new like', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentLikeRepositoryPostgres.addLike(userId, commentId);

      // Assert
      const likes = await CommentLikeTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('getLikeCountByCommentId', () => {
    it('should return like count when comment is found', async () => {
      // Arrange
      const expectedPayload = {
        like_count: '1',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);
      await CommentLikeTableTestHelper.addLike({
        owner: userId,
        comment_id: commentId,
      });

      // Action & Assert
      const data = await commentLikeRepositoryPostgres.getLikeCountByCommentId(commentId);
      expect(data).toEqual(expectedPayload);
    });
  });

  describe('deleteLikeByUserIdCommentId', () => {
    it('should throw NotFoundError when like not found', () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentLikeRepositoryPostgres.deleteLikeByUserIdCommentId('like-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should delete like when deleted', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);
      await CommentLikeTableTestHelper.addLike({
        owner: userId,
        comment_id: commentId,
      });

      // Action & Assert
      await commentLikeRepositoryPostgres.deleteLikeByUserIdCommentId(userId, commentId);
      const likes = await CommentLikeTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
  });
  describe('verifyLike', () => {
    it('should return false when like not found', async () => {
      // Arrange
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});

      // Action & Assert
      expect(await commentLikeRepositoryPostgres.verifyLike('user-123', 'comment-123')).toEqual(false);
    });

    it('should return true when like found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);
      await CommentLikeTableTestHelper.addLike({
        owner: userId,
        comment_id: commentId,
      });
      // Action & Assert
      expect(await commentLikeRepositoryPostgres.verifyLike('user-123', 'comment-123')).toEqual(true);
    });
  });
});
