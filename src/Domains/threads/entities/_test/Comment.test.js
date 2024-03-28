const Comment = require('../Comment');

describe('Comment', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      username: 123,
      date: 123,
      content: 10,
      replies: [],
      is_delete: 'true',
    };

    // Action & Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Comment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah komentar',
      replies: [],
      is_delete: false,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment).toBeInstanceOf(Comment);
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual(payload.content);
    expect(comment.replies).toEqual(payload.replies);
    expect(comment.is_delete).toEqual(undefined);
  });
  it('should create Comment content correctly when is_delete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah komentar',
      replies: [],
      is_delete: true,
    };

    const actualContent = '**Komentar telah dihapus**';

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment).toBeInstanceOf(Comment);
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual(actualContent);
    expect(comment.replies).toEqual(payload.replies);
    expect(comment.is_delete).toEqual(undefined);
  });
});
