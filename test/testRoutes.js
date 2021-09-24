const chai = require('chai');
const chaihttp = require('chai-http');
const server = require('../index');
const bcrypt = require('bcrypt');
const libCookie = require('cookie');
const setCookie = require('set-cookie-parser');
const NodeUtil = require('util');

const Globals = require('../globals');
const Errors = require('../utils/errors');
const Utils = require('../utils/utils');

chai.use(chaihttp);

var expect = chai.expect;

var lists = [];

describe('testRoutes.js List API', () => {
  var listIdToPatch;
  var lastList;
  var twoItems;
  var lastItems;
  
  describe('1 - Invalid URL and DELETE ALL', () => {
    it('1.1 - Test an invalid URL. It should return a NOT FOUND on invalid URL', (done) => {
      chai.request(server)
          .get('/api/test')
          .end((err, response) => {
            expect(response).to.have.status(404);
            expect(response.body).to.deep.equal({});
            done();
        });
    });

    it('1.2 - Delete all the lists from the DB', (done) => {
      chai.request(server)
          .delete('/api/' + Globals.listitemAPIKeyword)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.have.all.keys('deletedCount');
            done();
          });
    });
  });

  describe('2 - POST and GET on list', () => {
    it('2.1 - Post a new list having an invalid field', (done) => {
      lastList = {
        ['x' + Globals.ownerFieldName]: 'p@gmail.com',
        [Globals.listConfPermFieldName]: '@listowner',
        [Globals.listWritePermFieldName]: '@listowner',
        [Globals.listReadPermFieldName]: '@ALL',
        [Globals.listSchemaFieldName]: '{}'
      };
      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(lastList)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, Globals.ownerFieldName)});
            done();
          });
    });

    it('2.2 - Post a new list having an invalid schema', (done) => {
      lastList = {
        ...lastList,
        [Globals.ownerFieldName]: 'p@gmail.com',
        [Globals.listSchemaFieldName]: 'toto: x'
      };
      delete lastList['x' + Globals.ownerFieldName];
      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(lastList)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchemaParameter, 'x', 'toto')});
            done();
          });
    });

    it('2.3 - Post a new, valid empty list', (done) => {
      lastList = {
        ...lastList,
        [Globals.listSchemaFieldName]: '{}'
      };
      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(lastList)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            lastList = {
              ...lastList,
              [Globals.listReadPermFieldName]: lastList[Globals.listReadPermFieldName].toLowerCase(),
              [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName]
            };
            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal(lastList);
            listIdToPatch = response.body[Globals.itemIdFieldName];
            done();
          });
    });

    it('2.4 - Get list with a malformed id', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/toto')
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.MalformedID, 'toto')});
            done();
          });
    });

    it('2.5 - Get list with an invalid id', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/6102f9efc3b25831e42fec8b')
          .end((err, response) => {
            expect(response).to.have.status(404);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, '6102f9efc3b25831e42fec8b')});
            done();
          });
    });

    it('2.6 - Get the last list by id', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .end((err, response) => {
            lastList = {
              ...lastList,
              items: []
            }
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(lastList);
            done();
          });
    });
  });

  describe('3 - PATCH on list', () => {
    var listPatch = {
      ['x' + Globals.listSchemaFieldName]: '{"field1": {"type": "string"}, "field2": {"type": "string"}}'
    };

    it('3.1 - Patch with an invalid id', (done) => {
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/aaaa')
          .send(listPatch)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.MalformedID, 'aaaa')});
            done();
          });
    });

    it('3.2 - Patch a non existing list', (done) => {
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/61156c3f52de9f98d61f9a23')
          .send(listPatch)
          .end((err, response) => {
            expect(response).to.have.status(404);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ListItem_NotFound, '61156c3f52de9f98d61f9a23')});
            done();
          });
    });

    it('3.3 - Patch the last list with an invalid field', (done) => {
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .send(listPatch)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidField, 'xlistschema')});
            done();
          });
    });

    it('3.4 - Patch the last list with a new listschema value', (done) => {
      listPatch = {
        [Globals.listSchemaFieldName]: '{"field1": {"type": "string", required}, "field2": {"type": "string", required}}'
      };

      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .send(listPatch)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            lastList = {
              ...lastList,
              ...listPatch,
            }
            delete lastList.items;
            expect(response).to.have.status(200);
            expect(response.body).to.deep.equal(lastList);
            done();
          });
    });
  });

  var firstItem;
  var secondItem;
  describe('4 - POST on ' + Globals.listitemAPIKeyword, () => {
    it('4.1 - Post a list item having no listid', (done) => {
      firstItem = {
        'field1': 'field1val1',
        'field2': 'field2val1'
      };

      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(firstItem)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, Globals.ownerFieldName)});
            done();
          });
    });
    it('4.2 - Post a list item having an invalid listid', (done) => {
      firstItem = {
        [Globals.listIdFieldName]: '60edb91162a87a2c383d5cf2', 
        'field1': 'field1val1',
        'field2': 'field2val1'
      };

      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(firstItem)
          .end((err, response) => {
            expect(response).to.have.status(404);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.List_NotFound, '60edb91162a87a2c383d5cf2')});
            done();
          });
    });

    it('4.3 - Post a list item having an invalid field', (done) => {
      firstItem = {
        ...firstItem,
        [Globals.listIdFieldName]: listIdToPatch
      };

      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send({...firstItem, field3: 'field3val1'})
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidField, 'field3')});
            done();
          });
    });

    it('4.4 - Post a list item with a missing field', (done) => {
      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send({
            [Globals.listIdFieldName]: listIdToPatch, 
            ...{field1: firstItem.field1}
          })
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_MissingField, 'field2')});
            done();
          });
    });

    it('4.5 - Post a first valid list item', (done) => {
      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(firstItem)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            firstItem = {
              ...firstItem,
              [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName]
            }
            lastItems = [Utils.objWithout(firstItem, Globals.listIdFieldName)];
            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal(firstItem);
            done();
          });
    });

    it('4.6 - Post a second list item', (done) => {
      secondItem = {
        [Globals.listIdFieldName]: listIdToPatch, 
        'field1': 'field1val2',
        'field2': 'field2val2'
      };

      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(secondItem)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            listItemIdToPatch = response.body[Globals.itemIdFieldName];
            secondItem = {
              ...secondItem,
              [Globals.itemIdFieldName]: listItemIdToPatch
            }
            lastItems.push(Utils.objWithout(secondItem, Globals.listIdFieldName));
            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal(secondItem);
            done();
          });
    });

    it('4.7 - Post two list items', (done) => {
      twoItems = {
        [Globals.listIdFieldName]: listIdToPatch, 
        items:[
          {
            'field1': 'field1val3',
            'field2': 'field2val3'
          },
          {
            'field1': 'field1val4',
            'field2': 'field2val4'
          }]
      };

      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(twoItems)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.have.property('insertedCount', 2);
            expect(response.body).to.have.property('insertedIds');
            twoItems.items[0][Globals.itemIdFieldName] = response.body.insertedIds[0];
            twoItems.items[1][Globals.itemIdFieldName] = response.body.insertedIds[1];
            lastItems = lastItems.concat(twoItems.items);
            done();
          });
    });

    it('4.8 - Get the list to check if new items were created', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal({
              ...lastList, 
              items: lastItems
            });
            done();
          });
    });

    it('4.9 - Get the list again but without the list of items', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch + '/noitems')
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(lastList);
            done();
          });
    });
  });

  describe('5 - PATCH on listitem', () => {
    it('5.1 - Patch the second list item with a non existing field', (done) => {
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listItemIdToPatch)
          .send({
            "field3": "field2 value222"
          })
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidField, 'field3')});
            done();
          });
    });

    it('5.2 - Patch the second list item with a value of the wrong type', (done) => {
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listItemIdToPatch)
          .send({
            "field2": 222
          })
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field2', '222', 'string')});
            done();
          });
    });

    it('5.3 - Patch the last list item', (done) => {
      const secondItemPatch = {
        "field2": "field2 value222"
      };

      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listItemIdToPatch)
          .send(secondItemPatch)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            secondItem = {
              ...secondItem,
              ...secondItemPatch
            }
            lastItems[1] = Utils.objWithout(secondItem, Globals.listIdFieldName);
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(secondItem);
            done();
          });
    });

    it('5.4 - Get the last posted item', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listItemIdToPatch)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.deep.equal(secondItem);
            done();
          });
    });

    it('5.5 - Get the list to check if new items were modified', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal({...lastList, items: lastItems});
            done();
          });
    });
  });

  describe('6 - Test upper, lower and encrypt', () => {
    it('6.1 - Patch the list with a new listschema value', (done) => {
      const newListSchema = {
        [Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}}'
      };
      lastList = {
        ...lastList,
        ...newListSchema
      };

      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .send(newListSchema)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.deep.equal(lastList);
            done();
          });
    });

    it('6.2 - Patch the last list item with values to be converted to upper and lowercase', (done) => {
      const secondItemPatch = {
        "field1": "LOWERcase",
        "field2": "upperCASE"
      };
      secondItem = {
        ...secondItem,
        ...{
          field1: secondItemPatch.field1.toLowerCase(),
          field2: secondItemPatch.field2.toUpperCase()
        }
      };

      lastItems[1] = Utils.objWithout(secondItem, Globals.listIdFieldName);

      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listItemIdToPatch)
          .send(secondItemPatch)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(secondItem);
            done();
          });
    });

    it('6.3 - Patch listschema so field3 is encrypted', (done) => {
      const listSchemaPatch = {
        [Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": {"type": "string", encrypt}}'
      };
      lastList = {
        ...lastList,
        ...listSchemaPatch
      };

      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .send(listSchemaPatch)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(lastList);
            done();
          });
    });

    it('6.4 - Patch the last list item with a values to be encrypted', (done) => {
      const pw = "encrypted string";
      const secondItemPatch = {
        "field3": pw
      };

      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listItemIdToPatch)
          .send(secondItemPatch)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            secondItem = {
              ...secondItem,
              ...{field3: response.body.field3}
            }
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(secondItem);
            expect(bcrypt.compareSync(pw, response.body.field3)).to.be.true;
            done();
          });
    });
  });

  describe('7 - Test "string", "number" and "encrypted_string" as basic types', () => {
    it('7.1 - Patch listschema with an invalid type for field4', (done) => {
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .send({[Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": "encrypted_string", "field4": "toto"}'})
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidSchemaParameter, 'toto', 'field4')});
            done();
          });
    });

    it('7.2 - Patch the listschema so field3 is defined as encrypted_string and field4 is defined as a basic string', (done) => {
      var listSchemaPatch = {
        [Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": "encrypted_string", "field4": "string"}'
      };
      lastList = {
        ...lastList,
        ...listSchemaPatch
      }
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .send(listSchemaPatch)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(lastList);
            done();
          });
    });

    it('7.3 - Patch with a non string value', (done) => {
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listItemIdToPatch)
          .send({"field4": 123})
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(
              {
                "err": NodeUtil.format(Errors.ErrMsg.ItemSchema_InvalidType, 'field4', '123', 'string')
              }
            );
            done();
          });
    });

    it('7.4 - Patch with a new password and a string', (done) => {
      const patch = {
        'field3': 'new password',
        'field4': 'field4 value4'
      }
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listItemIdToPatch)
          .send(patch)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            secondItem = {
              ...secondItem,
              ...{
                field3: response.body.field3,
                field4: 'field4 value4'
              }
            }
            lastItems[1] = Utils.objWithout(secondItem, Globals.listIdFieldName);

            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(secondItem);
            expect(bcrypt.compareSync("new password", response.body.field3)).to.be.true;
            done();
          });
    });
  });

  describe('8 - Test GET with filter', () => {
    it('8.1 - Test case sensitive constains returning something', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch + '?filter=$contains:[$field1, "field1val1"]')
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(
              {
                ...lastList,
                ...{items: lastItems.slice(0, 1)}
              }
            );
            done();
          });
    });

    it('8.2 - Test case insensitive constains', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch + '?filter=$contains_i:[$field1, "FIELd1val1"]')
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(
              {
                ...lastList,
                ...{items: lastItems.slice(0, 1)}
              }
            );
            done();
          });
    });

    it('8.3 - Test case sensitive constains returning nothing', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch + '?filter=$contains:[$field1, "xxx"]')
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(
              {
                ...lastList,
                ...{items: []}
              }
            );
            done();
          });
    });

    it('8.4 - Test successful case sensitive isexactly returning something', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch + '?filter=$isexactly:[$field1, "field1val1"]')
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(
              {
                ...lastList,
                ...{items: lastItems.slice(0, 1)}
              }
            );
            done();
          });
    });

    it('8.5 - Test case insensitive isexactly', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch + '?filter=$isexactly_i:[$field1, "FIeld1val1"]')
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(
              {
                ...lastList,
                ...{items: lastItems.slice(0, 1)}
              }
            );
            done();
          });
    });

    it('8.6 - Test successful case sensitive isexactly returning nothing', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch + '?filter=$isexactly:[$field1, "xxx"]')
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(
              {
                ...lastList,
                ...{items: []}
              }
            );
            done();
          });
    });
  });

  describe('9 - Test unique parameter', () => {
    it('9.1 - Patch the listschema so field4 is defined as unique', (done) => {
      var listSchemaPatch = {
        [Globals.listSchemaFieldName]: '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": "encrypted_string", "field4": {type: "string", unique}}'
      };
      lastList = {
        ...lastList,
        ...listSchemaPatch
      }
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .send(listSchemaPatch)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(lastList);
            done();
          });
    });

    it('9.2 - Post a duplicate list item', (done) => {
      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(
            {
              [Globals.listIdFieldName]: listIdToPatch,
              field1: "field1val5",
              field2: "field2val5",
              field4: "field4 value4"
            }
          )
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_NotUnique, 'field4', 'field4 value4')});
            done();
          });
    });

    it('9.3 - Post a non duplicate list item', (done) => {
      var dupListItem = 
            {
              [Globals.listIdFieldName]: listIdToPatch,
              field1: "field1val5",
              field2: "field2val5",
              field4: "field4 value5"
            };


      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(dupListItem)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            lastItems[4] = Utils.objWithout({
              ...dupListItem,
              field2: dupListItem.field2.toUpperCase(),
              [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName]
            }, Globals.listIdFieldName);
            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal(
              {
                ...dupListItem,
                field2: dupListItem.field2.toUpperCase(),
                [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName]
              }
            );
            done();
          });
    });

    it('9.4 - Patch with a duplicate list item', (done) => {
      chai.request(server)
          .patch('/api/' + Globals.listitemAPIKeyword + '/' + listItemIdToPatch)
          .send({field4: "field4 value4"})
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_NotUnique, 'field4', 'field4 value4')});
            done();
          });
    });
  });

  describe('10 - Test registration, login and authentification', () => {
    let lastToken;
    var cookies;
    var newUser;
    let pw = 'mypassword';
    
    it('10.1 - Create a users list', (done) => {
      const newUserList = 
        {
          [Globals.itemIdFieldName]: Globals.userListId,
          [Globals.ownerFieldName]: process.env.ADMIN_EMAIL,
          [Globals.listConfPermFieldName]: '@listowner',
          [Globals.listWritePermFieldName]: '@listowner',
          [Globals.listReadPermFieldName]: '@listowner',
          [Globals.listSchemaFieldName]: 'firstname: string, lastname: string, organisation: string, email: {type: email, required, unique, lower}, password: encrypted_string'
        };
      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(newUserList)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal(newUserList);
            done();
          });
    });

    it('10.2 - Register a new user', (done) => {
      newUser = {
        [Globals.listIdFieldName]: Globals.userListId,
        'firstname': 'Pedro',
        'lastname': 'Root',
        'organisation': 'Myself',
        'email': 'Pedro@gmail.com',
        'password': pw
      }
      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .send(newUser)
          .end((err, response) => {
            newUser = {
              ...newUser,
              ...{
                [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
                email: newUser.email.toLowerCase(),
                password: response.body.password
              }
            }
            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal(newUser);
            expect(bcrypt.compareSync(pw, response.body.password)).to.be.true;
            expect(response).to.have.cookie('authtoken');

            cookies = setCookie.parse(response);

            done();
          });
    });

    it('10.3 - Make sure the cookie is sent back from the server', (done) => {
      var newCookie = cookies.map(function(cookie) {
        return libCookie.serialize(cookie.name, cookie.value, cookie);
      });

      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .set('Cookie', newCookie)
          .end((err, response) => {
            lastList = {
              ...lastList,
              ...{items: lastItems}
            }
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(lastList);
            expect(response).to.have.cookie('authtoken');
            done();
          });
    });

    it('10.4 - Register another user with the same email', (done) => {
      const pw = 'mypassword';
      var newUser2 = {
        [Globals.listIdFieldName]: Globals.userListId,
        'firstname': 'Pedro2',
        'lastname': 'Root2',
        'organisation': 'Myself2',
        'email': 'Pedro@gmail.com',
        'password': pw
      }

      var newCookie = cookies.map(function(cookie) {
        return libCookie.serialize(cookie.name, cookie.value, cookie);
      });

      chai.request(server)
          .post('/api/' + Globals.listitemAPIKeyword)
          .set('Cookie', newCookie)
          .send(newUser2)
          .end((err, response) => {
            expect(response).to.have.status(400);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.ItemSchema_NotUnique, 'email', 'pedro@gmail.com')});
            done();
          });
    });

    it('10.5 - Logout the user', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/logout')
          .send()
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.an('object');
            expect(response).not.to.have.cookie('authtoken');
            done();
          });
    });

    it('10.6 - Login the user using an invalid email', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/login')
          .auth('x' + newUser.email, pw)
          .end((err, response) => {
            expect(response).to.have.status(401);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.InvalidUser)});
            expect(response).not.to.have.cookie('authtoken');
            done();
          });
    });
    
    it('10.7 - Login the user using an invalid password', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/login')
          .auth(newUser.email, 'x' + pw)
          .end((err, response) => {
            expect(response).to.have.status(401);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal({"err": NodeUtil.format(Errors.ErrMsg.CouldNotLogin)});
            expect(response).not.to.have.cookie('authtoken');
            done();
          });
    });

    it('10.8 - Login the user', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/login')
          .auth(newUser.email, pw)
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.an('object');
            expect(response).to.have.cookie('authtoken');
            done();
          });
    });

    it('10.9 - Logout the user', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/logout')
          .send()
          .end((err, response) => {
            expect(response).to.have.status(200);
            expect(response.body).to.be.an('object');
            expect(response).not.to.have.cookie('authtoken');
            done();
          });
    });

    it('10.10 - Get the last list with authorization', (done) => {
      chai.request(server)
          .get('/api/' + Globals.listitemAPIKeyword + '/' + listIdToPatch)
          .auth(newUser.email, pw)
          .end((err, response) => {
            lastList = {
              ...lastList,
              items: lastItems
            }
            expect(response).to.have.status(200);
            expect(response.body).to.be.a('object');
            expect(response.body).to.deep.equal(lastList);
            expect(response).to.have.cookie('authtoken');
            done();
          });
    });
  });
});