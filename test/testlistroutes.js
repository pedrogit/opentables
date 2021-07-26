const chai = require('chai');
const chaihttp = require('chai-http');
const server = require('../index');

chai.use(chaihttp);

//var assert = chai.assert;

chai.should();

var lists = [];

describe('List API', () => {
  // DELETE all
  describe('DELETE /api/list', () => {
    it('It should delete all the lists', (done) => {
      chai.request(server)
          .delete('/api/list')
          .end((err, response) => {
             response.should.have.status(200);
             response.body.should.have.all.keys('deletedCount');
             done();
           });
     });
  });

  describe('POST /api/list', () => {

    it('It should post a new list as an object', (done) => {
      chai.request(server)
          .post('/api/list')
          .send({
            'ownerid': '60edb91162a87a2c383d5cf2',
            'rperm': '@owner1',
            'wperm': '@owner1',
            'schema': '{}'
          })
          .end((err, response) => {
             response.should.have.status(201);
             response.body.should.be.a('array');
             response.body.length.should.be.eq(1);
             done();
          });
    });

    it('It should post a new list as an array', (done) => {
      chai.request(server)
          .post('/api/list')
          .send([{
            'ownerid': '60edb91162a87a2c383d5cf2',
            'rperm': '@owner1',
            'wperm': '@owner1',
            'schema': '{}'
          }])
          .end((err, response) => {
             response.should.have.status(201);
             response.body.should.be.a('array');
             response.body.length.should.be.eq(1);
             done();
          });
    });
    
    it('It should post two new lists', (done) => {
      chai.request(server)
          .post('/api/list')
          .send([{
            'ownerid': '60edb91162a87a2c383d5cf4',
            'rperm': '@owner1',
            'wperm': '@owner1',
            'schema': '{}'
          },
          {
            'ownerid': '60edb91162a87a2c383d5cf5',
            'rperm': '@owner2',
            'wperm': '@owner2',
            'schema': '{}'
          }])
          .end((err, response) => {
             response.should.have.status(201);
             response.body.should.be.a('array');
             response.body.length.should.be.eq(2);
             done();
          });
    });
  });

  // get all lists
  describe('GET /api/list', () => {
    it('It should get all the lists', (done) => {
      chai.request(server)
          .get('/api/list')
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
          .get('/api/test')
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
});