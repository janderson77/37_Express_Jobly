process.env.NODE_ENV = 'test';

const request = require('supertest');
const sqlForPartialUpdate = require('../../helpers/partialUpdate');

const app = require('../app');
const db = require('../db');

let testupdate:

beforeEach(async () => {
  let testupdate = {table: }
})

describe("partialUpdate()", async () => {
  it("should generate a proper partial update query with just 1 field",
      async () => {
        const res = await sqlForPartialUpdate()
    // FIXME: write real tests!
    expect(false).toEqual(true);

  });
});