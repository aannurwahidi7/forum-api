const Thread = require('../Thread');

describe('Thread', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Judul',
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrow('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      body: true,
      date: 123,
      username: 'username',
      comments: 10,
    };

    // Action & Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Thread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Sebuah judul',
      body: 'Isi dari thread',
      date: new Date().toISOString(),
      username: 'username',
      comments: [
        {
          id: 'comment',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah komentar',
        },
      ],
    };

    // Action
    const thread = new Thread(payload);

    // Assert
    expect(thread).toBeInstanceOf(Thread);
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);
    expect(thread.comments).toStrictEqual(payload.comments);
  });
});
