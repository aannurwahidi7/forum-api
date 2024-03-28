/* eslint-disable no-param-reassign */
const Comment = require('../../Domains/threads/entities/Comment');
const Reply = require('../../Domains/threads/entities/Reply');

class GetThreadUseCase {
  constructor({ threadRepository, threadCommentRepository, commentReplyRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
    this._commentReplyRepository = commentReplyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadById(threadId);

    const comments = await this._threadCommentRepository.getCommentByThreadId(threadId);
    const replies = await this._commentReplyRepository.getReplyByThreadId(threadId);

    const replyByCommentId = comments.map((comment) => {
      const reps = replies.filter((reply) => reply.comment_id === comment.id)
        .map((reply) => (new Reply({
          ...reply,
          id: reply.id,
          username: reply.username,
          date: reply.date,
          content: reply.content,
          is_delete: reply.is_delete,
        })));
      return new Comment({
        ...comment,
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.content,
        is_delete: comment.is_delete,
        replies: reps,
      });
    });

    return this._threadRepository.getThreadById(replyByCommentId, threadId);
  }
}

module.exports = GetThreadUseCase;
