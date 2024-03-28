const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
    this.deleteThreadCommentHandler = this.deleteThreadCommentHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
    this.postCommentReplyHandler = this.postCommentReplyHandler.bind(this);
    this.deleteCommentReplyHandler = this.deleteCommentReplyHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const payload = {
      title: request.payload.title,
      body: request.payload.body,
    };
    const { id: credentialId } = request.auth.credentials;
    const addedThread = await addThreadUseCase.execute(payload, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async postThreadCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { id: credentialId } = request.auth.credentials;
    const { threadId } = request.params;

    const addedComment = await addCommentUseCase.execute(request.payload, threadId, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteThreadCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await deleteCommentUseCase.execute(credentialId, threadId, commentId);
    const response = h.response({
      status: 'success',
    });

    return response;
  }

  async getThreadHandler(request, h) {
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const { threadId } = request.params;

    const thread_ = await getThreadUseCase.execute(threadId);
    const response = h.response({
      status: 'success',
      data: {
        thread: thread_,
      },
    });

    return response;
  }

  async postCommentReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const addedReply = await addReplyUseCase
      .execute(request.payload, credentialId, threadId, commentId);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCommentReplyHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    const { threadId, commentId, replyId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await deleteReplyUseCase
      .execute(credentialId, threadId, commentId, replyId);

    const response = h.response({
      status: 'success',
    });

    return response;
  }
}

module.exports = ThreadsHandler;
