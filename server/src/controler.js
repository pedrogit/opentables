const MongoDB = require("mongodb");
const NodeUtil = require("util");
const axios = require("axios");
require("dotenv").config();

const Errors = require("../../common/errors");
const Utils = require("../../common/commonUtils");
const ValidatePerm = require("../../common/validatePerm");

const Globals = require("../../common/globals");
const Filter = require("../../common/filter");
const Schema = require("../../common/schema");

const SchemaValidator = require("./schemaValidator");

class Controler {
  init(callback) {
    if (
      !process.env.MONGODB_ADDRESS_DEVEL &&
      !process.env.MONGODB_ADDRESS_PROD
    ) {
      console.log(
        `ERROR: MONGODB_ADDRESS is not defined. ${Errors.ErrMsg.Database_CouldNotConnect} EXITING...`
      );
      process.exit();
    }
    MongoDB.MongoClient.connect(
      process.env.NODE_ENV === "development"
        ? process.env.MONGODB_ADDRESS_DEVEL
        : process.env.MONGODB_ADDRESS_PROD,
      (err, ldb) => {
        if (err) {
          console.log(
            `ERROR: ${Errors.ErrMsg.Database_CouldNotConnect} EXITING...`
          );
          process.exit();
        }
        this.coll = ldb
          .db(Globals.mongoDatabaseName)
          .collection(Globals.mongoCollectionName);
        console.log(`Connected to MongoDB @ ${ldb.s.url}...`);

        // call the callback
        if (callback && typeof callback === "function") {
          callback();
        }
      }
    );
  }

  static initialViews() {
    return [
      Globals.viewOnTheListOfAllViews,
      Globals.viewOnTheListOfAllLists,
      Globals.viewOnTheListOfUsers,
      Globals.signUpViewOnTheListOfUsers,
      Globals.viewOnTheListOfUsersAtLoad,
      Globals.viewOnTheListOfUsersAsForm,
    ];
  }

  async createBaseTables(callback) {
    // clean the database
    await this.deleteAll(Globals.adminUserName, true);

    console.log(`Create the ${Globals.listOfAllLists.name}...`);
    try {
      await this.insertMany(
        Globals.adminUserName,
        Globals.voidListId,
        Globals.listOfAllLists
      );
    } catch (err) {
      const msg = NodeUtil.format(
        Errors.ErrMsg.CouldNotCreate,
        Globals.listOfAllLists.name
      );
      console.log(`ERROR: ${msg} EXITING...`);
      process.exit();
    }

    console.log(`Create the ${Globals.listOfAllViews.name}...`);
    try {
      await this.insertMany(Globals.adminUserName, Globals.voidListId, {
        ...Globals.listOfAllViews,
      });
    } catch (err) {
      const msg = NodeUtil.format(
        Errors.ErrMsg.CouldNotCreate,
        Globals.listOfAllViews.name
      );
      console.log(`ERROR: ${msg} EXITING...`);
      process.exit();
    }

    console.log(`Create the ${Globals.listOfUsers.name}...`);
    try {
      await this.insertMany(Globals.adminUserName, Globals.listOfAllListId, {
        ...Globals.listOfUsers,
      });
    } catch (err) {
      const msg = NodeUtil.format(
        Errors.ErrMsg.CouldNotCreate,
        Globals.listOfUsers.name
      );
      console.log(`ERROR: ${msg} EXITING...`);
      process.exit();
    }

    // create the initial views
    Controler.initialViews().forEach(async (view) => {
      console.log(`Create the ${view.name}...`);
      try {
        await this.insertMany(Globals.adminUserName, Globals.listOfAllViewId, {
          ...view,
        });
      } catch (err) {
        const msg = NodeUtil.format(Errors.ErrMsg.CouldNotCreate, view.name);
        console.log(`ERROR: ${msg} EXITING...`);
        process.exit();
      }
    });

    // call the callback
    if (callback && typeof callback === "function") {
      callback();
    }
  }

  static isList(item) {
    return (
      item[Globals.listIdFieldName] &&
      (item[Globals.listIdFieldName].toString() === Globals.listOfAllListId ||
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
    return (
      id === Globals.voidListId ||
      id === Globals.listOfAllListId ||
      id === Globals.listOfAllViewId
    );
  }

  async simpleFind(listid, filter) {
    if (!MongoDB.ObjectId.isValid(listid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, listid)
      );
    }
    const idFilter = { [Globals.listIdFieldName]: MongoDB.ObjectId(listid) };
    const newFilter = { ...idFilter, ...filter };
    const items = await this.coll.findOne(newFilter);
    return items;
  }

  async getParentList(listid) {
    let parentList;

    if (!MongoDB.ObjectId.isValid(listid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, listid)
      );
    }

    if (listid.toString() === Globals.voidListId) {
      parentList = Globals.listOfAllLists;
    } else {
      parentList = await this.coll.findOne({
        [Globals.itemIdFieldName]: MongoDB.ObjectId(listid),
      });
    }
    if (!parentList) {
      throw new Errors.NotFound(
        NodeUtil.format(Errors.ErrMsg.List_NotFound, listid)
      );
    }
    return parentList;
  }

  static async validateRecaptcha(humanKey) {
    if (humanKey) {
      let isHuman;
      try {
        isHuman = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${
            process.env.NODE_ENV === "development"
              ? process.env.RECAPTCHA_SERVER_KEY_DEVEL
              : process.env.RECAPTCHA_SERVER_KEY_PROD
          }&response=${humanKey}`
        );
      } catch (err) {
        throw new Errors.BadRequest(Errors.ErrMsg.Recaptcha_Failed);
      }

      if (isHuman && isHuman.data && isHuman.data.success) {
        return;
      }
    }
    throw new Errors.BadRequest(Errors.ErrMsg.Recaptcha_Failed);
  }

  /*
    Validate items against the schema stored in the item with _id = listid
    When strict is false, ignore fields which are not in the schema, 
    otherwise throw an error.
  */
  async validateItems(
    schemaStr,
    items,
    user,
    listid,
    { strict = false, post = false }
  ) {
    let newItems;
    let gRecaptchaResponse;

    // remember recaptcha so we can remove it as a property and we
    // can validate it AFTER validating other properties
    if (strict && !post && user === Globals.allUserName) {
      gRecaptchaResponse = items[Globals.gRecaptchaResponse];
      // eslint-disable-next-line no-param-reassign
      delete items[Globals.gRecaptchaResponse];
    }

    // validate provided JSON against the schema
    try {
      const schema = new Schema(schemaStr);
      const schemaValidator = new SchemaValidator(schema, this, listid, post);

      // validate many or one
      if (items instanceof Array) {
        // validate many
        newItems = await Promise.all(
          items.map(async (thisItem) => {
            // eslint-disable-next-line no-param-reassign
            delete thisItem[Globals.listIdFieldName];
            const newItem = await schemaValidator.validateJson(
              thisItem,
              strict
            );
            // add listid to the item
            if (strict && listid) {
              newItem[Globals.listIdFieldName] = MongoDB.ObjectId(listid);
            }
            return newItem;
          })
        );
      } else {
        // validate only one
        // eslint-disable-next-line no-param-reassign
        delete items[Globals.listIdFieldName];
        newItems = await schemaValidator.validateJson(items, strict, user);
        if (strict && listid) {
          newItems[Globals.listIdFieldName] = MongoDB.ObjectId(listid);
        }
      }
    } catch (err) {
      throw new Errors.BadRequest(err.message);
    }

    // validate recaptcha when user = @all
    if (strict && !post && user === Globals.allUserName) {
      await Controler.validateRecaptcha(gRecaptchaResponse);
    }
    return newItems;
  }

  /* makePipeline() {

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
  } */

  async findWithItems(user, itemid, filter, noitems) {
    if (!MongoDB.ObjectId.isValid(itemid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, itemid)
      );
    }

    let item = await this.coll.findOne({
      [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid),
    });

    if (!item) {
      throw new Errors.NotFound(
        NodeUtil.format(Errors.ErrMsg.Item_NotFound, itemid)
      );
    }

    if (Controler.isList(item)) {
      if (
        ValidatePerm.validateRPerm({
          user,
          list: item,
          ignoreListItem: true,
        })
      ) {
        if (!noitems) {
          if (
            ValidatePerm.validateRPerm({
              user,
              list: item,
            })
          ) {
            const lookup = {
              from: Globals.mongoCollectionName,
              localField: Globals.itemIdFieldName,
              foreignField: Globals.listIdFieldName,
              as: Globals.itemsFieldName,
            };

            if (filter) {
              const mongoDBFilter = new Filter(filter);
              const jsonFilter = mongoDBFilter.final();
              lookup.let = { x: `$${Globals.itemIdFieldName}` };
              lookup.pipeline = [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: [`$${Globals.listIdFieldName}`, "$$x"] },
                        jsonFilter,
                      ],
                    },
                  },
                },
              ];
              delete lookup.localField;
              delete lookup.foreignField;
            }

            const pipeline = [
              {
                $match: { [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid) },
              },
              { $lookup: lookup },
              // remove the listid property since it is the same as the list itemid
              {
                $unset: `${Globals.itemsFieldName}.${Globals.listIdFieldName}`,
              },
            ];

            // remove hidden properties
            const schema = new Schema(item[Globals.listSchemaFieldName]);

            schema.getHidden().map(async (hidden) => {
              pipeline.push({
                $unset: `${[Globals.itemsFieldName]}.${hidden}`,
              });
            });

            item = await this.coll.aggregate(pipeline).toArray();
            [item] = item;

            // remove items for which the user do not have read permissions
            item[Globals.itemsFieldName] = item[Globals.itemsFieldName].filter(
              (subItem) => {
                return ValidatePerm.validateRPerm({
                  user,
                  list: item,
                  item: subItem,
                });
              }
            );
          } else {
            item = {
              ...item,
              [Globals.itemsFieldName]: Globals.permissionDeniedOnListOrItems,
            };
          }
        }

        const parentList = await this.getParentList(
          item[Globals.listIdFieldName]
        );

        const items = item[Globals.itemsFieldName];
        // post validate list properties against schema (mostly to remove hidden properties)
        item = await this.validateItems(
          parentList[Globals.listSchemaFieldName],
          Utils.objWithout(item, Globals.itemsFieldName),
          user,
          parentList[Globals.itemIdFieldName],
          {
            post: true,
          }
        );
        item[Globals.itemsFieldName] = items;
      } else {
        item = Globals.permissionDeniedOnListOrItems;
      }
    } else {
      // find item schema
      const parentList = await this.getParentList(
        item[Globals.listIdFieldName]
      );

      ValidatePerm.validateRPerm({
        user,
        list: parentList,
        item,
        throwError: true,
      });

      // add embedded items if there are any
      const schema = new Schema(parentList[Globals.listSchemaFieldName]);
      await Promise.all(
        schema.getEmbedded().map(async (embedded) => {
          if (item[embedded]) {
            const embeddedNoItems =
              embedded === Globals.childlistFieldName &&
              item[Globals.addItemModeFieldName] &&
              item[Globals.addItemModeFieldName] ===
                Globals.addWithPersistentFormNoItems
                ? true
                : noitems;
            item[embedded] = await this.findWithItems(
              user,
              item[embedded],
              filter,
              embeddedNoItems
            );
          }
        })
      );

      // post validate the item against schema (mostly to remove hidden properties)
      item = await this.validateItems(
        parentList[Globals.listSchemaFieldName],
        item,
        user,
        parentList[Globals.itemIdFieldName],
        {
          strict: false,
          post: true,
        }
      );
    }
    return item;
  }

  async insertMany(user, listid, item) {
    // find the parent list
    const parentList = await this.getParentList(listid);

    // validate permissions
    ValidatePerm.validateCPerm({
      user,
      list: parentList,
      throwError: true,
    });

    // validate item against schema
    let newItems = await this.validateItems(
      parentList[Globals.listSchemaFieldName],
      item,
      user,
      listid,
      {
        strict: true,
      }
    );

    // create it
    if (newItems instanceof Array) {
      newItems = await this.coll.insertMany(newItems);
    } else {
      // if the new item is a view, add a corresponding list
      if (
        listid === Globals.listOfAllViewId &&
        !newItems[Globals.childlistFieldName]
      ) {
        const newList = await this.insertMany(
          user,
          Globals.listOfAllListId,
          {}
        );
        newItems[Globals.childlistFieldName] = newList[Globals.itemIdFieldName];
      }

      try {
        await this.coll.insertOne(newItems);
      } catch (error) {
        if (error.code === 11000) {
          throw new Errors.BadRequest(
            NodeUtil.format(
              Errors.ErrMsg.Item_AlreadyExists,
              item[Globals.itemIdFieldName]
            )
          );
        }
      }
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
    } else {
      // post validate the item against schema (mostly to remove hidden properties)
      newItems = await this.validateItems(
        parentList[Globals.listSchemaFieldName],
        newItems,
        user,
        listid,
        {
          strict: false,
          post: true,
        }
      );
    }

    return newItems;
  }

  async patch(user, itemid, newItem) {
    if (!MongoDB.ObjectId.isValid(itemid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, itemid)
      );
    }

    // find the item to get it's parent list schema
    let item = await this.coll.findOne({
      [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid),
    });
    if (!item) {
      throw new Errors.NotFound(
        NodeUtil.format(Errors.ErrMsg.Item_NotFound, itemid)
      );
    }

    // find item schema
    const parentList = await this.getParentList(item[Globals.listIdFieldName]);

    ValidatePerm.validateRWPerm({
      user,
      list: parentList,
      item,
      throwError: true,
    });

    // validate item against schema
    const validItem = await this.validateItems(
      parentList[Globals.listSchemaFieldName],
      {
        ...newItem,
        // include the actual itemid when patching so we can ignore it when validating unicity
        [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid),
      },
      user,
      item[Globals.listIdFieldName],
      {
        strict: false,
      }
    );

    // update it
    const unsetProps = Schema.getEmptyProps(validItem);
    let pipeline = { $set: validItem };
    if (unsetProps.length > 0) {
      pipeline = [pipeline, { $unset: unsetProps }];
    }
    item = await this.coll.findOneAndUpdate(
      { [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid) },
      pipeline,
      { returnDocument: "after" }
    );
    if (!item.ok) {
      throw new Errors.InternalServerError(Errors.ErrMsg.Item_CouldNotUpdate);
    }

    // post validate the item against schema (mostly to remove hidden properties)
    item = await this.validateItems(
      parentList[Globals.listSchemaFieldName],
      item.value,
      user,
      item.value[Globals.listIdFieldName],
      {
        strict: false,
        post: true,
      }
    );

    return item;
  }

  async deleteAll(user, all = false) {
    if (user !== Globals.adminUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    let filter = {};
    if (!all) {
      filter = {
        $and: [
          {
            // do not delete the list of all lists and the list of all views
            [Globals.listIdFieldName]: {
              $ne: MongoDB.ObjectId(Globals.voidListId),
            },
          },
          /* { // do not delete the users
            [Globals.listIdFieldName]: {
              $ne: MongoDB.ObjectId(Globals.userListId),
            },
          }, */
          {
            // do not delete the users list
            [Globals.itemIdFieldName]: {
              $ne: MongoDB.ObjectId(Globals.userListId),
            },
          },
        ],
      };
      // do not delete the initial views (on list of view, on list of list, on user list)
      filter.$and = filter.$and.concat(
        Controler.initialViews().map((view) => {
          return {
            [Globals.itemIdFieldName]: {
              $ne: MongoDB.ObjectId(view[Globals.itemIdFieldName]),
            },
          };
        })
      );
    }

    return this.coll.deleteMany(filter);
  }

  async delete(user, itemid) {
    // unauth user have no edit permissions
    if (user === Globals.allUserName) {
      throw new Errors.Forbidden(Errors.ErrMsg.Forbidden);
    }

    if (!MongoDB.ObjectId.isValid(itemid)) {
      throw new Errors.BadRequest(
        NodeUtil.format(Errors.ErrMsg.MalformedID, itemid)
      );
    }

    // find the item to check if it is a list or an item
    const item = await this.coll.findOne({
      [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid),
    });
    if (!item) {
      throw new Errors.NotFound(
        NodeUtil.format(Errors.ErrMsg.Item_NotFound, itemid)
      );
    }

    // find item schema
    const parentList = await this.getParentList(item[Globals.listIdFieldName]);

    // check user permissions
    ValidatePerm.validateDPerm({
      user,
      list: parentList,
      item,
      throwError: true,
    });
    if (Controler.isList(item)) {
      // delete all associated items
      await this.coll.deleteMany({
        [Globals.listIdFieldName]: MongoDB.ObjectId(
          item[Globals.itemIdFieldName]
        ),
      });
    }

    return this.coll.deleteOne({
      [Globals.itemIdFieldName]: MongoDB.ObjectId(itemid),
    });
  }
}

module.exports = new Controler();
