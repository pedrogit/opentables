// eslint-disable-next-line max-classes-per-file
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

const ErrMsg = {
  Database_CouldNotConnect: "Could not connect to database...",
  InvalidUser: "User does not exists...",
  CouldNotLogin: "Could not login user...",
  Forbidden:
    "User does not have sufficient permission to execute this request...",
  MalformedID: "Malformed ID (%s)...",
  CouldNotCreate: "Could not create %s...",
  InvalidEmailPassword: "Invalid email or password...",

  Schema_Null: "Schema can not be null...",
  Schema_Malformed: "JSON schema is not well formed...",
  Schema_TooManyLevels: 'Too many levels for schema "%s"...',
  Schema_InvalidValue: "Invalid value (%s) for %s...",
  Schema_InvalidSchema: "Invalid schema (%s)...",
  Schema_InvalidSchemaParameter:
    'Invalid schema parameter (%s) for property "%s"...',
  Schema_InvalidSchemaOneRequired:
    "Invalid schema (%s). At least one property must be required...",

  SchemaValidator_NotUnique:
    'Item is not valid. "%s" should be unique but value (%s) already exists...',
  SchemaValidator_NoControler: "No controler provided to Schema...",
  SchemaValidator_MissingProp: 'Item is not valid. "%s" is missing...',
  SchemaValidator_InvalidOptionValue:
    'Item is not valid. "%s" is not a valid option value for "%s" ("%s")...',
  SchemaValidator_InvalidOption:
    'Item is not valid. "%s" is not a valid value for the "options" property...',
  SchemaValidator_InvalidType:
    'Item is not valid. "%s" value (%s) is not a valid %s...',
  SchemaValidator_Malformed: "Item is not valid. %s...",
  SchemaValidator_Required:
    'Item is not valid. A value is required for "%s"...',
  SchemaValidator_NoDefault: 'Item does not allow default value for "%s"...',
  SchemaValidator_MinLength:
    'Item is not valid. "%s" should have a minimum of %s characters...',

  List_Missing: "List ID is missing from query...",
  List_NotFound: "Could not find list (%s)...",

  Item_NotFound: "Could not find list item (%s)...",
  Item_Invalid: "Invalid item...",
  Item_CouldNotCreate: "Could not create item...",
  Item_CouldNotUpdate: "Could not update item...",
  Item_AlreadyExists:
    "Could not create item. An item with this ID (%s) already exists...",

  Filter_Null: "Filter can not be null...",
  Filter_InvalidFilter: "Invalid filter (%s)...",
  Filter_Malformed: "JSON filter is not well formed...",

  Recaptcha_Failed: "You failed to prove that you are not a robot...",

  ComponentParser_Invalid: "Invalid component description (%s)...",
};

module.exports = {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  InternalServerError,
  ErrMsg,
};
