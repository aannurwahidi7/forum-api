const Joi = require('joi');

const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt',
      description: 'POST threads',
      notes: 'Test',
      tags: ['api', 'thread'],
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required(),
        }),
        payload: Joi.object({
          title: Joi.string(),
          body: Joi.string(),
        }).label('Post-threads-payload'),
      },
      response: {
        schema: Joi.object({
          status: 'success',
          data: {
            addedThread: {
              id: Joi.string(),
              title: Joi.string(),
              owner: Joi.string(),
            },
          },
        }).label('Post-threads-response'),
      },
    },
  },
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postThreadCommentHandler,
    options: {
      auth: 'forumapi_jwt',
      description: 'POST comments',
      notes: 'Test',
      tags: ['api', 'thread', 'comment'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
        }),
        headers: Joi.object({
          authorization: Joi.string().required(),
        }),
        payload: Joi.object({
          content: Joi.string(),
        }).label('Post-comments-payload'),
      },
      response: {
        schema: Joi.object({
          status: 'success',
          data: {
            addedComment: {
              id: Joi.string(),
              content: Joi.string(),
              owner: Joi.string(),
            },
          },
        }).label('Post-comments-response'),
      },
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteThreadCommentHandler,
    options: {
      auth: 'forumapi_jwt',
      description: 'DELETE comments',
      notes: 'Test',
      tags: ['api', 'thread', 'comment'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
          commentId: Joi.string().required(),
        }),
        headers: Joi.object({
          authorization: Joi.string().required(),
        }),
      },
      response: {
        schema: Joi.object({
          status: 'success',
        }).label('Delete-comments-response'),
      },
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadHandler,
    options: {
      description: 'GET threads',
      notes: 'Test',
      tags: ['api', 'thread'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
        }),
      },
      response: {
        schema: Joi.object({
          status: 'success',
          data: {
            thread: {
              id: Joi.string(),
              title: Joi.string(),
              body: Joi.string(),
              date: Joi.string(),
              username: Joi.string(),
              comments: Joi.array().items(
                Joi.object({
                  id: Joi.string(),
                  username: Joi.string(),
                  date: Joi.string(),
                  content: Joi.string(),
                  likeCount: Joi.number(),
                  replies: Joi.array().items(
                    Joi.object({
                      id: Joi.string(),
                      username: Joi.string(),
                      date: Joi.string(),
                      content: Joi.string(),
                    }),
                  ),
                }),
              ),
            },
          },
        }).label('Post-comments-response'),
      },
    },
  },
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postCommentReplyHandler,
    options: {
      auth: 'forumapi_jwt',
      description: 'POST replies',
      notes: 'Test',
      tags: ['api', 'thread', 'reply'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
          commentId: Joi.string().required(),
        }),
        headers: Joi.object({
          authorization: Joi.string().required(),
        }),
        payload: Joi.object({
          content: Joi.string(),
        }).label('Post-replies-payload'),
      },
      response: {
        schema: Joi.object({
          status: 'success',
          data: {
            addedReply: {
              id: Joi.string(),
              content: Joi.string(),
              owner: Joi.string(),
            },
          },
        }).label('Post-replies-response'),
      },
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: handler.deleteCommentReplyHandler,
    options: {
      auth: 'forumapi_jwt',
      description: 'DELETE replies',
      notes: 'Test',
      tags: ['api', 'thread', 'reply'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
          commentId: Joi.string().required(),
          replyId: Joi.string().required(),
        }),
        headers: Joi.object({
          authorization: Joi.string().required(),
        }),
      },
      response: {
        schema: Joi.object({
          status: 'success',
        }).label('Delete-replies-response'),
      },
    },
  },
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.addCommentLikeHandler,
    options: {
      auth: 'forumapi_jwt',
      description: 'PUT likes',
      notes: 'Test',
      tags: ['api', 'comment', 'like'],
      validate: {
        params: Joi.object({
          threadId: Joi.string().required(),
          commentId: Joi.string().required(),
        }),
        headers: Joi.object({
          authorization: Joi.string().required(),
        }),
      },
      response: {
        schema: Joi.object({
          status: 'success',
        }).label('Putt-likes-response'),
      },
    },
  },
]);

module.exports = routes;
