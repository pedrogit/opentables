const chai = require('chai');
const chaihttp = require('chai-http');
const server = require('../index');

chai.use(chaihttp);

//var assert = chai.assert;

chai.should();

var lists = [];

describe('List API', () => {
  // post list
  /*
  describe('POST /api/lists', () => {
    const newList = {
      'ownerid': '60edb91162a87a2c383d5cf5',
      'rperm': '@owner',
      'wperm': '@owner'
    };

    it('It should post a new list', (done) => {
      chai.request(server)
          .post('/api/lists')
          .send(newList)
          .end((err, response) => {
             response.should.have.status(201);
             response.body.should.be.a('array');
             response.body.length.should.be.eq(3);
          });
    });
  });
*/
  // get all lists
  describe('GET /api/lists', () => {
    it('It should get all the lists', (done) => {
      chai.request(server)
          .get('/api/lists')
          .end((err, response) => {
             response.should.have.status(200);
             response.body.should.be.a('array');
             response.body.length.should.be.eq(4);
             done();
           });
     });

    // Test a invalid URL
    it('It should return a NOT FOUND on invalid URL', (done) => {
      chai.request(server)
          .get('/api/list')
          .end((err, response) => {
             response.should.have.status(404);
             done();
           });
  });
});

    // get list by id


    // put list

    // patch list by id

    // delete all lists

    // delete list by id


})