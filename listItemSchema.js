class ItemSchema {
  constructor(schema) {
    this.schema = schema;
    
  };

  validate(jsonstr) {
    // validate required fields
    // if strict invalidate non schema fields
    // validate and sanitize each field
    return true;
  };

}

module.exports = ItemSchema;
