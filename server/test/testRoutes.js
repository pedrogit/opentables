const chai = require("chai");
const chaihttp = require("chai-http");
const bcrypt = require("bcrypt");
const libCookie = require("cookie");
const setCookie = require("set-cookie-parser");
const NodeUtil = require("util");

const Globals = require("../../client/src/common/globals");
const Errors = require("../../client/src/common/errors");
const Utils = require("../../client/src/common/utils");

const server = require("../index");
const controler = require("../src/controler");

controler.init();

chai.use(chaihttp);

var expect = chai.expect;

var lists = [];

describe("testRoutes.js List API", () => {
  var listIdToPatch;
  var lastList;
  var twoItems;
  var lastItems;
  var listOfAllList = { ...Globals.listOfAllLists };
  var userList;

  describe("1 - Invalid URL and DELETE ALL", () => {
    it("1.1 - Test an invalid URL. It should return a NOT FOUND on invalid URL", (done) => {
      chai
        .request(server)
        .get("/api/test")
        .end((err, response) => {
          expect(response).to.have.status(404);
          expect(response.body).to.deep.equal({});
          done();
        });
    });

    it("1.2 - Delete all lists from DB", (done) => {
      chai
        .request(server)
        .delete("/api/" + Globals.APIKeyword)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.have.all.keys("deletedCount");
          done();
        });
    });
  });

  describe("2 - POST and GET on list", () => {
    it("2.1 - Post a new list having an invalid field", (done) => {
      lastList = {
        name: "First test list",
        ["x" + Globals.ownerFieldName]: "p@gmail.com",
        [Globals.readWritePermFieldName]: "@owner",
        [Globals.itemReadWritePermFieldName]: "@owner",
        [Globals.itemReadPermFieldName]: "@ALL",
        [Globals.listSchemaFieldName]: "{}",
      };
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + Globals.listofAllListId)
        .send(lastList)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_MissingProp,
              Globals.ownerFieldName
            ),
          });
          done();
        });
    });

    it("2.2 - Post a new list having an invalid schema", (done) => {
      lastList = {
        ...lastList,
        [Globals.ownerFieldName]: "p@gmail.com",
        [Globals.listSchemaFieldName]: "toto: x",
      };
      delete lastList["x" + Globals.ownerFieldName];
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + Globals.listofAllListId)
        .send(lastList)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.Schema_InvalidSchema,
              '"' + lastList[Globals.listSchemaFieldName] + '"'
            ),
          });
          done();
        });
    });

    it("2.3 - Post a new, valid empty list", (done) => {
      lastList = {
        ...lastList,
        [Globals.listSchemaFieldName]: "{}",
      };
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + Globals.listofAllListId)
        .send(lastList)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          lastList = {
            ...lastList,
            [Globals.itemReadPermFieldName]:
              lastList[Globals.itemReadPermFieldName].toLowerCase(),
            [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName]
          };
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          listIdToPatch = response.body[Globals.itemIdFieldName];
          done();
        });
    });
    
    it("2.4 - Get list with no listid", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword)
        //.auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          var expectedView = {
            ...Utils.objWithout(Globals.viewOnTheListOfAllViews, Globals.childlistFieldName),
            [Globals.listIdFieldName]: '000000000000000000000002',
            [Globals.itemIdFieldName]: '000000000000000000000004'
          }
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(Utils.objWithout(response.body, Globals.childlistFieldName))
           .to.deep.equal(expectedView);
          done();
        });
    });

    it("2.5 - Get list with a malformed id", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/toto")
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(Errors.ErrMsg.MalformedID, "toto"),
          });
          done();
        });
    });

    it("2.6 - Get list with an invalid id", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/6102f9efc3b25831e42fec8b")
        .end((err, response) => {
          expect(response).to.have.status(404);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.Item_NotFound,
              "6102f9efc3b25831e42fec8b"
            ),
          });
          done();
        });
    });

    it("2.7 - Get the last list by id", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .end((err, response) => {
          lastList = {
            ...lastList,
          };
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("2.8 - Try to post a new list with an already existing id", (done) => {
      lastList = {
        ...lastList,
        [Globals.listSchemaFieldName]: "{}",
      };
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + Globals.listofAllListId)
        .send(lastList)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.Item_AlreadyExists,
              listIdToPatch
            ),
          });
          done();
        });
    });
  });

  describe("3 - PATCH on list", () => {
    var listPatch = {
      ["x" + Globals.listSchemaFieldName]:
        '{"field1": {"type": "string"}, "field2": {"type": "string"}}',
    };

    it("3.1 - Patch with an invalid id", (done) => {
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/aaaa")
        .send(listPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(Errors.ErrMsg.MalformedID, "aaaa"),
          });
          done();
        });
    });

    it("3.2 - Patch a non existing list", (done) => {
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/61156c3f52de9f98d61f9a23")
        .send(listPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(404);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.Item_NotFound,
              "61156c3f52de9f98d61f9a23"
            ),
          });
          done();
        });
    });

    it("3.3 - Patch the last list with an invalid field", (done) => {
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(listPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_InvalidProp,
              "xlistschema"
            ),
          });
          done();
        });
    });

    it("3.4 - Patch the last list with a new listschema value", (done) => {
      listPatch = {
        [Globals.listSchemaFieldName]:
          '{"field1": {"type": "string", required}, "field2": {"type": "string", required}}',
      };

      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(listPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          lastList = {
            ...lastList,
            ...listPatch,
          };
          delete lastList.items;

          expect(response).to.have.status(200);
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });
  });

  var firstItem;
  var secondItem;
  var defaultItem;
  describe("4 - POST on " + Globals.APIKeyword, () => {
    it("4.1 - Post a list item without listid", (done) => {
      firstItem = {
        field1: "field1val1",
        field2: "field2val1",
      };

      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword)
        .send(firstItem)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(404);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: Errors.ErrMsg.List_Missing
          });
          done();
        });
    });
    it("4.2 - Post a list item to an invalid listid", (done) => {
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/60edb91162a87a2c383d5cf2")
        .send(firstItem)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(404);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.List_NotFound,
              "60edb91162a87a2c383d5cf2"
            ),
          });
          done();
        });
    });

    it("4.3 - Post a list item having an invalid field", (done) => {
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send({ ...firstItem, field3: "field3val1" })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_InvalidProp,
              "field3"
            ),
          });
          done();
        });
    });

    it("4.4 - Post a list item with a missing field", (done) => {
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send({ field1: firstItem.field1 })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_MissingProp,
              "field2"
            ),
          });
          done();
        });
    });

    it("4.5 - Post a first valid list item", (done) => {
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(firstItem)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          firstItem = {
            ...firstItem,
            [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
          };
          lastItems = [Utils.objWithout(firstItem, Globals.listIdFieldName)];
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...firstItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          done();
        });
    });

    it("4.6 - Post a second list item", (done) => {
      secondItem = {
        field1: "field1val2",
        field2: "field2val2",
      };

      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(secondItem)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          itemIdToPatch = response.body[Globals.itemIdFieldName];
          secondItem = {
            ...secondItem,
            [Globals.itemIdFieldName]: itemIdToPatch,
          };
          lastItems.push(Utils.objWithout(secondItem, Globals.listIdFieldName));
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...secondItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          done();
        });
    });

    it("4.7 - Post two list items", (done) => {
      twoItems = [
        {
          field1: "field1val3",
          field2: "field2val3",
        },
        {
          field1: "field1val4",
          field2: "field2val4",
        },
      ];

      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(twoItems)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.have.property("insertedCount", 2);
          expect(response.body).to.have.property("insertedIds");
          twoItems[0][Globals.itemIdFieldName] =
            response.body.insertedIds[0];
          twoItems[1][Globals.itemIdFieldName] =
            response.body.insertedIds[1];
          lastItems = lastItems.concat(twoItems);
          done();
        });
    });

    it("4.8 - Get the list to check if new items were created", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            items: lastItems,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("4.9 - Get the list again but without the list of items", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/" + listIdToPatch + "/?noitems=true")
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("4.10 - Post a new empty list item (constructed from default values)", (done) => {
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          defaultItem = {
            "field1" : "field1",
            "field2" : "field2",
            [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
          };
          lastItems.push(Utils.objWithout(defaultItem, Globals.listIdFieldName));
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...defaultItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          done();
        });
    });
  });

  describe("5 - PATCH on item", () => {
    it("5.1 - Patch the second list item with a non existing field", (done) => {
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .send({
          field3: "field2 value222",
        })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_InvalidProp,
              "field3"
            ),
          });
          done();
        });
    });

    it("5.2 - Patch the second list item with a value of the wrong type", (done) => {
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .send({
          field2: 222,
        })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_InvalidType,
              "field2",
              "222",
              "string"
            ),
          });
          done();
        });
    });

    it("5.3 - Patch the last list item to its default value", (done) => {
      const secondItemPatch = {
        field2: "",
      };

      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .send(secondItemPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          secondItem = {
            ...secondItem,
            field2: "field2",
          };
          lastItems[1] = Utils.objWithout(secondItem, Globals.listIdFieldName);
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...secondItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          done();
        });
    });

    it("5.4 - Get the last posted item", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.deep.equal({
            ...secondItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          done();
        });
    });

    it("5.5 - Patch the last list item", (done) => {
      const secondItemPatch = {
        field2: "field2 value222",
      };

      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .send(secondItemPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          secondItem = {
            ...secondItem,
            ...secondItemPatch,
          };
          lastItems[1] = Utils.objWithout(secondItem, Globals.listIdFieldName);
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...secondItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          done();
        });
    });

    it("5.6 - Get the last posted item", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.deep.equal({
            ...secondItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          done();
        });
    });

    it("5.7 - Get the list to check if new items were modified", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            items: lastItems,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });
  });

  describe("6 - Test upper, lower and encrypt", () => {
    it("6.1 - Patch the list with a new listschema value", (done) => {
      const newListSchema = {
        [Globals.listSchemaFieldName]:
          '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}}',
      };
      lastList = {
        ...lastList,
        ...newListSchema,
      };

      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(newListSchema)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("6.2 - Patch the last list item with values to be converted to upper and lowercase", (done) => {
      const secondItemPatch = {
        field1: "LOWERcase",
        field2: "upperCASE",
      };
      secondItem = {
        ...secondItem,
        ...{
          field1: secondItemPatch.field1.toLowerCase(),
          field2: secondItemPatch.field2.toUpperCase(),
        },
      };

      lastItems[1] = Utils.objWithout(secondItem, Globals.listIdFieldName);

      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .send(secondItemPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...secondItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          done();
        });
    });

    it("6.3 - Patch listschema so field3 is encrypted", (done) => {
      const listSchemaPatch = {
        [Globals.listSchemaFieldName]:
          '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": {"type": "string", encrypt}}',
      };
      lastList = {
        ...lastList,
        ...listSchemaPatch,
      };

      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(listSchemaPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("6.4 - Patch the last list item with a values to be encrypted", (done) => {
      const pw = "encrypted string";
      const secondItemPatch = {
        field3: pw,
      };

      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .send(secondItemPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          secondItem = {
            ...secondItem,
            ...{ field3: response.body.field3 },
          };
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...secondItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          expect(bcrypt.compareSync(pw, response.body.field3)).to.be.true;
          done();
        });
    });
  });

  describe('7 - Test "string", "number" and "encrypted_string" as basic types', () => {
    it("7.1 - Patch listschema with an invalid type for field4", (done) => {
      var invalidSchema =
        '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": "encrypted_string", "field4": "toto"}';
      //var invalidSchema = "{\"field1\": {\"type\": \"string\", required, lower}, \"field2\": {\"type\": \"string\", required, upper}, \"field3\": \"encrypted_string\", \"field4\": \"toto\"}";
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send({ [Globals.listSchemaFieldName]: invalidSchema })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.Schema_InvalidSchema,
              '"' + invalidSchema + '"'
            ),
          });
          done();
        });
    });

    it("7.2 - Patch the listschema so field3 is defined as encrypted_string and field4 is defined as a basic string", (done) => {
      var listSchemaPatch = {
        [Globals.listSchemaFieldName]:
          '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": "encrypted_string", "field4": "string"}',
      };
      lastList = {
        ...lastList,
        ...listSchemaPatch,
      };
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(listSchemaPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("7.3 - Patch with a non string value", (done) => {
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .send({ field4: 123 })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_InvalidType,
              "field4",
              "123",
              "string"
            ),
          });
          done();
        });
    });

    it("7.4 - Patch with a new password and a string", (done) => {
      const patch = {
        field3: "new password",
        field4: "field4 value4",
      };
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .send(patch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          secondItem = {
            ...secondItem,
            ...{
              field3: response.body.field3,
              field4: "field4 value4",
            },
          };
          lastItems[1] = Utils.objWithout(secondItem, Globals.listIdFieldName);

          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...secondItem,
            [Globals.listIdFieldName]: listIdToPatch
          });
          expect(bcrypt.compareSync("new password", response.body.field3)).to.be
            .true;
          done();
        });
    });
  });

  describe("8 - Test GET with filter", () => {
    it("8.1 - Test case sensitive constains returning something", (done) => {
      chai
        .request(server)
        .get(
          "/api/" +
            Globals.APIKeyword +
            "/" +
            listIdToPatch +
            '?filter=$contains:[$field1, "field1val1"]'
        )
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            ...{ items: lastItems.slice(0, 1) },
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("8.2 - Test case insensitive constains", (done) => {
      chai
        .request(server)
        .get(
          "/api/" +
            Globals.APIKeyword +
            "/" +
            listIdToPatch +
            '?filter=$contains_i:[$field1, "FIELd1val1"]'
        )
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            ...{ items: lastItems.slice(0, 1) },
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("8.3 - Test case sensitive constains returning nothing", (done) => {
      chai
        .request(server)
        .get(
          "/api/" +
            Globals.APIKeyword +
            "/" +
            listIdToPatch +
            '?filter=$contains:[$field1, "xxx"]'
        )
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("8.4 - Test successful case sensitive isexactly returning something", (done) => {
      chai
        .request(server)
        .get(
          "/api/" +
            Globals.APIKeyword +
            "/" +
            listIdToPatch +
            '?filter=$isexactly:[$field1, "field1val1"]'
        )
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            ...{ items: lastItems.slice(0, 1) },
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("8.5 - Test case insensitive isexactly", (done) => {
      chai
        .request(server)
        .get(
          "/api/" +
            Globals.APIKeyword +
            "/" +
            listIdToPatch +
            '?filter=$isexactly_i:[$field1, "FIeld1val1"]'
        )
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            ...{ items: lastItems.slice(0, 1) },
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("8.6 - Test successful case sensitive isexactly returning nothing", (done) => {
      chai
        .request(server)
        .get(
          "/api/" +
            Globals.APIKeyword +
            "/" +
            listIdToPatch +
            '?filter=$isexactly:[$field1, "xxx"]'
        )
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });
  });

  describe("9 - Test unique parameter", () => {
    it("9.1 - Patch the listschema with field4 defined as unique", (done) => {
      var listSchemaPatch = {
        [Globals.listSchemaFieldName]:
          '{"field1": {"type": "string", required, lower}, "field2": {"type": "string", required, upper}, "field3": "encrypted_string", "field4": {type: "string", unique}}',
      };
      lastList = {
        ...lastList,
        ...listSchemaPatch,
      };

      // add the list to the list of lists for further test
      listOfAllList["items"] = [];
      listOfAllList["items"].push(lastList);

      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(listSchemaPatch)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          done();
        });
    });

    it("9.2 - Post a duplicate list item", (done) => {
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send({
          field1: "field1val5",
          field2: "field2val5",
          field4: "field4 value4",
        })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_NotUnique,
              "field4",
              "field4 value4"
            ),
          });
          done();
        });
    });

    it("9.3 - Post a non duplicate list item", (done) => {
      var dupItem = {
        field1: "field1val5",
        field2: "field2val5",
        field4: "field4 value5",
      };

      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .send(dupItem)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          lastItems.push(Utils.objWithout(
            {
              ...dupItem,
              field2: dupItem.field2.toUpperCase(),
              [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
            },
            Globals.listIdFieldName
          ));
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          itemIdToPatch = response.body[Globals.itemIdFieldName];
          expect(response.body).to.deep.equal({
            ...dupItem,
            field2: dupItem.field2.toUpperCase(),
            [Globals.itemIdFieldName]: itemIdToPatch,
            [Globals.listIdFieldName]: listIdToPatch
          });
          done();
        });
    });

    it("9.4 - Patch with a duplicate list item", (done) => {
      chai
        .request(server)
        .patch("/api/" + Globals.APIKeyword + "/" + itemIdToPatch)
        .send({ field4: "field4 value4" })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_NotUnique,
              "field4",
              "field4 value4"
            ),
          });
          done();
        });
    });
  });

  describe("10 - Test registration, login and authentification", () => {
    let lastToken;
    var cookies;
    var newUser;
    let pw = "mypassword";

    it("10.1 - Register a new user", (done) => {
      newUser = {
        username: "User1Username",
        [Globals.emailFieldName]: "user1@gmail.com",
        password: pw,
      };
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + Globals.userListId)
        .send(newUser)
        .end((err, response) => {
          newUser = {
            ...newUser,
            ...{
              [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
              [Globals.emailFieldName]: newUser[Globals.emailFieldName].toLowerCase(),
              password: response.body.password,
            },
          };

          userList = [newUser];

          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...newUser,
            [Globals.listIdFieldName]: Globals.userListId
          });
          expect(bcrypt.compareSync(pw, response.body.password)).to.be.true;
          expect(response).to.have.cookie("authtoken");

          cookies = setCookie.parse(response);

          done();
        });
    });

    it("10.2 - Make sure the cookie is sent back from the server", (done) => {
      var newCookie = cookies.map(function (cookie) {
        return libCookie.serialize(cookie.name, cookie.value, cookie);
      });

      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .set("Cookie", newCookie)
        .end((err, response) => {
          lastList = {
            ...lastList,
            ...{ items: lastItems },
          };
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          expect(response).to.have.cookie("authtoken");
          done();
        });
    });

    it("10.3 - Register another user with the same email", (done) => {
      const pw = "mypassword";
      var newUser2 = {
        username: "Bad",
        [Globals.emailFieldName]: newUser[Globals.emailFieldName],
        password: pw,
      };

      var newCookie = cookies.map(function (cookie) {
        return libCookie.serialize(cookie.name, cookie.value, cookie);
      });

      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + Globals.userListId)
        .set("Cookie", newCookie)
        .send(newUser2)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.SchemaValidator_NotUnique,
              Globals.emailFieldName,
              newUser[Globals.emailFieldName]
            ),
          });
          done();
        });
    });

    it("10.4 - Logout the user", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/logout")
        .send()
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response).not.to.have.cookie("authtoken");
          done();
        });
    });

    it("10.5 - Login the user using an invalid email", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/login")
        .auth("x" + newUser[Globals.emailFieldName], pw)
        .end((err, response) => {
          expect(response).to.have.status(401);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(Errors.ErrMsg.InvalidUser),
          });
          expect(response).not.to.have.cookie("authtoken");
          done();
        });
    });

    it("10.6 - Login the user using an invalid password", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/login")
        .auth(newUser[Globals.emailFieldName], "x" + pw)
        .end((err, response) => {
          expect(response).to.have.status(401);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(Errors.ErrMsg.CouldNotLogin),
          });
          expect(response).not.to.have.cookie("authtoken");
          done();
        });
    });

    it("10.7 - Login the user", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/login")
        .auth(newUser[Globals.emailFieldName], pw)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response).to.have.cookie("authtoken");
          done();
        });
    });

    it("10.8 - Logout the user", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/logout")
        .send()
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response).not.to.have.cookie("authtoken");
          done();
        });
    });

    it("10.9 - Get the last list with authorization", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/" + listIdToPatch)
        .auth(newUser[Globals.emailFieldName], pw)
        .end((err, response) => {
          lastList = {
            ...lastList,
            items: lastItems,
          };
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body).to.deep.equal({
            ...lastList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          expect(response).to.have.cookie("authtoken");
          done();
        });
    });
  });

  describe("11 - Test get all lists", () => {
    it("11.1 - Add an extra list", (done) => {
      newList = {
        ...lastList,
        name: "Extra list",
        [Globals.listSchemaFieldName]: "{}",
      };
      delete newList.items;
      delete newList[Globals.itemIdFieldName];
      delete newList[Globals.listIdFieldName];
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + Globals.listofAllListId)
        .send(newList)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          newList = {
            ...newList,
            [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
          };
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...newList,
            [Globals.listIdFieldName]: Globals.listofAllListId
          });
          listOfAllList.items.push(newList);
          done();
        });
    });

    it("11.2 - Get the list of all lists (except the list of users)", (done) => {
      chai
        .request(server)
        .get("/api/" + Globals.APIKeyword + "/" + Globals.listofAllListId)
        //.auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          //listOfAllList.items.push(Globals.listOfUsers);
          listOfAllList.items.unshift(Globals.listOfUsers);
          listOfAllList.items[0]._id = listOfAllList.items[0]._id.toString();
          listOfAllList.items.forEach(function (v) {
            delete v[Globals.listIdFieldName];
          });

          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...listOfAllList,
            [Globals.listIdFieldName]: Globals.voidListId
          });
          done();
        });
    });
  });

  describe("12 - Test views", () => {
    var newView;

    it("12.1 - Create a new view", (done) => {
      newView = {
        name: "First view",
        [Globals.ownerFieldName]: "p@gmail.com",
        [Globals.readWritePermFieldName]: "@owner",
        item_template: "",
        [Globals.childlistFieldName]: listIdToPatch,
      };
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + Globals.listofAllViewId)
        .send(newView)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          newView = {
            ...newView,
            [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
          };
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...newView,
            [Globals.listIdFieldName]: Globals.listofAllViewId
          });
          done();
        });
    });

    it("12.2 - Get the view with the embedded list and the list items", (done) => {
      chai
        .request(server)
        .get(
          "/api/" + Globals.APIKeyword + "/" + newView[Globals.itemIdFieldName]
        )
        //.auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...newView,
            [Globals.childlistFieldName]: {
              ...lastList,
              [Globals.listIdFieldName]: Globals.listofAllListId
            },
            [Globals.listIdFieldName]: Globals.listofAllViewId,
          });
          done();
        });
    });

    it("12.3 - Patch the view with a new item_template", (done) => {
      newView = {
        ...newView,
        item_template: "[[field1]]",
      };
      chai
        .request(server)
        .patch(
          "/api/" + Globals.APIKeyword + "/" + newView[Globals.itemIdFieldName]
        )
        .send({ item_template: newView.item_template })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...newView,
            [Globals.listIdFieldName]: Globals.listofAllViewId
          });
          done();
        });
    });

    it("12.4 - Delete the view", (done) => {
      chai
        .request(server)
        .delete(
          "/api/" + Globals.APIKeyword + "/" + newView[Globals.itemIdFieldName]
        )
        .send({ item_template: newView.item_template })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            deletedCount: 1
          });
          done();
        });
    });

    it("12.5 - Make sure it was deleted", (done) => {
      chai
        .request(server)
        .get(
          "/api/" + Globals.APIKeyword + "/" + newView[Globals.itemIdFieldName]
        )
        .send({ item_template: newView.item_template })
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(404);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            err: NodeUtil.format(
              Errors.ErrMsg.Item_NotFound,
              newView[Globals.itemIdFieldName]
            ),
          });
          done();
        });
    });
  });

  describe("13 - Test user view", () => {
    it("13.1 - Get the user list", (done) => {
      chai
        .request(server)
        .get(
          "/api/" + Globals.APIKeyword + "/" + Globals.viewOnUserListViewId
        )
        //.auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");
          var expected = {
            ...Globals.viewOnTheListOfUsers,
            [Globals.childlistFieldName]: {
              ...Globals.listOfUsers,
              [Globals.listIdFieldName]: Globals.listofAllListId,
              items: userList
            },
            [Globals.listIdFieldName]: Globals.listofAllViewId
          }
          expect(Utils.objWithout(response.body, Globals.childlistFieldName)).to.deep.equal(Utils.objWithout(expected, Globals.childlistFieldName));
          expect(Utils.objWithout(response.body[Globals.childlistFieldName], 'items')).to.deep.equal(Utils.objWithout(expected[Globals.childlistFieldName], 'items'));
          expect(response.body[Globals.childlistFieldName].items).to.deep.equal(expected[Globals.childlistFieldName].items);
          done();
        });
    });

    var pw = "user2Password"
    var user2 = {
      username: "User2Username",
      [Globals.emailFieldName]: "User2@gmail.com",
      password: pw,
    };

    it("13.2 - Register a new user", (done) => {
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword + "/" + Globals.userListId)
        .send(user2)
        .end((err, response) => {
          user2 = {
            ...user2,
            ...{
              [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
              [Globals.emailFieldName]: user2[Globals.emailFieldName].toLowerCase(),
              password: response.body.password,
            },
          };

          userList.push(user2)

          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal({
            ...user2,
            [Globals.listIdFieldName]: Globals.userListId
          });
          expect(bcrypt.compareSync(pw, response.body.password)).to.be.true;
          expect(response).to.have.cookie("authtoken");

          cookies = setCookie.parse(response);

          done();
        });
    });

    it("13.2 - Get the user list filtered to a single user", (done) => {
      chai
        .request(server)
        .get(
          "/api/" + Globals.APIKeyword + "/" + Globals.viewOnUserListViewId + "?filter=$isexactly_i:[$" + [Globals.emailFieldName] + ",\"" + user2[Globals.emailFieldName] + "\"]"
        )
        //.auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");

          var expected = {
            ...Globals.viewOnTheListOfUsers,
            [Globals.childlistFieldName]: {
              ...Globals.listOfUsers,
              [Globals.listIdFieldName]: Globals.listofAllListId,
              items: [user2]
            },
            [Globals.listIdFieldName]: Globals.listofAllViewId
          }
          expect(Utils.objWithout(response.body, Globals.childlistFieldName)).to.deep.equal(Utils.objWithout(expected, Globals.childlistFieldName));
          expect(Utils.objWithout(response.body[Globals.childlistFieldName], 'items')).to.deep.equal(Utils.objWithout(expected[Globals.childlistFieldName], 'items'));
          expect(response.body[Globals.childlistFieldName].items).to.deep.equal(expected[Globals.childlistFieldName].items);
          done();
        });
    });

    it("13.3 - Get the user list without items", (done) => {
      chai
        .request(server)
        .get(
          "/api/" + Globals.APIKeyword + "/" + Globals.viewOnUserListViewId + "/?noitems=true"
        )
        //.auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an("object");

          var expected = {
            ...Globals.viewOnTheListOfUsers,
            [Globals.childlistFieldName]: {
              ...Globals.listOfUsers,
              [Globals.listIdFieldName]: Globals.listofAllListId
            },
            [Globals.listIdFieldName]: Globals.listofAllViewId
          }
          expect(response.body).to.deep.equal(expected);
          done();
        });
    });

  });

  /*describe('13 - Test embedded_itemid and embedded_itemid_lists', () => {
    var refItemListId;
    var firstItemId;
    var secondItemId;
    var thirdItemId;
    var embView;

    it('13.1 - Add a list of referenced items', (done) => {
      refItemList = {
        [Globals.listIdFieldName]: Globals.listofAllListId,
        name: 'List of referenced items',
        [Globals.ownerFieldName]: 'pedro@gmail.com', 
        [Globals.readWritePermFieldName]: '@owner',
        [Globals.itemReadWritePermFieldName]: '@owner',
        [Globals.itemReadPermFieldName]: '@all',
        [Globals.listSchemaFieldName] :  'name: string, ref_item: embedded_itemid, ref_items: embedded_itemid_list'
      };
      chai.request(server)
          .post('/api/' + Globals.APIKeyword)
          .send(refItemList)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            refItemListId = response.body[Globals.itemIdFieldName];
            refItemList = {
              ...refItemList,
              [Globals.itemIdFieldName]: refItemListId
            };
            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal(refItemList);
            done();
          });
    });

    it('13.2 - Post one item to this list', (done) => {
      item = {
        [Globals.listIdFieldName]: refItemListId, 
        name: 'Item 1',
        ref_item: '',
        ref_items: []
      };

      chai.request(server)
        .post('/api/' + Globals.APIKeyword)
        .send(item)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          firstItemId = response.body[Globals.itemIdFieldName];
          item = {
            ...item,
            [Globals.itemIdFieldName]: firstItemId
          };
          expect(response).to.have.status(201);
          expect(response.body).to.be.an('object');
          expect(response.body).to.deep.equal(item);
          done();
        });
    });

    it('13.3 - Post a second item referencing the first', (done) => {
      item = {
        [Globals.listIdFieldName]: refItemListId, 
        name: 'Item 2',
        ref_item: firstItemId,
        ref_items: [firstItemId]
      };

      chai.request(server)
        .post('/api/' + Globals.APIKeyword)
        .send(item)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          secondItemId = response.body[Globals.itemIdFieldName];
          item = {
            ...item,
            [Globals.itemIdFieldName]: secondItemId
          };
          expect(response).to.have.status(201);
          expect(response.body).to.be.an('object');
          expect(response.body).to.deep.equal(item);
          done();
        });
    });

    it('13.4 - Post a third item referencing the two first ones', (done) => {
      item = {
        [Globals.listIdFieldName]: refItemListId, 
        name: 'Item 3',
        ref_item: secondItemId,
        ref_items: [firstItemId, secondItemId]
      };

      chai.request(server)
        .post('/api/' + Globals.APIKeyword)
        .send(item)
        .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
        .end((err, response) => {
          thirdItemId = response.body[Globals.itemIdFieldName];
          item = {
            ...item,
            [Globals.itemIdFieldName]: thirdItemId
          };
          expect(response).to.have.status(201);
          expect(response.body).to.be.an('object');
          expect(response.body).to.deep.equal(item);
          done();
        });
    });

    it('13.4 - Create a view on the list', (done) => {
      embView = {
        [Globals.listIdFieldName]: Globals.listofAllViewId,
        name: 'View on embedded items',
        [Globals.ownerFieldName]: 'p@gmail.com',
        [Globals.readWritePermFieldName]: '@owner',
        item_template: '',
        [Globals.childlistFieldName]: refItemListId
      };
      chai.request(server)
          .post('/api/' + Globals.APIKeyword)
          .send(embView)
          .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
          .end((err, response) => {
            embView = {
              ...embView,
              [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName]
            };
            expect(response).to.have.status(201);
            expect(response.body).to.be.an('object');
            expect(response.body).to.deep.equal(embView);
            done();
          });
    });

    it('13.5 - Get the view with the embedded list and the embedded list items', (done) => {
      chai.request(server)
      .get('/api/' + Globals.APIKeyword + '/' + embView[Globals.itemIdFieldName])
      //.auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
      .end((err, response) => {
        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.deep.equal(
          {
            ...embView,
            [Globals.childlistFieldName]: lastList
          });
        done();
      });
    });
  });*/
});
