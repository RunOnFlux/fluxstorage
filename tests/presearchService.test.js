/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
const chai = require('chai');
const preserachService = require('../src/services/presearchService');

const { expect } = chai;

describe('Service presearchService: Correctly geneartes private keys', () => {
  it('generates 1 private key', async () => {
    const pk = await preserachService.generatePrivateKeys(1);
    expect(pk).to.be.a.string;
  });
  it('generates multiple private keys', async () => {
    const pk = await preserachService.generatePrivateKeys(3);
    expect(pk).to.be.a.string;
    expect(pk.includes(',')).to.be.true;
  });
});
