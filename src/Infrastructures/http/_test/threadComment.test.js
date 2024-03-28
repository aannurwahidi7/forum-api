const Jwt = require('@hapi/jwt');

const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  let accessToken;
  beforeAll(async () => {
    accessToken = await ServerTestHelper.getAccessToken();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted thread comment', async () => {
      // Arrange
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

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(commentPayload.content);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
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

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {},
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
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
        content: [123],
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });
  });

  it('should response 401 when user not authenticated', async () => {
    // Arrange
    const requestPayload = {
      content: 'sebuah komentar',
    };
    const server = await createServer(container);

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(401);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toBeDefined();
    expect(responseJson.message).toEqual('Missing authentication');
  });
  it('should response 404 when thread not found', async () => {
    // Arrange
    const commentPayload = {
      content: 'sebuah komentar',
    };
    const server = await createServer(container);

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread11/comments',
      payload: commentPayload,
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

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and content of the comment should change', async () => {
      // Arrange
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
      const { id: commentId } = responseJson.data.addedComment;

      const responseDelete = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseDeleteJson = JSON.parse(responseDelete.payload);
      const newComment = await ThreadCommentsTableTestHelper.findCommentById(commentId);

      expect(responseDelete.statusCode).toEqual(200);
      expect(responseDeleteJson.status).toEqual('success');
      expect(newComment[0].is_delete).toEqual(true);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange and Action
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-345/comments/comment-123',
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

    it('should response 404 when comment not found', async () => {
      // Arrange
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

      const responseDelete = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-453`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseDeleteJson = JSON.parse(responseDelete.payload);
      expect(responseDelete.statusCode).toEqual(404);
      expect(responseDeleteJson.status).toEqual('fail');
      expect(responseDeleteJson.message).toBeDefined();
      expect(responseDeleteJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 403 when other user try to accessing to it', async () => {
      // Arrange
      const payloadUser = {
        id: 'user-321',
        username: 'user',
        password: 'secret',
        fullname: 'Tester User',
      };
      await UsersTableTestHelper.addUser(payloadUser);
      const token = Jwt.token.generate(payloadUser, process.env.ACCESS_TOKEN_KEY);

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
      const { id: commentId } = responseJson.data.addedComment;

      const responseDelete = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseDeleteJson = JSON.parse(responseDelete.payload);

      expect(responseDelete.statusCode).toEqual(403);
      expect(responseDeleteJson.status).toEqual('fail');
      expect(responseDeleteJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });
  });
});
