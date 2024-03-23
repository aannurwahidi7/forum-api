const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, credentialId) {
    // await this._threadRepository.verifyThreadById(useCasePayload.id);
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.addThread(newThread, credentialId);
  }
}

module.exports = AddThreadUseCase;
