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
  }/*,
    items: {
    type: [mongSchema.Types.ObjectId], ref: 'ListItem'
  }*/
}, { versionKey: '_version', id: false });

ListSchema.virtual('items', {
  ref: 'ListItem', // The Model to use
  localField: '_id', // Find in Model, where localField 
  foreignField: 'listid', // is equal to foreignField
});

ListSchema.set('toObject', { virtuals: true });
ListSchema.set('toJSON', { virtuals: true});
/*
ListSchema.set('toJSON', { virtuals: true,
                           transform: function(doc, ret) {
                                       delete ret.id;
                           }
                          });
*/

const ListModel = mongoose.model('List', ListSchema);

module.exports = ListModel;