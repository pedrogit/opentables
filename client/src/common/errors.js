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

class Forbidden extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
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

class FatalServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 599;
  }
}

var ErrMsg = {
  Database_CouldNotConnect: "Could not connect to database...",
  InvalidUser: "User does not exists...",
  CouldNotLogin: "Could not login user...",
  Forbidden: "User does not have sufficient permission to execute this request...",
  MalformedID: "Malformed ID (%s)...",
  CouldNotCreate: "Could not create %s...",

  Schema_Null: "Schema can not be null...",
  Schema_Malformed: "JSON schema is not well formed...",
  Schema_TooManyLevels: 'Too many levels for schema "%s"...',
  Schema_InvalidValue: "Invalid value (%s) for %s...",
  Schema_InvalidSchema: "Invalid schema (%s)...",
  Schema_InvalidSchemaParameter: 'Invalid schema parameter (%s) for property "%s"...',

  SchemaValidator_NotUnique: 'JSON object is not valid. Property "%s" should be unique but value (%s) already exists...',
  SchemaValidator_NoControler: "No controler provided to Schema...",
  SchemaValidator_MissingProp: 'JSON object is not valid. "%s" is missing...',
  SchemaValidator_InvalidOptionValue: 'JSON object is not valid. "%s" is not a valid option value for "%s" ("%s")...',
  SchemaValidator_InvalidOption: 'JSON object is not valid. "%s" is not a valid value for the "options" property...',
  SchemaValidator_InvalidType: 'JSON object is not valid. Property "%s" value (%s) is not a valid %s...',
  SchemaValidator_Malformed: "JSON object is not valid. %s...",
  SchemaValidator_Required: "JSON object is not valid. A value is required for the %s property...",

  List_Missing: "List ID is missing from query...",
  List_NotFound: "Could not find list (%s)...",

  Item_NotFound: "Could not find list item (%s)...",
  Item_Invalid: "Invalid item...",
  Item_CouldNotCreate: "Could not create item...",
  Item_CouldNotUpdate: "Could not update item...",
  Item_AlreadyExists: "Could not create item. An item with this ID (%s) already exists...",

  Filter_Null: "Filter can not be null...",
  Filter_InvalidFilter: "Invalid filter (%s)...",
  Filter_Malformed: "JSON filter is not well formed...",

  ComponentParser_Invalid: "Invalid component description (%s)...",
};

module.exports = {
  BadRequest: BadRequest,
  Unauthorized: Unauthorized,
  Forbidden: Forbidden,
  NotFound: NotFound,
  InternalServerError: InternalServerError,
  ErrMsg: ErrMsg,
};
