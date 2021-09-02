class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

class NotFound extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
  }
}

var ErrMsg = {
  'Database_CouldNotConnect': 'Could not connect to database...',
  'InvalidUser': 'User does not exists...',
  'CouldNotLogin': 'Could not login user...',
  'MalformedID': 'Malformed ID (%s)...',
  'InvalidSimpleJsonStr': 'Invalid simple JSON string (%s)...',
  'ItemSchema_Null': 'Schema can not be null...',
  'ItemSchema_Malformed': 'JSON schema is not well formed...',
  'ItemSchema_TooManyLevels': 'Too many levels for ItemSchema "%s"...',
  'ItemSchema_InvalidValue': 'Invalid value (%s) for %s...',
  'ItemSchema_MissingField': 'JSON object is not valid. "%s" is missing...',
  'ItemSchema_InvalidField': 'JSON object is not valid. "%s" is not a valid field for this schema...',
  'ItemSchema_InvalidType': 'JSON object is not valid. Field "%s" value (%s) is not a valid %s...',
  'ItemSchema_InvalidSchema': 'Invalid schema (%s)...',
  'ItemSchema_InvalidSchemaParameter': 'Invalid schema parameter (%s) for field "%s"...',
  'ItemSchema_NotUnique': 'JSON object is not valid. Field "%s" should be unique but value (%s) already exists...',
  'List_NotFound': 'Could not find list (%s)...',
  'ListItem_NotFound': 'Could not find list item (%s)...',
  'ListItem_Invalid': 'Invalid item...',
  'ListItem_CouldNotCreate': 'Could not create item...',
  'ListItem_CouldNotUpdate': 'Could not update item...',
  'ItemFilter_Null': 'Filter can not be null...',
  'ItemFilter_InvalidFilter': 'Invalid filter (%s)...',
  'ItemFilter_Malformed': 'JSON filter is not well formed...',
}

module.exports = {
  BadRequest : BadRequest,
  Unauthorized : Unauthorized,
  NotFound : NotFound,
  InternalServerError : InternalServerError,
  ErrMsg : ErrMsg
}
