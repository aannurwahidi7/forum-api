/* eslint-disable no-param-reassign */
const Comment = require('../../Domains/threads/entities/Comment');
const Reply = require('../../Domains/threads/entities/Reply');
const Thread = require('../../Domains/threads/entities/Thread');

class GetThreadUseCase {
  constructor({
    threadRepository, threadCommentRepository, commentReplyRepository, commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
    this._commentReplyRepository = commentReplyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadById(threadId);

    const comments = await this._threadCommentRepository.getCommentByThreadId(threadId);
    const replies = await this._commentReplyRepository.getReplyByThreadId(threadId);

    const replyByCommentId = await Promise.all(comments.map(async (comment) => {
      const reps = replies.filter((reply) => reply.comment_id === comment.id)
        .map((reply) => (new Reply({
          ...reply,
          id: reply.id,
          username: reply.username,
          date: reply.date,
          content: reply.content,
          is_delete: reply.is_delete,
        })));
      const likeCountComment = await this._commentLikeRepository
        .getLikeCountByCommentId(comment.id);
      return new Comment({
        ...comment,
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.content,
        is_delete: comment.is_delete,
        replies: reps,
        likeCount: parseInt(likeCountComment.like_count, 10),
      });
    }));

    const thread = await this._threadRepository.getThreadById(threadId);

    thread.comments = replyByCommentId;

    return new Thread({
      ...thread,
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: thread.comments,
    });
  }
}

module.exports = GetThreadUseCase;
