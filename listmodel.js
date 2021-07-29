const mongoose = require('mongoose');
const mongSchema = mongoose.Schema;

// create list schema & model
const ListSchema = new mongSchema({
  ownerid: {
    type: String,
    required: [true, 'ownerid is required']
  },
  rperm: {
    type: String,
    required: [true, 'read permission is required']
  },
  wperm: {
    type: String,
    required: [true, 'write permission is required']
  },
  listschema: {
    type: String,
    required: [true, 'listschema is required']
  },
  items: {
    type: [mongSchema.Types.ObjectId], ref: 'ListItem'
  }
}, { versionKey: '_version' });

const ListModel = mongoose.model('List', ListSchema);

module.exports = ListModel;