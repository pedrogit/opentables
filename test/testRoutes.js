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
           expect(response).to.have.status(404);
           expect(response.body).to.deep.equal({});
           done();
           console.log(JSON.stringify(response.body, null, 2));
         });
    });
  });

  describe('DELETE /api/listitem', () => {
    it('Delete all the lists from the DB', (done) => {
      chai.request(server)
          .delete('/api/listitem')
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.have.all.keys('deletedCount');
             done();
             console.log(JSON.stringify(response.body, null, 2));
           });
    });
  });

  describe('POST /api/listitem', () => {
    it('Post a list having an invalid field', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({'xownerid': '60edb91162a87a2c383d5cf2',
                'rperm': '@owner1',
                'wperm': '@owner1',
                'listschema': '{}'}
          )
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.an('object');
             expect(response.body).to.deep.equal({"err": 'Error: ItemSchema: JSON object is not valid. "ownerid" is missing...'});
             done();
             console.log(JSON.stringify(response.body, null, 2));
           });
    });
  });

  describe('POST /api/listitem', () => {
    it('Post a new, empty list', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({'ownerid': '60edb91162a87a2c383d5cf2',
                 'rperm': '@owner1',
                 'wperm': '@owner1',
                 'listschema': '{}'}
          )
          .end((err, response) => {
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             expect(response.body).to.have.property('_id');
             expect(response.body).to.have.property('ownerid', '60edb91162a87a2c383d5cf2');
             expect(response.body).to.have.property('rperm', '@owner1');
             expect(response.body).to.have.property('wperm', '@owner1');
             expect(response.body).to.have.property('listschema', '{}');
             listIdToPatch = response.body._id;
             done();
             console.log(JSON.stringify(response.body, null, 2));
           });
    });
  });

  describe('GET /api/listitem/:listid', () => {
    it('Get list with an invalid id', (done) => {
      chai.request(server)
          .get('/api/listitem/6102f9efc3b25831e42fec8b')
          .end((err, response) => {
             expect(response).to.have.status(404);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": "Error: Could not find list item (6102f9efc3b25831e42fec8b)..."});
             done();
             console.log(JSON.stringify(response.body, null, 2));
           });
    });
  });

  describe('GET /api/listitem/:listid', () => {
    it('Get the last list by id', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch)
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.be.a('object');
             expect(response.body).to.have.property('_id');
             expect(response.body).to.have.property('ownerid', '60edb91162a87a2c383d5cf2');
             expect(response.body).to.have.property('rperm', '@owner1');
             expect(response.body).to.have.property('wperm', '@owner1');
             expect(response.body).to.have.property('listschema', '{}');
             done();
             console.log(JSON.stringify(response.body, null, 2));
           });
    });
  });

  describe('PATCH /api/list/:listid', () => {
    it('Patch with an invalid id', (done) => {
      chai.request(server)
          .patch('/api/listitem/aaaa')
          .send({'xlistschema': '{"field1": {"type": "string"}, "field2": {"type": "string"}}'})
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": "Error: Invalid ID format..."});
             done();
             console.log(JSON.stringify(response.body, null, 2));
           });
    });
  });

  describe('PATCH /api/list/:listid', () => {
    it('Patch a non existing list', (done) => {
      chai.request(server)
          .patch('/api/listitem/61156c3f52de9f98d61f9a23')
          .send({'xlistschema': '{"field1": {"type": "string"}, "field2": {"type": "string"}}'})
          .end((err, response) => {
             expect(response).to.have.status(404);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": "Error: Could not find list item (61156c3f52de9f98d61f9a23)..."});
             done();
             console.log(JSON.stringify(response.body, null, 2));
           });
    });
  });

  describe('PATCH /api/list/:listid', () => {
    it('Patch the last list with an invalid field', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listIdToPatch)
          .send({'xlistschema': '{"field1": {"type": "string"}, "field2": {"type": "string"}}'})
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": "Error: ItemSchema: JSON object is not valid. \"xlistschema\" is not a valid field for this schema..."});
             done();
             console.log(JSON.stringify(response.body, null, 2));
           });
    });
  });

  describe('PATCH /api/list/:listid', () => {
      it('Patch the last list with a new listschema value', (done) => {
        chai.request(server)
            .patch('/api/listitem/' + listIdToPatch)
            .send({'listschema': '{"field1": {"type": "string"}, "field2": {"type": "string"}}'})
            .end((err, response) => {
               expect(response).to.have.status(200);
               expect(response.body).to.have.property('_id');
               expect(response.body).to.have.property('ownerid', '60edb91162a87a2c383d5cf2');
               expect(response.body).to.have.property('rperm', '@owner1');
               expect(response.body).to.have.property('wperm', '@owner1');
               expect(response.body).to.have.property('listschema', '{"field1": {"type": "string"}, "field2": {"type": "string"}}');
               done();
               console.log(JSON.stringify(response.body, null, 2));
             });
      });
  });

  describe('POST /api/listitem', () => {
    it('Post a first list item', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({'listid': listIdToPatch, 
                 'field1': 'field1val1',
                 'field2': 'field2val1'}
          )
          .end((err, response) => {
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             expect(response.body).to.have.property('_id');
             expect(response.body).to.have.property('listid');
             expect(response.body).to.have.property('field1', 'field1val1');
             expect(response.body).to.have.property('field2', 'field2val1');
             done();
             console.log(JSON.stringify(response.body, null, 2));
            });
    });

    it('Post a second list item', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({'listid': listIdToPatch, 
                 'field1': 'field1val2',
                 'field2': 'field2val2'}
          )
          .end((err, response) => {
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             expect(response.body).to.have.property('_id');
             expect(response.body).to.have.property('listid');
             expect(response.body).to.have.property('field1', 'field1val2');
             expect(response.body).to.have.property('field2', 'field2val2');
             listItemIdToPatch = response.body._id;
             done();
             console.log(JSON.stringify(response.body, null, 2));
            });
    });

    describe('GET /api/listitem/:listid', () => {
      it('Get the list to check if new items were created', (done) => {
        chai.request(server)
            .get('/api/listitem/' + listIdToPatch)
            .end((err, response) => {
               expect(response).to.have.status(200);
               expect(response.body).to.be.a('object');
               expect(response.body).to.have.property('_id');
               expect(response.body).to.have.property('ownerid', '60edb91162a87a2c383d5cf2');
               expect(response.body).to.have.property('rperm', '@owner1');
               expect(response.body).to.have.property('wperm', '@owner1');
               expect(response.body).to.have.property('listschema', '{"field1": {"type": "string"}, "field2": {"type": "string"}}');
               expect(response.body).to.have.deep.nested.property('items[0].field1', 'field1val1');
               expect(response.body).to.have.deep.nested.property('items[0].field2', 'field2val1');
               expect(response.body).to.have.deep.nested.property('items[1].field1', 'field1val2');
               expect(response.body).to.have.deep.nested.property('items[1].field2', 'field2val2');
               expect(response.body).not.to.have.deep.nested.property('items[1].listid');
               done();
               console.log(JSON.stringify(response.body, null, 2));
             });
      });
    });

    describe('PATCH /api/list/:itemid', () => {
      it('Patch the last list item', (done) => {
        chai.request(server)
            .patch('/api/listitem/' + listItemIdToPatch)
            .send({
              "field2": "field2 value222"
            })
            .end((err, response) => {
               expect(response).to.have.status(200);
               expect(response.body).to.be.a('object');
               expect(response.body).to.have.property('_id');
               expect(response.body).to.have.property('listid', listIdToPatch);
               expect(response.body).to.have.deep.nested.property('field1', 'field1val2');
               expect(response.body).to.have.deep.nested.property('field2', 'field2 value222');
               done();
               console.log(JSON.stringify(response.body, null, 2));
             });
      });
    });

    describe('GET /api/listitem/:itemid', () => {
      it('Get the last posted item', (done) => {
        chai.request(server)
            //.patch('/api/listitem/' + listIdToPatch + '/' + listItemIdToPatch)
            .get('/api/listitem/' + listItemIdToPatch)
            .end((err, response) => {
               expect(response).to.have.status(200);
               expect(response.body).to.have.property('_id');
               expect(response.body).to.have.property('listid', listIdToPatch);
               expect(response.body).to.have.property('field1', 'field1val2');
               expect(response.body).to.have.property('field2', 'field2 value222');
               done();
               console.log(JSON.stringify(response.body, null, 2));
             });
      });
    });

    describe('GET /api/list/:listid', () => {
      it('Get the list to check if new items were modified', (done) => {
        chai.request(server)
            .get('/api/listitem/' + listIdToPatch)
            .end((err, response) => {
               expect(response).to.have.status(200);
               expect(response.body).to.be.a('object');
               expect(response.body).to.have.property('_id');
               expect(response.body).to.have.property('ownerid', '60edb91162a87a2c383d5cf2');
               expect(response.body).to.have.property('rperm', '@owner1');
               expect(response.body).to.have.property('wperm', '@owner1');
               expect(response.body).to.have.property('listschema', '{"field1": {"type": "string"}, "field2": {"type": "string"}}');
               expect(response.body).to.have.deep.nested.property('items[0].field1', 'field1val1');
               expect(response.body).to.have.deep.nested.property('items[0].field2', 'field2val1');
               expect(response.body).to.have.deep.nested.property('items[1].field1', 'field1val2');
               expect(response.body).to.have.deep.nested.property('items[1].field2', 'field2 value222');
               done();
               console.log(JSON.stringify(response.body, null, 2));
             });
      });
    });
  });
});