const MongoDB = require("mongodb");
const NodeUtil = require("util");
require("dotenv").config();

const Errors = require("../../client/src/common/errors");
const Utils = require("../../client/src/common/utils");
const Globals = require("../../client/src/common/globals");
const Filter = require("../../client/src/common/filter");
const Schema = require("../../client/src/common/schema");

const SchemaValidator = require("./schemaValidator");

class Controler {
  constructor() {
    MongoDB.MongoClient.connect(process.env.MONGODB_ADDRESS, (err, ldb) => {
      if (err) {
        throw new Errors.InternalServerError(
          Errors.ErrMsg.Database_CouldNotConnect
        );
      }
      this.coll = ldb
        .db(Globals.mongoDatabaseName)
        .collection(Globals.mongoCollectionName);
      if (this.reset) {
        this.createBaseTables();
      }
    });
  }

  init() {
    this.reset = true;
  }

  async createBaseTables() {
    // clean the database
    await this.deleteAll(process.env.ADMIN_EMAIL, true);

    console.log("Create the " + Globals.listOfAllLists['name'] + "...");
    try {
      var item = await this.insertMany(
        process.env.ADMIN_EMAIL,
        Globals.voidListId,
        Globals.listOfAllLists
      );
    } catch (err) {
      var msg = NodeUtil.format(Errors.ErrMsg.CouldNotCreate, Globals.listOfAllLists['name'])
      console.log('ERROR: ' + msg);
      throw new Errors.FatalServerError(msg);
    }

    console.log("Create the " + Globals.listOfAllViews['name'] + "...");
    try {
      item = await this.insertMany(
        process.env.ADMIN_EMAIL,
        Globals.voidListId,
        Globals.listOfAllViews
      );
    } catch (err) {
      var msg = NodeUtil.format(Errors.ErrMsg.CouldNotCreate, Globals.listOfAllViews['name'])
      console.log('ERROR: ' + msg);
      throw new Errors.FatalServerError(msg);
    }

    console.log("Create the " + Globals.viewOnTheListOfAllViews['name'] + "...");
    try {
      item = await this.insertMany(
        process.env.ADMIN_EMAIL,
        Globals.listofAllViewId,
        Globals.viewOnTheListOfAllViews
      );
    } catch (err) {
      var msg = NodeUtil.format(Errors.ErrMsg.CouldNotCreate, Globals.viewOnTheListOfAllViews['name'])
      console.log('ERROR: ' + msg);
      throw new Errors.FatalServerError(msg);
    }

    console.log("Create the " + Globals.listOfUsers['name'] + "...");
    try {
      item = await this.insertMany(
        process.env.ADMIN_EMAIL,
        Globals.listofAllListId,
        Globals.listOfUsers
      );
    } catch (err) {
      var msg = NodeUtil.format(Errors.ErrMsg.CouldNotCreate, Globals.listOfUsers['name'])
      console.log('ERROR: ' + msg);
      throw new Errors.FatalServerError(msg);
    }

    console.log("Create the " + Globals.viewOnTheListOfUsers['name'] + "...");
    try {
      item = await this.insertMany(
        process.env.ADMIN_EMAIL,
        Globals.listofAllViewId,
        Globals.viewOnTheListOfUsers
      );
    } catch (err) {
      var msg = NodeUtil.format(Errors.ErrMsg.CouldNotCreate, Globals.viewOnTheListOfUsers['name'])
      console.log('ERROR: ' + msg);
      throw new Errors.FatalServerError(msg);
    }
  }

  static isList(item) {
    return (
      item[Globals.listIdFieldName] &&
      (item[Globals.listIdFieldName].toString() === Globals.listofAllListId ||
        Controler.hasVoidParent(item))
    );
  }

  static hasVoidParent(item) {
    return (
      item[Globals.listIdFieldName] &&
      item[Globals.listIdFieldName].toString() === Globals.voidListId
    );
  }

  static isOrphanList(id) {
    return id === Globals.voidListId || id === Globals.listofAllListId || id === Globals.listofAllViewId;
  }

  async simpleFind(listid, filter) {
    if (!MongoDB.ObjectId.isValid(listid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, listid)
      );
    }
    const idFilter = { [Globals.listIdFieldName]: MongoDB.ObjectId(listid) };
    const newFilter = { ...idFilter, ...filter };
    const items = this.coll.findOne(newFilter);
    return items;
  }

  async getParentList(listid) {
    var parentList;

    if (!MongoDB.ObjectId.isValid(listid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, listid)
      );
    }
    
    if (listid === Globals.voidListId) {
      parentList = Globals.listOfAllLists;
    } else {
      parentList = await this.coll.findOne({
        [Globals.itemIdFieldName]: MongoDB.ObjectId(
          listid
        ),
      });
    }
    if (!parentList) {
      throw new Errors.NotFound(
        NodeUtil.format(
          Errors.ErrMsg.List_NotFound,
          listid
        )
      );
    }
    return parentList;
  }

  /*makePipeline() {

  }

  traverseItem(user, item, filter, embeditems = true, embedded = true) {
  // if the item is a list
    // check permission from the item itself
    // append a lookup to the pipeline with the filter
  
  // for every item property
      // check permission from the parent list
      // if its an embedded list, append a lookup to the pipeline
  }

  async findWithEmbedded(user, itemid, filter, embeditems = true, embedded = true) {
    // find the item

    // traverse the item to build the pipeline

    // query
  }*/

  async findWithItems(user, itemid, filter, noitems = false) {
    if (!MongoDB.ObjectId.isValid(itemid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, itemid)
      );
    }

    var item = await this.coll.findOne({
      [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid),
    });

    if (!item) {
      throw new Errors.NotFound(
        NodeUtil.format(Errors.ErrMsg.Item_NotFound, itemid)
      );
    }

    if (Controler.isList(item)) {
      // validate permissions
      Utils.validatePerm(
        user,
        item[Globals.ownerFieldName],
        item[Globals.readWritePermFieldName],
        item[Globals.itemReadWritePermFieldName],
        item[Globals.itemReadPermFieldName]
      );

      if (!noitems) {
        var lookup = {
          from: Globals.mongoCollectionName,
          localField: Globals.itemIdFieldName,
          foreignField: Globals.listIdFieldName,
          as: "items",
        };

        if (filter) {
          var mongoDBFilter = new Filter(filter);
          var jsonFilter = mongoDBFilter.final();
          lookup.let = { x: "$" + Globals.itemIdFieldName };
          lookup.pipeline = [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$" + Globals.listIdFieldName, "$$x"] },
                    jsonFilter,
                  ],
                },
              },
            },
          ];
          delete lookup.localField;
          delete lookup.foreignField;
        }

        var pipeline = [
          { $match: { [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid) } },
          { $lookup: lookup },
          { $unset: "items." + Globals.listIdFieldName },
        ];
        item = await this.coll.aggregate(pipeline).toArray();
        item = item[0];

        // if the requested list is the list of list, remove list for which the user deon not have read permissions
        if (itemid === Globals.listofAllListId) {
          item.items = item.items.filter((item) => {
            return Utils.validatePerm(
              user,
              item[Globals.ownerFieldName],
              item[Globals.readWritePermFieldName],
              item[Globals.itemReadWritePermFieldName],
              item[Globals.itemReadPermFieldName],
              false
            );
          });
        }
        if (item.items.length === 0) {
          delete item.items;
        }
      }
    } else {
      // find item schema
      var parentList = await this.getParentList(item[Globals.listIdFieldName]);

      // validate permissions
      Utils.validatePerm(
        user,
        parentList[Globals.ownerFieldName],
        parentList[Globals.readWritePermFieldName],
        parentList[Globals.itemReadWritePermFieldName],
        parentList[Globals.itemReadPermFieldName]
      );

      // add embedded items if there are any
      const schema = new Schema(parentList[Globals.listSchemaFieldName]);
      await Promise.all(
        schema.getEmbeddedItems().map(async (embItem) => {
          var propName = Object.keys(embItem)[0];
          item[propName] = await this.findWithItems(user, item[propName]);
        })
      );
    }

    return item;
  }

  /*
    Validate items against the schema stored in the item with _id = listid
    When strict is false, ignore fields which are not in the schema, otherwise throw an error
  */
  async validateItems(schemaStr, items, strict, listid = null, user = null) {
    var newItems;

    // validate provided JSON against the schema
    try {
      const schema = new Schema(schemaStr);
      const schemaValidator = new SchemaValidator(
        schema,
        this,
        listid
      );

      // validate many or one
      if (items instanceof Array) {
        // validate many
        newItems = await Promise.all(
          items.map(async (thisitem) => {
            var newItem = await schemaValidator.validateJson(thisitem, strict);
            // add listid to the item
            if (strict && listid) {
              thisitem[Globals.listIdFieldName] = MongoDB.ObjectId(listid);
            }
            return newItem;
          })
        );
      } else {
        // validate only one
        newItems = await schemaValidator.validateJson(items, strict, user);
        if (strict && listid) {
          newItems[Globals.listIdFieldName] = MongoDB.ObjectId(listid);
        }
      }
    } catch (err) {
      throw new Errors.BadRequest(err.message);
    }
    return newItems;
  }

  async insertMany(user, listid, item) {
    // unauth user have no edit permissions
    if (user === Globals.unauthUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    // find the parent list
    var parentList = await this.getParentList(listid);

    // validate permissions
    Utils.validatePerm(
      user,
      parentList[Globals.ownerFieldName],
      parentList[Globals.readWritePermFieldName],
      parentList[Globals.itemReadWritePermFieldName]
    );

    // validate item against schema
    var newItems = await this.validateItems(
      parentList[Globals.listSchemaFieldName],
      item,
      true,
      listid,
      user
    );

    // create it
    if (newItems instanceof Array) {
      newItems = await this.coll.insertMany(newItems);
    } else {
      await this.coll.insertOne(newItems);
    }

    if (
      !newItems ||
      (newItems.acknowledged !== undefined && !newItems.acknowledged)
    ) {
      throw new Errors.InternalServerError(Errors.ErrMsg.Item_CouldNotCreate);
    }

    // delete the acknowledgment property if there was many items
    if (newItems.acknowledged !== undefined) {
      delete newItems.acknowledged;
    }

    return newItems;
  }

  async patch(user, itemid, newitem) {
    // unauth user have no edit permissions
    if (user === Globals.unauthUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    if (!MongoDB.ObjectId.isValid(itemid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, itemid)
      );
    }

    // find the item to get it's parent list schema
    var item = await this.coll.findOne({
      [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid),
    });
    if (!item) {
      throw new Errors.NotFound(
        NodeUtil.format(Errors.ErrMsg.Item_NotFound, itemid)
      );
    }

    // find item schema
    var parentList = await this.getParentList(item[Globals.listIdFieldName]);

    // validate permissions
    if (Controler.isList(item)) {
      // list patch permissions are defined at the list level (not the parent level)
      Utils.validatePerm(
        user,
        item[Globals.ownerFieldName],
        item[Globals.readWritePermFieldName]
      );
    } else {
      Utils.validatePerm(
        user,
        parentList[Globals.ownerFieldName],
        parentList[Globals.readWritePermFieldName],
        parentList[Globals.itemReadWritePermFieldName]
      );
    }

    // validate item against schema
    newitem = await this.validateItems(
      parentList[Globals.listSchemaFieldName],
      newitem,
      false,
      item[Globals.listIdFieldName],
      user
    );
    
    // update it
    item = await this.coll.findOneAndUpdate(
      { [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid) },
      { $set: newitem },
      { returnDocument: "after" }
    );
    if (!item.ok) {
      throw new Errors.InternalServerError(Errors.ErrMsg.Item_CouldNotUpdate);
    }
    return item.value;
  }

  deleteAll(user, all = false) {
    if (user !== process.env.ADMIN_EMAIL) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    var filter = {};
    if (!all) {
      filter = {
        $and: [
          {
            [Globals.listIdFieldName]: {
              $ne: MongoDB.ObjectId(Globals.voidListId),
            },
          }, // list of all lists and list of all views
          {
            [Globals.listIdFieldName]: {
              $ne: MongoDB.ObjectId(Globals.userListId),
            },
          }, // users
          {
            [Globals.itemIdFieldName]: {
              $ne: MongoDB.ObjectId(Globals.userListId),
            },
          }, // users list
          {
            [Globals.itemIdFieldName]: {
              $ne: MongoDB.ObjectId(Globals.viewOnUserListViewId),
            },
          }, // users list view
          {
            [Globals.itemIdFieldName]: {
              $ne: MongoDB.ObjectId(Globals.viewOnAllViewViewId),
            },
          },
        ],
      }; // view on list of views
    }
    return this.coll.deleteMany(filter);
  }

  async delete(user, itemid) {
    // unauth user have no edit permissions
    if (user === Globals.unauthUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    if (!MongoDB.ObjectId.isValid(itemid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, itemid)
      );
    }

    // find the item to check if it is a list or an item
    var item = await this.coll.findOne({
      [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid),
    });
    if (!item) {
      throw new Errors.NotFound(
        NodeUtil.format(Errors.ErrMsg.Item_NotFound, itemid)
      );
    }

    // find item schema
    var parentList = await this.getParentList(item[Globals.listIdFieldName]);

    // check user permissions
    if (Controler.isList(item)) {
      if (user !== process.env.ADMIN_EMAIL && user !== item.owner) {
        throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
      }
      // delete all associated items
      this.coll.deleteMany({
        [Globals.listIdFieldName]: MongoDB.ObjectId(
          item[Globals.itemIdFieldName]
        ),
      });
    } else {
      Utils.validatePerm(
        user,
        parentList[Globals.ownerFieldName],
        parentList[Globals.readWritePermFieldName],
        parentList[Globals.itemReadWritePermFieldName]
      );
    }

    return this.coll.deleteOne({ [Globals.listIdFieldName]: itemid });
  }
}

module.exports = new Controler();
