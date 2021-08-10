const mongoose = require('mongoose');
const mongSchema = mongoose.Schema;

const Errors = require('../utils/errors');
const Utils = require('../utils/utils');
const ItemSchema = require('../listitemschema');

// create list schema & model
const ListItemSchema = new mongSchema({
  listid: {
    type: mongSchema.Types.ObjectId,
    ref: 'List'
  }
}, {versionKey: '_version', strict: false , id: false});

ListItemSchema.virtual('items', {
  ref: 'ListItemModelName', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'listid', // is equal to foreignField
});

ListItemSchema.set('toObject', { virtuals: true });
ListItemSchema.set('toJSON', { virtuals: true});

ListItemSchema.methods.validateItem = function(obj, schema) {
  var schema = new ItemSchema(Utils.OTSchemaToJSON(schema));
  return schema.validateJson(obj);
}


const ListItemModel = mongoose.model('ListItemModelName', ListItemSchema);

module.exports = ListItemModel;