const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const CommentLikeTableTestHelper = require('../../../../tests/CommentLikeTableTestHelper');

const CommentDatabaseInit = async () => {
  const accessToken = await ServerTestHelper.getAccessToken();
  const requestPayload = {
    title: 'Sebuah title',
    body: 'Sebuah body',
  };
  const server = await createServer(container);

  // Action
  const responseThread = await server.inject({
    method: 'POST',
    url: '/threads',
    payload: requestPayload,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  const responseThreadJson = JSON.parse(responseThread.payload);
  const { id: threadId } = responseThreadJson.data.addedThread;

  const commentPayload = {
    content: 'sebuah komentar',
  };

  const response = await server.inject({
    method: 'POST',
    url: `/threads/${threadId}/comments`,
    payload: commentPayload,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  const responseJson = JSON.parse(response.payload);
  const commentId = responseJson.data.addedComment.id;

  return [accessToken, threadId, commentId];
};

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  let threadId;
  let commentId;
  let accessToken;
  beforeAll(async () => {
    [accessToken, threadId, commentId] = await CommentDatabaseInit();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikeTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and persisted comment like', async () => {
      // Arrange
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when user not authenticated', async () => {
      // Arrange
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread id not found', async () => {
      // Arrange
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread11/comments/${commentId}/likes`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment id not found', async () => {
      // Arrange
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/comment123/likes`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });
  });
});
