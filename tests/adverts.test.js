const request = require('supertest');
const expect = require('chai').expect;
const Advert = require('../models/Advert.model');
const server = require('../server');

// describe('api/v1/adverts', () => {
//   beforeEach(async () => {
//     await Advert.deleteMany();
//   });
// })

describe('api/v1/adverts', () => {
  beforeEach(async () => {
    await Advert.deleteMany();
  });

  it('should run', async function(done) {
    const adverts = [
      {
        title: 'Ladny pokoj w Krakowie',
        description: 'Pokoj w Krakowie na wynajem od zaraz',
        address: 'Bialopradnicka 24C Krakow, Poland',
        size: 'jednoosobowy',
        cost: '1000',
        billsIncluded: true,
        city: '5ee9432e34526820eb07e2c1',
        user: '5eebeec07062e34af8d66378'
      }
    ];

    await Advert.insertMany(adverts);

    const res = await request(server).get('/api/v1/adverts');
    console.log(res.status);
    expect(res.status).to.equal(200);
    //expect(res.body.length)

    //done();
  });
});
