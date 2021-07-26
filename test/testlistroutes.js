const chai = require('chai');
const chaihttp = require('chai-http');
const server = require('../index');

chai.use(chaihttp);

var expect = chai.expect;

var lists = [];

describe('List API', () => {
  var listIdToPatch;
  ///////////////////
  it('Test an invalid URL. It should return a NOT FOUND on invalid URL', (done) => {
    chai.request(server)
        .get('/api/test')
        .end((err, response) => {
           console.log(response.body);
           expect(response).to.have.status(404);
           done();
        });
  });

  ///////////////////
  describe('DELETE /api/list', () => {
    it('It should delete all the lists', (done) => {
      chai.request(server)
          .delete('/api/list')
          .end((err, response) => {
             console.log(response.body);
             expect(response).to.have.status(200);
             expect(response.body).to.have.all.keys('deletedCount');
             done();
          });
    });
  });

  describe('POST /api/list', () => {
    ///////////////////
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
             console.log(response.body);
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('array');
             expect(response.body).to.have.a.lengthOf(1);
             done();
          });
    });

    ///////////////////
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
             console.log(response.body);
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('array');
             expect(response.body).to.have.a.lengthOf(1);
             done();
          });
    });

    ///////////////////
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
             console.log(response.body);
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('array');
             expect(response.body).to.have.a.lengthOf(2);
             done();
          });
    });
  });

  describe('GET /api/list', () => {
    ///////////////////
    it('It should get all the lists', (done) => {
      chai.request(server)
          .get('/api/list')
          .end((err, response) => {
             console.log(response.body);
             listIdToPatch = response.body[3]._id;
             expect(response).to.have.status(200);
             expect(response.body).to.be.a('array');
             expect(response.body).to.have.a.lengthOf(4);
             done();
           });
    });

    ///////////////////
    it('It should get a list by id', (done) => {
      chai.request(server)
          .get('/api/list/' + listIdToPatch)
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.be.a('object');
             done();
           });
    });
  });

  describe('PATCH /api/list/:listid', () => {
      ///////////////////
      it('It should patch the last list with a new schema value', (done) => {
        chai.request(server)
            .patch('/api/list/' + listIdToPatch)
            .send({'schema': '{toto}'})
            .end((err, response) => {
               console.log(response.body);
               expect(response).to.have.status(200);
               expect(response.body).to.have.property('schema').eq('{toto}');
               done();
             });
      });
  });
});