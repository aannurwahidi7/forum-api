/* eslint-disable max-len */
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  let userId;
  beforeAll(async () => {
    userId = await UsersTableTestHelper.addUser({});
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'new thread',
        body: 'isi thread',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(newThread, userId);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return addded thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'new thread',
        body: 'isi thread',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread, userId);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'new thread',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById', () => {
    it('should throw InvariantError when thread not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return id, title, body, date, owner when thread is found', async () => {
      // Arrange
      const expectedPayload = {
        id: 'thread-123',
        title: 'test thread',
        body: 'isi dari thread',
        date: '2021-08-08T07:19:09.775Z',
        owner: userId,
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await ThreadsTableTestHelper.addThread({
        owner: expectedPayload.owner,
      });

      // Action & Assert
      const data = await threadRepositoryPostgres.getThreadById(expectedPayload.id);
      expect(data).toEqual(expectedPayload);
    });
  });

  describe('verifyThreadById', () => {
    it('should throw NotFound when thread not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.verifyThreadById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });
  });
});
