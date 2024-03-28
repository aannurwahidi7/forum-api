const Reply = require('../Reply');

describe('Reply', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 123,
      date: 123,
      content: 10,
      is_delete: 'true',
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah komentar',
      is_delete: false,
    };

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply).toBeInstanceOf(Reply);
    expect(reply.id).toEqual(payload.id);
    expect(reply.username).toEqual(payload.username);
    expect(reply.date).toEqual(payload.date);
    expect(reply.content).toEqual(payload.content);
    expect(reply.is_delete).toEqual(undefined);
  });
  it('should create Reply content correctly when is_delete is true', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'username',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah komentar',
      is_delete: true,
    };

    const actualContent = '**balasan telah dihapus**';

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply).toBeInstanceOf(Reply);
    expect(reply.id).toEqual(payload.id);
    expect(reply.username).toEqual(payload.username);
    expect(reply.date).toEqual(payload.date);
    expect(reply.content).toEqual(actualContent);
    expect(reply.is_delete).toEqual(undefined);
  });
});
