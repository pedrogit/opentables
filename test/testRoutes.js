const chai = require('chai');
const chaihttp = require('chai-http');
const server = require('../index');
const bcrypt = require('bcrypt');
const Globals = require('../globals');
const NodeUtil = require('util');
const Errors = require('../utils/errors');

chai.use(chaihttp);

var expect = chai.expect;

var lists = [];

describe('testRoutes.js List API', () => {
  var listIdToPatch;
  var firstItemID;
  
  describe('Invalid URL and DELETE ALL', () => {
    it('Test an invalid URL. It should return a NOT FOUND on invalid URL', (done) => {
    chai.request(server)
        .get('/api/test')
        .end((err, response) => {
           expect(response).to.have.status(404);
           expect(response.body).to.deep.equal({});
           done();
           //console.log(JSON.stringify(response.body, null, 2));
        });
    });

    it('Delete all the lists from the DB', (done) => {
      chai.request(server)
          .delete('/api/listitem')
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.have.all.keys('deletedCount');
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });
  });

  describe('POST and GET on list', () => {
    it('Post a list having an invalid field', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({['x' + Globals.ownerIdFieldName]: '60edb91162a87a2c383d5cf2',
                'rperm': '@owner1',
                'wperm': '@owner1',
                [Globals.listSchemaFieldName]: '{}'}
          )
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.an('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, Globals.ownerIdFieldName)});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Post a list having an invalid schema', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.ownerIdFieldName]: '60edb91162a87a2c383d5cf2',
                'rperm': '@owner1',
                'wperm': '@owner1',
                [Globals.listSchemaFieldName]: 'toto: x'}
          )
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.an('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchemaParameter, 'x', 'toto')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });
    it('Post a new, empty list', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.ownerIdFieldName]: '60edb91162a87a2c383d5cf2',
                 'rperm': '@owner1',
                 'wperm': '@owner1',
                 [Globals.listSchemaFieldName]: '{}'}
          )
          .end((err, response) => {
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
             expect(response.body).to.have.property('rperm', '@owner1');
             expect(response.body).to.have.property('wperm', '@owner1');
             expect(response.body).to.have.property(Globals.listSchemaFieldName, '{}');
             listIdToPatch = response.body[Globals.itemIdFieldName];
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Get list with a malformed id', (done) => {
      chai.request(server)
          .get('/api/listitem/toto')
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.MalformedID, 'toto')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Get list with an invalid id', (done) => {
      chai.request(server)
          .get('/api/listitem/6102f9efc3b25831e42fec8b')
          .end((err, response) => {
             expect(response).to.have.status(404);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, '6102f9efc3b25831e42fec8b')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Get the last list by id', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch)
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.be.a('object');
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
             expect(response.body).to.have.property('rperm', '@owner1');
             expect(response.body).to.have.property('wperm', '@owner1');
             expect(response.body).to.have.property(Globals.listSchemaFieldName, '{}');
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });
  });

  describe('PATCH on list', () => {
    it('Patch with an invalid id', (done) => {
      chai.request(server)
          .patch('/api/listitem/aaaa')
          .send({'xlistschema': '{"field1": {"type": "string"}, "field2": {"type": "string"}}'})
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.MalformedID, 'aaaa')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch a non existing list', (done) => {
      chai.request(server)
          .patch('/api/listitem/61156c3f52de9f98d61f9a23')
          .send({'xlistschema': '{"field1": {"type": "string"}, "field2": {"type": "string"}}'})
          .end((err, response) => {
             expect(response).to.have.status(404);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, '61156c3f52de9f98d61f9a23')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch the last list with an invalid field', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listIdToPatch)
          .send({'xlistschema': '{"field1": {"type": "string"}, "field2": {"type": "string"}}'})
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidField, 'xlistschema')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch the last list with a new listschema value', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listIdToPatch)
          .send({[Globals.listSchemaFieldName]: '{"field1": {"type": "string", required}, "field2": {"type": "string", required}}'})
          .end((err, response) => {
              expect(response).to.have.status(200);
              expect(response.body).to.have.property(Globals.itemIdFieldName);
              expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
              expect(response.body).to.have.property('rperm', '@owner1');
              expect(response.body).to.have.property('wperm', '@owner1');
              expect(response.body).to.have.property(Globals.listSchemaFieldName, '{"field1": {"type": "string", required}, "field2": {"type": "string", required}}');
              done();
              //console.log(JSON.stringify(response.body, null, 2));
          });
    });
  });

  describe('POST on listitem', () => {
    it('Post a list item having an invalid listid', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.listIdFieldName]: '60edb91162a87a2c383d5cf2', 
                 'field1': 'field1val1',
                 'field2': 'field2val1'}
          )
          .end((err, response) => {
             expect(response).to.have.status(404);
             expect(response.body).to.be.an('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.List_NotFound, '60edb91162a87a2c383d5cf2')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Post a list item having an invalid field', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.listIdFieldName]: listIdToPatch, 
                 'field1': 'field1val1',
                 'field2': 'field2val1',
                 'field3': 'field3val1'}
          )
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.an('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidField, 'field3')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Post a list item with a missing field', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.listIdFieldName]: listIdToPatch, 
                 'field1': 'field1val1'}
          )
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.an('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, 'field2')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Post a first valid list item', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.listIdFieldName]: listIdToPatch, 
                 'field1': 'field1val1',
                 'field2': 'field2val1'}
          )
          .end((err, response) => {
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.listIdFieldName);
             expect(response.body).to.have.property('field1', 'field1val1');
             expect(response.body).to.have.property('field2', 'field2val1');
             firstItemID = response.body[Globals.itemIdFieldName];
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Post a second list item', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.listIdFieldName]: listIdToPatch, 
                 'field1': 'field1val2',
                 'field2': 'field2val2'}
          )
          .end((err, response) => {
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.listIdFieldName);
             expect(response.body).to.have.property('field1', 'field1val2');
             expect(response.body).to.have.property('field2', 'field2val2');
             listItemIdToPatch = response.body[Globals.itemIdFieldName];
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Post two list items', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.listIdFieldName]: listIdToPatch, 
                 items:[{'field1': 'field1val3',
                         'field2': 'field2val3'},{
                         'field1': 'field1val4',
                         'field2': 'field2val4'}]}
          )
          .end((err, response) => {
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             expect(response.body).to.have.property('insertedCount', 2);
             expect(response.body).to.have.property('insertedIds');
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });


    it('Get the list to check if new items were created', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch)
          .end((err, response) => {
              expect(response).to.have.status(200);
              expect(response.body).to.be.a('object');
              expect(response.body).to.have.property(Globals.itemIdFieldName);
              expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
              expect(response.body).to.have.property('rperm', '@owner1');
              expect(response.body).to.have.property('wperm', '@owner1');
              expect(response.body).to.have.property(Globals.listSchemaFieldName, '{"field1": {"type": "string", required}, "field2": {"type": "string", required}}');
              expect(response.body).to.have.deep.nested.property('items[0].field1', 'field1val1');
              expect(response.body).to.have.deep.nested.property('items[0].field2', 'field2val1');
              expect(response.body).to.have.deep.nested.property('items[1].field1', 'field1val2');
              expect(response.body).to.have.deep.nested.property('items[1].field2', 'field2val2');
              expect(response.body).to.have.deep.nested.property('items[2].field1', 'field1val3');
              expect(response.body).to.have.deep.nested.property('items[2].field2', 'field2val3');
              expect(response.body).to.have.deep.nested.property('items[3].field1', 'field1val4');
              expect(response.body).to.have.deep.nested.property('items[3].field2', 'field2val4');
              expect(response.body).not.to.have.deep.nested.property('items[1].listid');
              done();
              ////console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Get the list again but without the list of items', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch + '/noitems')
          .end((err, response) => {
              expect(response).to.have.status(200);
              expect(response.body).to.be.a('object');
              expect(response.body).to.have.property(Globals.itemIdFieldName);
              expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
              expect(response.body).to.have.property('rperm', '@owner1');
              expect(response.body).to.have.property('wperm', '@owner1');
              expect(response.body).to.have.property(Globals.listSchemaFieldName, '{"field1": {"type": "string", required}, "field2": {"type": "string", required}}');
              expect(response.body).not.to.have.property('items');
              done();
              //console.log(JSON.stringify(response.body, null, 2));
          });
    });
  });

  describe('PATCH on listitem', () => {
    it('Patch the last list item with a non existing field', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listItemIdToPatch)
          .send({
            "field3": "field2 value222"
          })
          .end((err, response) => {
              expect(response).to.have.status(400);
              expect(response.body).to.be.a('object');
              expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidField, 'field3')});
              done();
              //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch the last list item with a value of the wrong type', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listItemIdToPatch)
          .send({
            "field2": 222
          })
          .end((err, response) => {
              expect(response).to.have.status(400);
              expect(response.body).to.be.a('object');
              expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field2', '222', 'string')});
              done();
              //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch the last list item', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listItemIdToPatch)
          .send({
            "field2": "field2 value222"
          })
          .end((err, response) => {
              expect(response).to.have.status(200);
              expect(response.body).to.be.a('object');
              expect(response.body).to.have.property(Globals.itemIdFieldName);
              expect(response.body).to.have.property(Globals.listIdFieldName, listIdToPatch);
              expect(response.body).to.have.deep.nested.property('field1', 'field1val2');
              expect(response.body).to.have.deep.nested.property('field2', 'field2 value222');
              done();
              //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Get the last posted item', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listItemIdToPatch)
          .end((err, response) => {
              expect(response).to.have.status(200);
              expect(response.body).to.have.property(Globals.itemIdFieldName);
              expect(response.body).to.have.property(Globals.listIdFieldName, listIdToPatch);
              expect(response.body).to.have.property('field1', 'field1val2');
              expect(response.body).to.have.property('field2', 'field2 value222');
              done();
              //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Get the list to check if new items were modified', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch)
          .end((err, response) => {
              expect(response).to.have.status(200);
              expect(response.body).to.be.a('object');
              expect(response.body).to.have.property(Globals.itemIdFieldName);
              expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
              expect(response.body).to.have.property('rperm', '@owner1');
              expect(response.body).to.have.property('wperm', '@owner1');
              expect(response.body).to.have.property(Globals.listSchemaFieldName, '{"field1": {"type": "string", required}, "field2": {"type": "string", required}}');
              expect(response.body).to.have.deep.nested.property('items[0].field1', 'field1val1');
              expect(response.body).to.have.deep.nested.property('items[0].field2', 'field2val1');
              expect(response.body).to.have.deep.nested.property('items[1].field1', 'field1val2');
              expect(response.body).to.have.deep.nested.property('items[1].field2', 'field2 value222');
              done();
              //console.log(JSON.stringify(response.body, null, 2));
          });
    });
  });

  describe('Test upper, lower and encrypt', () => {
    it('Patch the list with a new listschema value', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listIdToPatch)
          .send({[Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}}'})
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
             expect(response.body).to.have.property('rperm', '@owner1');
             expect(response.body).to.have.property('wperm', '@owner1');
             expect(response.body).to.have.property(Globals.listSchemaFieldName, '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}}');
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch the last list item with values to be converted to upper and lowercase', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listItemIdToPatch)
          .send({"field1": "LOWERcase",
                 "field2": "upperCASE"
          })
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.be.a('object');
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.listIdFieldName, listIdToPatch);
             expect(response.body).to.have.property('field1', 'lowercase');
             expect(response.body).to.have.property('field2', 'UPPERCASE');
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch the listschema so field3 is encrypted', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listIdToPatch)
          .send({[Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": {"type": "string", encrypt}}'})
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
             expect(response.body).to.have.property('rperm', '@owner1');
             expect(response.body).to.have.property('wperm', '@owner1');
             expect(response.body).to.have.property(Globals.listSchemaFieldName, '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": {"type": "string", encrypt}}');
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch the last list item with a values to be encrypted', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listItemIdToPatch)
          .send({"field3": "encrypted string"
          })
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.be.a('object');
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.listIdFieldName, listIdToPatch);
             expect(response.body).to.have.property('field1', 'lowercase');
             expect(response.body).to.have.property('field2', 'UPPERCASE');
             expect(bcrypt.compareSync("encrypted string", response.body.field3)).to.be.true;
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });
  });

  describe('Test "string", "number" and "encrypted_string" as basic types', () => {
    it('Patch the listschema with an invalid type for field4', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listIdToPatch)
          .send({[Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": {"type": "string", encrypt}, "field4": "toto"}'})
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchemaParameter, 'toto', 'field4')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch the listschema so field4 is defined as a basic string', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listIdToPatch)
          .send({[Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": {"type": "string", encrypt}, "field4": "string"}'})
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
             expect(response.body).to.have.property('rperm', '@owner1');
             expect(response.body).to.have.property('wperm', '@owner1');
             expect(response.body).to.have.property(Globals.listSchemaFieldName, '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": {"type": "string", encrypt}, "field4": "string"}');
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch with a non string value', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listItemIdToPatch)
          .send({"field4": 123
          })
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.a('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field4', '123', 'string')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Patch with a string', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listItemIdToPatch)
          .send({"field4": "field4 value4"
          })
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.be.a('object');
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.listIdFieldName, listIdToPatch);
             expect(response.body).to.have.property('field1', 'lowercase');
             expect(response.body).to.have.property('field2', 'UPPERCASE');
             expect(bcrypt.compareSync("encrypted string", response.body.field3)).to.be.true;
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });
  });

  describe('Test GET with filter', () => {
    it('Test case sensitive constains returning something', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch + '?filter=$contains:[$field1, "field1val1"]')
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.deep.equal({
              _id: listIdToPatch,
              _ownerid: "60edb91162a87a2c383d5cf2",
              rperm: "@owner1",
              wperm: "@owner1",
              listschema: "{\"field1\": {\"type\": \"string\", required, lower}, \"field2\": {\"type\": \"string\", required, upper}, \"field3\": {\"type\": \"string\", encrypt}, \"field4\": \"string\"}",
              items: [
                {
                  _id: firstItemID,
                  field1: "field1val1",
                  field2: "field2val1",
                },
              ],
            });
            done();
            //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Test case insensitive constains', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch + '?filter=$contains_i:[$field1, "FIELd1val1"]')
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.deep.equal({
              _id: listIdToPatch,
              _ownerid: "60edb91162a87a2c383d5cf2",
              rperm: "@owner1",
              wperm: "@owner1",
              listschema: "{\"field1\": {\"type\": \"string\", required, lower}, \"field2\": {\"type\": \"string\", required, upper}, \"field3\": {\"type\": \"string\", encrypt}, \"field4\": \"string\"}",
              items: [
                {
                  _id: firstItemID,
                  field1: "field1val1",
                  field2: "field2val1"
                },
              ],
            });
            done();
            //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Test case sensitive constains returning nothing', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch + '?filter=$contains:[$field1, "xxx"]')
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.deep.equal({
              _id: listIdToPatch,
              _ownerid: "60edb91162a87a2c383d5cf2",
              rperm: "@owner1",
              wperm: "@owner1",
              listschema: "{\"field1\": {\"type\": \"string\", required, lower}, \"field2\": {\"type\": \"string\", required, upper}, \"field3\": {\"type\": \"string\", encrypt}, \"field4\": \"string\"}",
              items: [],
            });
            done();
            //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Test succesfull case sensitive isexactly returning something', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch + '?filter=$isexactly:[$field1, "field1val1"]')
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.deep.equal({
              _id: listIdToPatch,
              _ownerid: "60edb91162a87a2c383d5cf2",
              rperm: "@owner1",
              wperm: "@owner1",
              listschema: "{\"field1\": {\"type\": \"string\", required, lower}, \"field2\": {\"type\": \"string\", required, upper}, \"field3\": {\"type\": \"string\", encrypt}, \"field4\": \"string\"}",
              items: [
                {
                  _id: firstItemID,
                  field1: "field1val1",
                  field2: "field2val1",
                },
              ],
            });
            done();
            //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Test case insensitive isexactly', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch + '?filter=$isexactly_i:[$field1, "FIeld1val1"]')
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.deep.equal({
              _id: listIdToPatch,
              _ownerid: "60edb91162a87a2c383d5cf2",
              rperm: "@owner1",
              wperm: "@owner1",
              listschema: "{\"field1\": {\"type\": \"string\", required, lower}, \"field2\": {\"type\": \"string\", required, upper}, \"field3\": {\"type\": \"string\", encrypt}, \"field4\": \"string\"}",
              items: [
                {
                  _id: firstItemID,
                  field1: "field1val1",
                  field2: "field2val1",
                },
              ],
            });
            done();
            //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Test succesfull case sensitive isexactly returning nothing', (done) => {
      chai.request(server)
          .get('/api/listitem/' + listIdToPatch + '?filter=$isexactly:[$field1, "xxx"]')
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.deep.equal({
              _id: listIdToPatch,
              _ownerid: "60edb91162a87a2c383d5cf2",
              rperm: "@owner1",
              wperm: "@owner1",
              listschema: "{\"field1\": {\"type\": \"string\", required, lower}, \"field2\": {\"type\": \"string\", required, upper}, \"field3\": {\"type\": \"string\", encrypt}, \"field4\": \"string\"}",
              items: [],
            });
            done();
            //console.log(JSON.stringify(response.body, null, 2));
          });
    });
  });

  describe('Test unique parameter', () => {
    it('Patch the listschema so field4 is defined as unique', (done) => {
      chai.request(server)
          .patch('/api/listitem/' + listIdToPatch)
          .send({[Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": {"type": "string", encrypt}, "field4": {type: "string", unique}}'})
          .end((err, response) => {
             expect(response).to.have.status(200);
             expect(response.body).to.have.property(Globals.itemIdFieldName);
             expect(response.body).to.have.property(Globals.ownerIdFieldName, '60edb91162a87a2c383d5cf2');
             expect(response.body).to.have.property('rperm', '@owner1');
             expect(response.body).to.have.property('wperm', '@owner1');
             expect(response.body).to.have.property(Globals.listSchemaFieldName, '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": {"type": "string", encrypt}, "field4": {type: "string", unique}}');
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Post a duplicate list item', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.listIdFieldName]: listIdToPatch,
                 field1: "field1val1",
                 field2: "field2val1",
                 field4: "field4 value4"}
          )
          .end((err, response) => {
             expect(response).to.have.status(400);
             expect(response.body).to.be.an('object');
             expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_NotUnique, 'field4', 'field4 value4')});
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });

    it('Post a non duplicate list item', (done) => {
      chai.request(server)
          .post('/api/listitem')
          .send({[Globals.listIdFieldName]: listIdToPatch,
                 field1: "field1val1",
                 field2: "field2val1",
                 field4: "field4 value5"}
          )
          .end((err, response) => {
             expect(response).to.have.status(201);
             expect(response.body).to.be.an('object');
             expect(response.body).to.deep.equal({
              _listid: listIdToPatch,
              field1: "field1val1",
              field2: "FIELD2VAL1",
              field4: "field4 value5",
              _id: response.body._id
             });
             done();
             //console.log(JSON.stringify(response.body, null, 2));
          });
    });
  });
});