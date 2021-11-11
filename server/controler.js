const MongoDB = require('mongodb');
const NodeUtil = require('util');

const Errors = require('../client/src/common/errors');
const Utils = require('../client/src/common/utils');
const Globals = require('../client/src/common/globals');
const Filter = require('../client/src/common/filter');
const Schema = require('../client/src/common/schema');

const SchemaValidator = require('./schemaValidator');


class Controler {
  constructor() {
    MongoDB.MongoClient.connect(process.env.MONGODB_ADDRESS, (err, ldb) => {
      if (err) {
        throw new Errors.InternalServerError(Errors.ErrMsg.Database_CouldNotConnect);
      };
      this.coll = ldb.db(Globals.mongoDatabaseName).collection(Globals.mongoCollectionName);
      if (this.reset) {
        this.createBaseTables();
      }
    });
  };

  init() {
    this.reset = true;
  }

  async createBaseTables() {
    // clean the database
    await this.deleteAll(process.env.ADMIN_EMAIL, true);

    console.log('Create the list of all lists...');
    var item = await this.insertMany(process.env.ADMIN_EMAIL, Globals.listOfAllLists);
    if (!item) {
      console.log('Could not create the list of all lists...');
    }

    console.log('Create the list of all views...');
    item = await this.insertMany(process.env.ADMIN_EMAIL, Globals.listOfAllViews);
    if (!item) {
      console.log('Could not create the list of all views...');
    }

    console.log('Create the view on all views...');
    item = await this.insertMany(process.env.ADMIN_EMAIL, Globals.viewOnTheListOfAllViews);
    if (!item) {
      console.log('Could not create the view on the list of all views...');
    }

    console.log('Create the list of users...');
    item = await this.insertMany(process.env.ADMIN_EMAIL, Globals.listOfUsers);
    if (!item) {
      console.log('Could not create the list of users...');
    }
    
    console.log('Create the view on the list of users...');
    item = await this.insertMany(process.env.ADMIN_EMAIL, Globals.viewOnTheListOfUsers);
    if (!item) {
      console.log('Could not create the view on the list of all views...');
    }
  }

  static isList(item) {
    return item[Globals.listIdFieldName] && 
           (item[Globals.listIdFieldName].toString() === Globals.listofAllListId ||
           Controler.hasVoidParent(item));
  };
  
  static hasVoidParent(item) {
     return item[Globals.listIdFieldName] && item[Globals.listIdFieldName].toString() === Globals.voidListId;
  };

  static isOrphanList(id) {
    return id === Globals.listofAllListId || id === Globals.listofAllViewId;
  }

  async simpleFind(listid, filter) {
    if (!(MongoDB.ObjectId.isValid(listid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, listid));
    };
    const idFilter = {[Globals.listIdFieldName]: MongoDB.ObjectId(listid)};
    const newFilter = {...idFilter, ...filter};
    const items = this.coll.findOne(newFilter);
    return items; 
  };

  static validatePerm(user, listOwner, listCPerm, listWPerm, listRPerm, throwerror = true) {
    // admin and listowner have all permissions
    if (user === process.env.ADMIN_EMAIL || user === listOwner) {
      return true;
    }

    if (user !== Globals.unauthUserName) {
      // if listCPerm permission is @all or the user is listed, grant permission
      if (listCPerm && (listCPerm === '@all' || listCPerm.split(/\s*,\s*/).includes(user))) {
        return true;
      }

      // if listWPerm permission is @all or the user is listed, grant permission
      if (listWPerm && (listWPerm === '@all' || listWPerm.split(/\s*,\s*/).includes(user))) {
        return true;
      }
    }

    // if listRPerm permission is @all or the user is listed, grant permission
    if (listRPerm && (listRPerm === '@all' || listRPerm.split(/\s*,\s*/).includes(user))) {
      return true;
    }
    if (throwerror) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }
    return false;
  }

  async getParentList(item) {
    var parentList;
    if (!(item[Globals.listIdFieldName])) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.Schema_MissingProp, Globals.listIdFieldName));
    }
    if (Controler.isOrphanList(item[Globals.itemIdFieldName])) {
      parentList = Globals.listOfAllLists;
    }
    else {
      parentList = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(item[Globals.listIdFieldName])});
    }
    if (!parentList) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.List_NotFound, item[Globals.listIdFieldName]));
    }
    return parentList;
  };

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
    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    };
    
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});

    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.Item_NotFound, itemid));
    };

    if (Controler.isList(item)) {
      // validate permissions
      Controler.validatePerm(user, item[Globals.ownerFieldName], item[Globals.readWritePermFieldName], item[Globals.itemReadWritePermFieldName], item[Globals.itemReadPermFieldName]);

      if (!noitems) {
        var lookup = {from: Globals.mongoCollectionName, localField: Globals.itemIdFieldName, foreignField: Globals.listIdFieldName, as: 'items'};

        if (filter) {
          var mongoDBFilter = new Filter(filter);
          var jsonFilter = mongoDBFilter.final();
          lookup.let = {x: '$' + Globals.itemIdFieldName};
          lookup.pipeline = [{$match: 
                              {$expr: 
                                {$and: [
                                  {$eq: ['$' + Globals.listIdFieldName, '$$x']},
                                  jsonFilter
                                ]}
                              }
                            }];
          delete lookup.localField;
          delete lookup.foreignField;
        };

        var pipeline = [{$match: {[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)}},
                        {$lookup: lookup},
                        {$unset: 'items.' + Globals.listIdFieldName}
                      ];
        item = await this.coll.aggregate(pipeline).toArray();
        item = item[0];

        // if the requested list is the list of list, remove list for which the user deon not have read permissions
        if (itemid === Globals.listofAllListId) {
          item.items = item.items.filter(item => {
            return Controler.validatePerm(user, item[Globals.ownerFieldName], item[Globals.readWritePermFieldName], item[Globals.itemReadWritePermFieldName], item[Globals.itemReadPermFieldName], false);
          });
        }
        if (item.items.length === 0) {
          delete item.items;
        }
      }
    }
    else {
      // find item schema
      var parentList = await this.getParentList(item);
      
      // validate permissions
      Controler.validatePerm(user, parentList[Globals.ownerFieldName], parentList[Globals.readWritePermFieldName], parentList[Globals.itemReadWritePermFieldName], parentList[Globals.itemReadPermFieldName]);
    
      // add embedded items if there are any
      const schema = new Schema(parentList[Globals.listSchemaFieldName]);
      await Promise.all(schema.getEmbeddedItems().map(async embItem => {
        var propName = Object.keys(embItem)[0];
        item[propName] = await this.findWithItems(user, item[propName]);
      }));
    }

    return item;
  };

  /*
    Validate items against the schema stored in the item with _id = listid
    When strict is false, ignore fields which are not in the schema, otherwise throw an error
  */
  async validateItems(schemaStr, item, strict = true) {
    var newItems;
    // validate provided JSON against the schema
    try {
      const schema = new Schema(schemaStr);
      const schemaValidator = new SchemaValidator(schema, this, item[Globals.listIdFieldName]);

      // add the schema description for the listid property
      schema.schema[Globals.listIdFieldName] = {type: 'objectid', required: true};      

      // validate many or one
      if (item.hasOwnProperty('items')) { // validate many
        newItems = await Promise.all(item.items.map(async (thisitem) => {
          // move the listid value down to the item level
          if (strict && item[Globals.listIdFieldName]) {
            thisitem[Globals.listIdFieldName] = item[Globals.listIdFieldName];
          }
          var newItem = await schemaValidator.validateJson(thisitem, strict);
          return newItem;
        }))
      }
      else { // validate only one
        newItems = await schemaValidator.validateJson(item, strict);

      }
    } catch(err) {
      throw new Errors.BadRequest(err.message);
    }
    return newItems;
  };

  async insertMany(user, item) {
    // unauth user have no edit permissions
    if (user === Globals.unauthUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    // find the parent list
    var parentList = await this.getParentList(item);

    // validate permissions
    Controler.validatePerm(user, parentList[Globals.ownerFieldName], parentList[Globals.readWritePermFieldName], parentList[Globals.itemReadWritePermFieldName]);
    
    // validate item against schema
    var newitems = await this.validateItems(parentList[Globals.listSchemaFieldName], item);

    // create it
    if (newitems.length === undefined){
      await this.coll.insertOne(newitems);
    }
    else {   
      newitems = await this.coll.insertMany(newitems);
    }

    if (!newitems || (newitems.acknowledged !== undefined && !newitems.acknowledged)) {
      throw new Errors.InternalServerError(Errors.ErrMsg.Item_CouldNotCreate);
    }

    // delete the acknowledgment property if there was many items
    if (newitems.acknowledged !== undefined) {
      delete newitems.acknowledged;
    }

    return newitems;
  };

  async patch(user, itemid, newitem) {
    // unauth user have no edit permissions
    if (user === Globals.unauthUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    }

    // find the item to get it's parent list schema
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});
    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.Item_NotFound, itemid));
    }

    if (item[Globals.listIdFieldName]) {
      newitem[Globals.listIdFieldName] = item[Globals.listIdFieldName];
    }

    // find item schema
    var parentList = await this.getParentList(newitem);

    // validate permissions
    if (Controler.isList(item)) { // list patch permissions are defined at the list level (not the parent level)
      Controler.validatePerm(user, item[Globals.ownerFieldName], item[Globals.readWritePermFieldName]);
    }
    else {
      Controler.validatePerm(user, parentList[Globals.ownerFieldName], parentList[Globals.readWritePermFieldName], parentList[Globals.itemReadWritePermFieldName]);
    }

    // validate item against schema
    newitem = await this.validateItems(parentList[Globals.listSchemaFieldName], newitem, false);
    
    // update it
    item = await this.coll.findOneAndUpdate({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)}, {$set: newitem}, {returnDocument: 'after'});
    if (!(item.ok)) {
      throw new Errors.InternalServerError(Errors.ErrMsg.Item_CouldNotUpdate);
    }
    return item.value;
  };

  deleteAll(user, all = false) {
    if (user !== process.env.ADMIN_EMAIL) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    var filter = {};
    if (!all) {
      filter = {$and: [ {[Globals.listIdFieldName]: {$ne: MongoDB.ObjectId(Globals.voidListId)}}, // list of all lists and list of all views
                        {[Globals.listIdFieldName]: {$ne: MongoDB.ObjectId(Globals.userListId)}}, // users
                        {[Globals.itemIdFieldName]: {$ne: MongoDB.ObjectId(Globals.userListId)}}, // users list
                        {[Globals.itemIdFieldName]: {$ne: MongoDB.ObjectId(Globals.viewOnUserListViewId)}}, // users list view
                        {[Globals.itemIdFieldName]: {$ne: MongoDB.ObjectId(Globals.viewOnAllViewViewId)}} ]} // view on list of views
    }
    return this.coll.deleteMany(filter);
  };

  async delete(user, itemid) {
    // unauth user have no edit permissions
    if (user === Globals.unauthUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    if (!(MongoDB.ObjectId.isValid(itemid))) {
      throw new Errors.BadRequest(NodeUtil.format(Errors.ErrMsg.MalformedID, itemid));
    }

    // find the item to check if it is a list or an item
    var item = await this.coll.findOne({[Globals.itemIdFieldName]: MongoDB.ObjectId(itemid)});
    if (!item) {
      throw new Errors.NotFound(NodeUtil.format(Errors.ErrMsg.Item_NotFound, itemid));
    }

    // find item schema
    var parentList = await this.getParentList(item);

    // check user permissions
    if (Controler.isList(item)) {
      if (user !== process.env.ADMIN_EMAIL && user !== item.owner) {
        throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
      }
      // delete all associated items
      this.coll.deleteMany({[Globals.listIdFieldName]: MongoDB.ObjectId(item[Globals.itemIdFieldName])});
    }
    else {
      Controler.validatePerm(user, parentList[Globals.ownerFieldName], parentList[Globals.readWritePermFieldName], parentList[Globals.itemReadWritePermFieldName]);
    }

    return this.coll.deleteOne({[Globals.listIdFieldName]: itemid});
  };
}

module.exports = new Controler;
