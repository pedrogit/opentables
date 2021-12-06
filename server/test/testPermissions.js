const chai = require("chai");
const chaihttp = require("chai-http");
const csv = require("csvtojson");
const path = require("path");
const bcrypt = require("bcrypt");

const Globals = require("../../client/src/common/globals");
const Errors = require("../../client/src/common/errors");

const server = require("../index");
const controler = require("../controler");

controler.init();

chai.use(chaihttp);

var expect = chai.expect;

let pw = "mypassword";

function userEmail(user) {
  return user == "admin"
    ? process.env.ADMIN_EMAIL
    : user == "owner"
    ? "owner@gmail.com"
    : user == "auth"
    ? "other@gmail.com"
    : "";
}

function userPw(user) {
  return user == "admin"
    ? process.env.ADMIN_PASSWORD
    : user == "owner"
    ? pw
    : user == "auth"
    ? pw
    : "";
}

function reset() {
  it("1 - Delete all the lists from the DB", (done) => {
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
}

function init() {
  describe("Initialize permission tests", () => {
    var cookies;
    var newUser;

    reset();

    it("2 - Register the owner user", (done) => {
      newUser = {
        [Globals.listIdFieldName]: Globals.userListId,
        firstname: "The",
        lastname: "Owner",
        organisation: "Myself",
        email: "owner@gmail.com",
        password: pw,
      };
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword)
        .send(newUser)
        .end((err, response) => {
          newUser = {
            ...newUser,
            ...{
              [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
              email: newUser.email.toLowerCase(),
              password: response.body.password,
            },
          };
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal(newUser);
          expect(bcrypt.compareSync(pw, response.body.password)).to.be.true;
          expect(response).to.have.cookie("authtoken");
          done();
        });
    });

    it("3 - Register the other user", (done) => {
      newUser = {
        [Globals.listIdFieldName]: Globals.userListId,
        firstname: "The",
        lastname: "Other",
        organisation: "Itself",
        email: "other@gmail.com",
        password: pw,
      };
      chai
        .request(server)
        .post("/api/" + Globals.APIKeyword)
        .send(newUser)
        .end((err, response) => {
          newUser = {
            ...newUser,
            ...{
              [Globals.itemIdFieldName]: response.body[Globals.itemIdFieldName],
              email: newUser.email.toLowerCase(),
              password: response.body.password,
            },
          };
          expect(response).to.have.status(201);
          expect(response.body).to.be.an("object");
          expect(response.body).to.deep.equal(newUser);
          expect(bcrypt.compareSync(pw, response.body.password)).to.be.true;
          expect(response).to.have.cookie("authtoken");
          done();
        });
    });
  });
}

init();

try {
  csv()
    .fromFile(path.resolve("./server/test/testPermissions.csv"))
    .then(function (permissionTests) {
      //console.log(permissionTests);

      lastList = {
        [Globals.listIdFieldName]: Globals.listofAllListId,
        name: "Permission tests list",
        [Globals.ownerFieldName]: "owner@gmail.com",
        [Globals.readWritePermFieldName]: "x@auth",
        [Globals.itemReadWritePermFieldName]: "x@auth",
        [Globals.itemReadPermFieldName]: "x@auth",
        [Globals.listSchemaFieldName]: "field1: string",
      };

      var lastListID;

      // perform 4 first global tests
      for (let i = 0; i < 4; i++) {
        describe("Test " + i, () => {
          it(i + ".1 - Create list as " + permissionTests[i].user, (done) => {
            chai
              .request(server)
              .post("/api/" + Globals.APIKeyword)
              .send(lastList)
              .auth(
                userEmail(permissionTests[i].user),
                userPw(permissionTests[i].user)
              )
              .end((err, response) => {
                lastListID = response.body[Globals.itemIdFieldName]
                  ? response.body[Globals.itemIdFieldName]
                  : lastListID;

                if (
                  permissionTests[i].createlist == "yes" ||
                  permissionTests[i].createlist == "granted"
                ) {
                  expect(response).to.have.status(201);
                  expect(response.body).to.deep.equal({
                    ...lastList,
                    [Globals.itemIdFieldName]: lastListID,
                  });
                } else {
                  expect(response).to.have.status(403);
                  expect(response.body).to.deep.equal({
                    err: Errors.ErrMsg.Forbidden,
                  });
                }
                done();
              });
          });

          it(i + ".2 - Delete list as " + permissionTests[i].user, (done) => {
            chai
              .request(server)
              .delete("/api/" + Globals.APIKeyword + "/" + lastListID)
              .auth(
                userEmail(permissionTests[i].user),
                userPw(permissionTests[i].user)
              )
              .end((err, response) => {
                if (
                  permissionTests[i].deletelist == "yes" ||
                  permissionTests[i].deletelist == "granted"
                ) {
                  expect(response).to.have.status(200);
                } else {
                  expect(response).to.have.status(403);
                  expect(response.body).to.deep.equal({
                    err: Errors.ErrMsg.Forbidden,
                  });
                }
                done();
              });
          });

          it(
            i + ".3 - Delete all list as " + permissionTests[i].user,
            (done) => {
              chai
                .request(server)
                .delete("/api/" + Globals.APIKeyword)
                .auth(
                  userEmail(permissionTests[i].user),
                  userPw(permissionTests[i].user)
                )
                .end((err, response) => {
                  if (
                    permissionTests[i].deletealllists == "yes" ||
                    permissionTests[i].deletealllists == "granted"
                  ) {
                    expect(response).to.have.status(200);
                  } else {
                    expect(response).to.have.status(403);
                    expect(response.body).to.deep.equal({
                      err: Errors.ErrMsg.Forbidden,
                    });
                  }
                  done();
                });
            }
          );
        });
      }

      // perform remaining tests
      for (let i = 0; i < 27; i++) {
        let j = 3 * i + 4;
        reset();
        let lastList = {
          [Globals.listIdFieldName]: Globals.listofAllListId,
          name: "Permission tests list",
          [Globals.ownerFieldName]: "owner@gmail.com",
          [Globals.readWritePermFieldName]: "@owner",
          [Globals.itemReadWritePermFieldName]: "@owner",
          [Globals.itemReadPermFieldName]: "@owner",
          [Globals.listSchemaFieldName]: "field1: string",
        };

        describe("Test " + j + " - " + (j + 2), () => {
          it("Create a list as " + permissionTests[j].user, (done) => {
            chai
              .request(server)
              .post("/api/" + Globals.APIKeyword)
              .send(lastList)
              .auth(
                userEmail(permissionTests[j].user),
                userPw(permissionTests[j].user)
              )
              .end((err, response) => {
                lastListID = response.body[Globals.itemIdFieldName];
                expect(response).to.have.status(201);
                expect(response.body).to.deep.equal({
                  ...lastList,
                  [Globals.itemIdFieldName]: lastListID,
                });
                done();
              });
          });

          let lastItemID;
          for (let k = 0; k < 3; k++) {
            let l = j + k;

            it(
              l +
                ".1 - Patch the list as " +
                permissionTests[l].user +
                " (" +
                permissionTests[l].patchlist +
                ") with c=" +
                permissionTests[l].listwrite +
                ", w=" +
                permissionTests[l].itemwrite +
                ", r=" +
                permissionTests[l].itemread,
              (done) => {
                listPatch = {
                  [Globals.readWritePermFieldName]:
                    permissionTests[l].listwrite,
                  [Globals.itemReadWritePermFieldName]:
                    permissionTests[l].itemwrite,
                  [Globals.itemReadPermFieldName]: permissionTests[l].itemread,
                };

                chai
                  .request(server)
                  .patch("/api/" + Globals.APIKeyword + "/" + lastListID)
                  .send(listPatch)
                  .auth(
                    userEmail(permissionTests[l].user),
                    userPw(permissionTests[l].user)
                  )
                  .end((err, response) => {
                    if (
                      permissionTests[l].patchlist == "yes" ||
                      permissionTests[l].patchlist == "granted"
                    ) {
                      expect(response).to.have.status(200);
                      lastItemID = response.body[Globals.itemIdFieldName];
                    } else {
                      expect(response).to.have.status(403);
                      expect(response.body).to.deep.equal({
                        err: Errors.ErrMsg.Forbidden,
                      });
                    }
                    done();
                  });
              }
            );

            it(
              l +
                ".2 - Add list item as " +
                permissionTests[l].user +
                " (" +
                permissionTests[l].createitem +
                ")",
              (done) => {
                lastItem = {
                  field1: "val1",
                  [Globals.listIdFieldName]: lastListID,
                };

                chai
                  .request(server)
                  .post("/api/" + Globals.APIKeyword)
                  .send(lastItem)
                  .auth(
                    userEmail(permissionTests[l].user),
                    userPw(permissionTests[l].user)
                  )
                  .end((err, response) => {
                    if (
                      permissionTests[l].createitem == "yes" ||
                      permissionTests[l].createitem == "granted"
                    ) {
                      expect(response).to.have.status(201);
                      lastItemID = response.body[Globals.itemIdFieldName];
                    } else {
                      expect(response).to.have.status(403);
                      expect(response.body).to.deep.equal({
                        err: Errors.ErrMsg.Forbidden,
                      });
                    }
                    done();
                  });
              }
            );

            it(
              l +
                ".3 - Patch list item as " +
                permissionTests[l].user +
                " (" +
                permissionTests[l].patchitem +
                ")",
              (done) => {
                chai
                  .request(server)
                  .patch("/api/" + Globals.APIKeyword + "/" + lastItemID)
                  .send({ field1: "val2" })
                  .auth(
                    userEmail(permissionTests[l].user),
                    userPw(permissionTests[l].user)
                  )
                  .end((err, response) => {
                    if (
                      permissionTests[l].patchitem == "yes" ||
                      permissionTests[l].patchitem == "granted"
                    ) {
                      expect(response).to.have.status(200);
                    } else {
                      expect(response).to.have.status(403);
                      expect(response.body).to.deep.equal({
                        err: Errors.ErrMsg.Forbidden,
                      });
                    }
                    done();
                  });
              }
            );

            it(
              l +
                ".4 - Delete list item as " +
                permissionTests[l].user +
                " (" +
                permissionTests[l].deleteitem +
                ")",
              (done) => {
                chai
                  .request(server)
                  .delete("/api/" + Globals.APIKeyword + "/" + lastItemID)
                  .auth(
                    userEmail(permissionTests[l].user),
                    userPw(permissionTests[l].user)
                  )
                  .end((err, response) => {
                    if (
                      permissionTests[l].deleteitem == "yes" ||
                      permissionTests[l].deleteitem == "granted"
                    ) {
                      expect(response).to.have.status(200);
                    } else {
                      expect(response).to.have.status(403);
                      expect(response.body).to.deep.equal({
                        err: Errors.ErrMsg.Forbidden,
                      });
                    }
                    done();
                  });
              }
            );

            it(
              l +
                ".5 - Add list item as " +
                permissionTests[l].user +
                " for the next user" +
                " (" +
                permissionTests[l].createitem +
                ")",
              (done) => {
                lastItem = {
                  field1: "val3",
                  [Globals.listIdFieldName]: lastListID,
                };
                chai
                  .request(server)
                  .post("/api/" + Globals.APIKeyword)
                  .send(lastItem)
                  .auth(
                    userEmail(permissionTests[l].user),
                    userPw(permissionTests[l].user)
                  )
                  .end((err, response) => {
                    if (
                      permissionTests[l].createitem == "yes" ||
                      permissionTests[l].createitem == "granted"
                    ) {
                      expect(response).to.have.status(201);
                      lastItemID = response.body[Globals.itemIdFieldName];
                    } else {
                      expect(response).to.have.status(403);
                      expect(response.body).to.deep.equal({
                        err: Errors.ErrMsg.Forbidden,
                      });
                    }
                    done();
                  });
              }
            );

            it(
              l +
                ".6 - Get the list as " +
                permissionTests[l].user +
                " (" +
                permissionTests[l].getlist +
                ")",
              (done) => {
                chai
                  .request(server)
                  .get("/api/" + Globals.APIKeyword + "/" + lastListID)
                  .auth(
                    userEmail(permissionTests[l].user),
                    userPw(permissionTests[l].user)
                  )
                  .end((err, response) => {
                    if (
                      permissionTests[l].getlist == "yes" ||
                      permissionTests[l].getlist == "granted"
                    ) {
                      expect(response).to.have.status(200);
                    } else {
                      expect(response).to.have.status(403);
                      expect(response.body).to.deep.equal({
                        err: Errors.ErrMsg.Forbidden,
                      });
                    }
                    done();
                  });
              }
            );
          }
        });

        it("Delete all list", (done) => {
          chai
            .request(server)
            .delete("/api/" + Globals.APIKeyword)
            .auth(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD)
            .end((err, response) => {
              expect(response).to.have.status(200);
              done();
            });
        });
      }
    });
} catch (err) {
  console.log(err);
}
