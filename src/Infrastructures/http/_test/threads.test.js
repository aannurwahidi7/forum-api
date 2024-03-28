const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const CommentReplyTableTestHelper = require('../../../../tests/CommentReplyTableTestHelper');

describe('/threads endpoint', () => {
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
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sebuah title',
        body: 'Sebuah body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 123,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads', () => {
    it('should return 200 and persisted object thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sebuah title',
        body: 'Sebuah body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      const threadId = responseJson.data.addedThread.id;

      const commentPayload = {
        content: 'sebuah komentar',
      };

      const commentResp = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const commentJson = JSON.parse(commentResp.payload);
      const commentId = commentJson.data.addedComment.id;
      const replyPayload = {
        content: 'sebuah balasan 1',
      };

      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const replyJson = JSON.parse(replyResponse.payload);
      const replyId = replyJson.data.addedReply.id;

      const thread = await ThreadsTableTestHelper.findThreadById(threadId);
      const dateThread = thread[0].date;
      const comment = await ThreadCommentsTableTestHelper.findCommentById(commentId);
      const dateComment = comment[0].date;
      const reply = await CommentReplyTableTestHelper.findReplyById(replyId);
      const dateReply = reply[0].date;

      const expectedPayload = {
        id: threadId,
        title: 'Sebuah title',
        body: 'Sebuah body',
        date: dateThread,
        username: 'dicoding',
        comments: [
          {
            id: commentId,
            username: 'dicoding',
            date: dateComment,
            content: 'sebuah komentar',
            replies: [
              {
                id: replyId,
                username: 'dicoding',
                date: dateReply,
                content: 'sebuah balasan 1',
              },
            ],
          },
        ],
      };

      const responseGet = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseGetJson = JSON.parse(responseGet.payload);
      expect(responseGet.statusCode).toEqual(200);
      expect(responseGetJson.status).toEqual('success');
      expect(responseGetJson.data.thread).toBeDefined();
      expect(responseGetJson.data.thread).toStrictEqual(expectedPayload);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange & Action
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-435',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  it('should response 401 when user not authenticated', async () => {
    // Arrange
    const requestPayload = {
      title: 'Sebuah title',
      body: 'Sebuah body',
    };
    const server = await createServer(container);

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(401);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toBeDefined();
    expect(responseJson.message).toEqual('tidak dapat memproses lebih lanjut, user belum melakukan login');
  });
});
