const mongoose = require('mongoose');
const mongSchema = mongoose.Schema;

// create list schema & model
const ListItemSchema = new mongSchema({
  listid: {
    type: mongSchema.Types.ObjectId,
    ref: 'List',
    required: [true, 'listid is required']
  },
  item: {
    type: mongSchema.Types.Mixed,
    required: [true, 'item is required']
  }
}, { versionKey: '_version' });

const ListItemModel = mongoose.model('ListItemModelName', ListItemSchema);

module.exports = ListItemModel;