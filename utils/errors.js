class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

class NotFound extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

var ErrMsg = {
  'Database_CouldNotConnect': 'Could not connect to database...',
  'MalformedID': 'Malformed ID (%s)...',
  'InvalidSimpleJsonStr': 'Invalid simple JSON string (%s)...',
  'ItemSchema_Null': 'ItemSchema: Schema can not be null...',
  'ItemSchema_Malformed': 'ItemSchema: JSON schema is not well formed...',
  'ItemSchema_TooManyLevels': 'Too many levels for ItemSchema "%s"...',
  'ItemSchema_InvalidValue': 'Invalid value (%s) for %s...',
  'ItemSchema_MissingField': 'ItemSchema: JSON object is not valid. "%s" is missing...',
  'ItemSchema_InvalidField': 'ItemSchema: JSON object is not valid. "%s" is not a valid field for this schema...',
  'ItemSchema_InvalidType': 'JSON object is not valid. Field "%s" value (%s) is not a valid %s...',
  'ItemSchema_InvalidSchema': 'Invalid schema (%s)...',
  'ItemSchema_InvalidSchemaParameter': 'Invalid schema parameter (%s) for field "%s"...',
  'List_NotFound': 'Could not find list (%s)...',
  'ListItem_NotFound': 'Could not find list item (%s)...',
  'ListItem_Invalid': 'Invalid item...',
  'ListItem_CouldNotCreate': 'Could not create item...',
  'ListItem_CouldNotUpdate': 'Could not update item...'
}

module.exports = {
  BadRequest : BadRequest,
  NotFound : NotFound,
  ErrMsg : ErrMsg
}
