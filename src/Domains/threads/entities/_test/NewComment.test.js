const NewComment = require('../NewComment');

describe('a NewComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new NewComment(payload, 'NEW_COMMENT')).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action & Assert
    expect(() => new NewComment(payload, 'NEW_COMMENT')).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewAuth entities correctly', () => {
    // Arrange
    const payload = {
      content: 'Ini sebuah komentar',
    };

    // Action
    const newComment = new NewComment(payload, 'NEW_COMMENT');

    // Assert
    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.content).toEqual(payload.content);
  });
});
