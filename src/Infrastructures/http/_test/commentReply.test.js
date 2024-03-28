const Jwt = require('@hapi/jwt');

const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const CommentReplyTableTestHelper = require('../../../../tests/CommentReplyTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
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

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted comment reply', async () => {
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
      const { id } = responseThreadJson.data.addedThread;

      const commentPayload = {
        content: 'sebuah komentar',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const replyPayload = {
        content: 'sebuah balasan 1',
      };

      const responseJson = JSON.parse(response.payload);
      const commentId = responseJson.data.addedComment.id;

      const responseReply = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments/${commentId}/replies`,
        payload: replyPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseReplyJson = JSON.parse(responseReply.payload);
      expect(responseReply.statusCode).toEqual(201);
      expect(responseReplyJson.status).toEqual('success');
      expect(responseReplyJson.data.addedReply).toBeDefined();
      expect(responseReplyJson.data.addedReply.content).toEqual(replyPayload.content);
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
      const { id } = responseThreadJson.data.addedThread;

      const commentPayload = {
        content: 'sebuah komentar',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      const commentId = responseJson.data.addedComment.id;

      const responseReply = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments/${commentId}/replies`,
        payload: {},
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseReplyJson = JSON.parse(responseReply.payload);
      expect(responseReply.statusCode).toEqual(400);
      expect(responseReplyJson.status).toEqual('fail');
      expect(responseReplyJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
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
      const { id } = responseThreadJson.data.addedThread;

      const commentPayload = {
        content: 'sebuah komentar',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      const commentId = responseJson.data.addedComment.id;

      const replyPayload = {
        content: 123,
      };

      const responseReply = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments/${commentId}/replies`,
        payload: replyPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseReplyJson = JSON.parse(responseReply.payload);
      expect(responseReply.statusCode).toEqual(400);
      expect(responseReplyJson.status).toEqual('fail');
      expect(responseReplyJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
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
      url: '/threads/thread-123/comments/comment-123/replies',
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
    const commentPayload = {
      content: 'sebuah komentar',
    };
    const server = await createServer(container);

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread11/comments/comment-123/replies',
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
    const { id } = responseThreadJson.data.addedThread;

    const commentPayload = {
      content: 'sebuah komentar',
    };

    const response = await server.inject({
      method: 'POST',
      url: `/threads/${id}/comments/comment-123/replies`,
      payload: commentPayload,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('komentar tidak ditemukan');
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 200 and is_delete become true and content not change', async () => {
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
      const { id } = responseThreadJson.data.addedThread;

      const commentPayload = {
        content: 'sebuah komentar',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      const { id: commentId } = responseJson.data.addedComment;

      const replyPayload = {
        content: 'sebuah balasan',
      };

      const responseReply = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments/${commentId}/replies`,
        payload: replyPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseReplyJson = JSON.parse(responseReply.payload);
      const { id: replyId } = responseReplyJson.data.addedReply;

      const responseReplyDelete = await server.inject({
        method: 'DELETE',
        url: `/threads/${id}/comments/${commentId}/replies/${replyId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseReplyDeleteJson = JSON.parse(responseReplyDelete.payload);
      const newReply = await CommentReplyTableTestHelper.findReplyById(replyId);

      expect(responseReplyDelete.statusCode).toEqual(200);
      expect(responseReplyDeleteJson.status).toEqual('success');
      expect(newReply[0].is_delete).toEqual(true);
      expect(newReply[0].content).toEqual(replyPayload.content);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange and Action
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-345/comments/comment-123/replies/reply-123',
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
      const { id } = responseThreadJson.data.addedThread;

      const responseDelete = await server.inject({
        method: 'DELETE',
        url: `/threads/${id}/comments/comment-453/replies/reply-123`,
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

    it('should response 404 when reply not found', async () => {
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
      const { id } = responseThreadJson.data.addedThread;

      const commentPayload = {
        content: 'sebuah komentar',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      const { id: commentId } = responseJson.data.addedComment;

      const responseReplyDelete = await server.inject({
        method: 'DELETE',
        url: `/threads/${id}/comments/${commentId}/replies/reply-123`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseReplyDeleteJson = JSON.parse(responseReplyDelete.payload);

      expect(responseReplyDelete.statusCode).toEqual(404);
      expect(responseReplyDeleteJson.status).toEqual('fail');
      expect(responseReplyDeleteJson.message).toBeDefined();
      expect(responseReplyDeleteJson.message).toEqual('balasan tidak ditemukan');
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
      const { id } = responseThreadJson.data.addedThread;

      const commentPayload = {
        content: 'sebuah komentar',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      const { id: commentId } = responseJson.data.addedComment;

      const replyPayload = {
        content: 'sebuah balasan',
      };

      const responseReply = await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments/${commentId}/replies`,
        payload: replyPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseReplyJson = JSON.parse(responseReply.payload);
      const { id: replyId } = responseReplyJson.data.addedReply;

      const responseReplyDelete = await server.inject({
        method: 'DELETE',
        url: `/threads/${id}/comments/${commentId}/replies/${replyId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseReplyDeleteJson = JSON.parse(responseReplyDelete.payload);

      expect(responseReplyDelete.statusCode).toEqual(403);
      expect(responseReplyDeleteJson.status).toEqual('fail');
      expect(responseReplyDeleteJson.message).toEqual('Anda tidak berhak mengakses resource ini');
    });
  });
});
