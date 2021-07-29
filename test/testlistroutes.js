const chai = require('chai');
const chaihttp = require('chai-http');
const server = require('../index');

chai.use(chaihttp);

var expect = chai.expect;

var lists = [];

describe('List API', () => {
  var listIdToPatch;
  
  describe('Invalid URL', () => {
    it('Test an invalid URL. It should return a NOT FOUND on invalid URL', (done) => {
    chai.request(server)
        .get('/api/test')
        .end((err, response) => {
           console.log(response.body);
           expect(response).to.have.status(404);
           done();
        });
    });
  });

  describe('DELETE /api/list', () => {
    it('Delete all the lists from the DB', (done) => {
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
    it('Post a new, empty list', (done) => {
      chai.request(server)
          .post('/api/list')
          .send({
            'ownerid': '60edb91162a87a2c383d5cf2',
            'rperm': '@owner1',
            'wperm': '@owner1',
            'listschema': '{}'
          })
          .end((err, response) => {
             console.log(response.body);
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             listIdToPatch = response.body._id;
             done();
          });
    });
  });

  describe('GET /api/list/:listid', () => {
    it('Get the last list by id', (done) => {
      chai.request(server)
          .get('/api/list/' + listIdToPatch)
          .end((err, response) => {
             console.log(response.body);
             expect(response).to.have.status(200);
             expect(response.body).to.be.a('object');
             done();
           });
    });
  });

  describe('PATCH /api/list/:listid', () => {
      it('Patch the last list with a new listschema value', (done) => {
        chai.request(server)
            .patch('/api/list/' + listIdToPatch)
            .send({'listschema': "{field1: 'String'}"})
            .end((err, response) => {
               console.log(response.body);
               expect(response).to.have.status(200);
               expect(response.body).to.have.property('listschema').eq("{field1: 'String'}");
               done();
             });
      });
  });

  describe('POST /api/listitem', () => {
    it('Post a first list item', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({
            listid: listIdToPatch, 
            item: {
              'field1': 'field1val1',
              'field2': 'field2val1'
            }
          })
          .end((err, response) => {
             console.log(response.body);
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             done();
          });
    });

    it('Post a second list item', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({
            listid: listIdToPatch, 
            item: {
              'field1': 'field1val2',
              'field2': 'field2val2'
            }
          })
          .end((err, response) => {
             console.log(response.body);
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             listItemIdToPatch = response.body._id;
             done();
          });
    });

    describe('GET /api/list/:listid', () => {
      it('Get the list to check if new items were created', (done) => {
        chai.request(server)
            .get('/api/list/' + listIdToPatch)
            .end((err, response) => {
               console.log(response.body);
               expect(response).to.have.status(200);
               expect(response.body).to.be.a('object');
               done();
             });
      });
    });

    describe('PATCH /api/list/:listid/:itemid', () => {
      it('Patch the last list with a new listschema value', (done) => {
        chai.request(server)
            .patch('/api/listitem/' + listItemIdToPatch)
            .send({
              'item.field2': 'field2 value222'
            })
            .end((err, response) => {
               console.log(response.body);
               expect(response).to.have.status(200);
               done();
             });
      });
    });

    describe('GET /api/listitem/:itemid', () => {
      it('Get the last posted item', (done) => {
        chai.request(server)
            //.patch('/api/listitem/' + listIdToPatch + '/' + listItemIdToPatch)
            .get('/api/listitem/' + listItemIdToPatch)
            .end((err, response) => {
               console.log(response.body);
               expect(response).to.have.status(200);
               done();
             });
      });
    });

    describe('GET /api/list/:listid', () => {
      it('Get the list to check if new items were created', (done) => {
        chai.request(server)
            .get('/api/list/' + listIdToPatch)
            .end((err, response) => {
               console.log(response.body);
               expect(response).to.have.status(200);
               expect(response.body).to.be.a('object');
               done();
             });
      });
    });
  });
});