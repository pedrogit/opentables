/// <reference types="cypress" />
const Globals = require("../../src/common/globals");

const username = "First User";
const email = "firstuser@gmail.com";
const password = "1firstuser";

const runOnlyLastTest = false;
const reCreateDatabase = !runOnlyLastTest || false;

const reload = () => {
  cy.visit('/');
  cy.wait(2000);
}

const signUp = ({
  localUsername,
  localEmail,
  localPassword
} = {
  localUsername: username,
  localEmail: email,
  localPassword: password
}) => {
  cy.get('#signUpButton').click();
  cy.get('input[name="username"]').focus().type(localUsername).tab();
  cy.get('input[name="email"]').focus().type(localEmail).tab();
  fillRecaptcha();
  cy.get('input[name="password"]').focus().type(password);
  cy.get('#addItemFormButton').click();
  cy.get('#loginLogoutButton').should('contain', 'Logout');
  cy.wait(2000);
}

const login = ({
  localEmail,
  localPassword
} = {
  localEmail: email,
  localPassword: password
}) => {
  cy.get('#loginLogoutButton')
    .then($loginButton => {
      if ($loginButton.text().includes('Logout')) {
        cy.get('#loginLogoutButton').click();
      }
      cy.get('#loginLogoutButton').click();
      cy.focused().type(localEmail).tab();
      cy.focused().type(localPassword + '{enter}');
      cy.wait(2000);
      cy.get('#loginLogoutButton').should('contain', 'Logout');
  });
}

const logout = () => {
  cy.get('#loginLogoutButton')
    .then($loginButton => {
      if (!($loginButton.text().includes('Login'))) {
        cy.get('#loginLogoutButton').click();
        cy.wait(1000);
      }
    });
  cy.get('#loginLogoutButton').should('contain', 'Login');
}

const fillRecaptcha = () => {
  cy.wait(2000);
  cy.get('#g-recaptcha *> iframe')
    .then($iframe => {
      const $body = $iframe.contents().find('body');
      cy.wrap($body)
        .find('.recaptcha-checkbox-border')
        .should('be.visible')
        .click();
    });
  cy.wait(2000);
}

if (reCreateDatabase) {
  describe('0 - Initial setup', () => {
    it('1.1 - Clean the database', () => {
      cy.request({
        method: 'DELETE', 
        url: 'http://localhost:3001/api/opentables', 
        auth: {
          username: "admin@gmail.com",
          password: "admin"
        }
      })
    })
  })

  if (runOnlyLastTest) {
    describe('Recreate a usable database', () => {
      it('1.1 - Create the first user', () => {
        reload();
        signUp();
        logout();
      })
    })
  }
}

const setConfigProperty = (property, value, viewProp = true, ) => {
  // open the config panel and change the add item mode to form
  cy.get('#configPanelOpenButton').click();
  var id = '#' + (viewProp ? 'view' : 'list') + 'list';
  cy.get('#' + (viewProp ? 'view' : 'list') + 'Properties').click();
  cy.get('#viewlist')
    .then($list => {
      // if the property is not already set, add it from the Add Optional Property menu
      if (!($list.text().includes(property.substring(1)))) {
        cy.get(id).trigger('mouseover');
        cy.get('#moreOptionsButton').click();
        cy.contains(property).click();
      }
    })

  // escape the Add Unset Property menu if it is open
  cy.get('body').click();

  // make sure the property is present or was added
  cy.get(id).should('contain', property.substring(1));

  // edit it
  cy.get(id + ' #' + property).dblclick();

  cy.get('input[name="' + property + '"]')
    .then($control => {
      //cy.task('log', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      //cy.task('log', $control.parent().attr())
      //cy.task('log', Cypress.dom.isJquery($control));
      //cy.task('log', $control.prop('outerHTML'));
      //cy.task('log', 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBB');

      if ($control.prop('outerHTML').includes('Select')) {
        cy.get('ul').contains(value).first().click();
      }
      else {
        cy.get('input[name="' + property + '"]').focus().type('{selectAll}{backspace}' + value + '{enter}');
      }
    })
  cy.wait(2000);
  cy.get('#closeConfigPanelButton').click();
}

const deleteItem = (text) => {
  cy.get('#itemlist').children().contains(text).trigger('mouseover');
  cy.get('#deleteItemButton').click();
  cy.wait(1000);
  cy.contains(text).should('not.exist');
}

describe('1 - Basic tests', () => {
  beforeEach(() => {
    reload();
  })

  afterEach(() => {
  })

  if (!runOnlyLastTest) {
    it('1.1 - Make sure the list of view is displayed by default', () => {
      cy.contains('Views').should('be.visible');
      cy.contains('Lists').should('be.visible');
    })
  }

  if (!runOnlyLastTest) {
    it('1.2 - Test the reload button', () => {
      cy.get('#reloadListButton');
      cy.wait(2000);
      cy.contains('Views').should('be.visible');
      cy.contains('Lists').should('be.visible');
    })
  }

  if (!runOnlyLastTest) {
    it('1.3 - Test Sign Up', () => {
      // make sure the login form is not visible
      cy.get('#loginForm').should('not.be.visible');

      // click on the SignUp button
      cy.get('#signUpButton').click();

      // make sure the Register button is disabled when nothing is entered yet
      cy.get('#addItemFormButton').should('be.disabled');
      
      // test submitting just after the register button is activated
      cy.get('input[name="username"]').focus().type('F');
      cy.get('#addItemFormButton').should('not.be.disabled');
      cy.get('#addItemFormButton').click();
      cy.get('#errorPanel').should('contain', 'You failed to prove that you are not a robot...');
      
      // now after the recaptcha is filled
      fillRecaptcha();
      cy.get('#addItemFormButton').click();
      cy.get('#errorPanel').should('contain', 'Item is not valid. "email" is missing...');

      // fill in more username info and email and click
      cy.get('input[name="username"]').focus().type('irst');
      cy.get('input[name="email"]').focus().type('firstuser@gmail.com');
      cy.get('#addItemFormButton').click();
      cy.get('#errorPanel').should('contain', 'Item is not valid. "password" is missing...');
      
      // fill in the password
      cy.get('input[name="password"]').focus().type('1first');
      cy.get('#addItemFormButton').click();
      cy.get('#errorPanel').should('contain', 'Item is not valid. "username" should have a minimum of 6 characters...');

      // fill in remaining username info
      cy.get('input[name="username"]').focus().type(' User');
      cy.get('#addItemFormButton').click();
      cy.get('#errorPanel').should('contain', 'Item is not valid. "password" should have a minimum of 8 characters...');

      // success!
      cy.get('input[name="password"]').focus().type('user');
      cy.get('#addItemFormButton').click();
      cy.get('#errorPanel').should('contain', 'Congratulation First User');

      // logout
      logout();

      // try inserting a new user with the same username
      // click on the SignUp button
      cy.get('#signUpButton').click();
      cy.get('input[name="username"]').focus().type('First User');
      cy.get('input[name="email"]').focus().type(email);
      cy.get('input[name="password"]').focus().type('xxxxxxx');
      fillRecaptcha();
      cy.get('#addItemFormButton').click();
      cy.get('#errorPanel').should('contain', 'Item is not valid. "username" should be unique but value (First User) already exists...');
      
      // cancel to return to the main view
      cy.get('#addCancelItemFormButton').click();
      cy.get('#headerViewName').should('contain', 'Views');
    })
  }

  if (!runOnlyLastTest) {
    it('1.4 - Test the login form', () => {
      // make sure the login form is not visible
      cy.get('#loginForm').should('not.be.visible');

      // login
      cy.get('#loginLogoutButton').click();
      cy.get('#loginForm').should('be.visible');
      cy.get('#emailInput').should('have.focus');
      cy.get('#loginButton').should('be.disabled');
      cy.get('#loginHelper').should('not.contain', 'Invalid email or password...');
      cy.focused().type(email);
      cy.get('#loginButton').should('be.disabled');

      // cancel
      cy.get('#loginCancelButton').click();
      cy.get('#loginForm').should('not.be.visible');

      // start again with bad email
      cy.get('#loginLogoutButton').click();
      cy.focused().type("x" + email).tab();
      cy.focused().type(password);
      cy.get('#loginButton').should('not.be.disabled');
      cy.focused().type('{enter}');
      cy.get('#loginHelper').should('contain', 'Invalid email or password...');

      // make sure the helper text disappear when entering new text
      cy.focused().type('x');
      cy.get('#loginHelper').should('not.contain', 'Invalid email or password...');
      cy.get('#loginCancelButton').click();

      // start again with good email but bad password
      cy.get('#loginForm').should('not.be.visible');
      cy.get('#loginLogoutButton').click();
      cy.get('#loginHelper').should('not.contain', 'Invalid email or password...');
      cy.focused().type(email).tab();
      cy.focused().type("x" + password + '{enter}');
      cy.get('#loginHelper').should('contain', 'Invalid email or password...');
      cy.get('#loginCancelButton').click();

      // start again with everything good and logout
      cy.get('#loginForm').should('not.be.visible');
      login();
      logout();
    })
  }

  if (!runOnlyLastTest || reCreateDatabase) {
    it('1.5 - Test creating a new list and edit it', () => {
      login();
      cy.get('#addItemButton').click();
      cy.wait(1000);
      cy.get('#itemlist').should('contain', 'View Name');
      cy.contains('View Name').should('be.visible');

      // edit new view name
      cy.contains('View Name').click();
      cy.get('#configPanelOpenButton').click();
      cy.wait(2000);

      cy.get('#viewlist').contains('View Name').dblclick();
      cy.focused().type('{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}First User View 1{enter}');
      
      // add an optional property to the schema
      cy.get('#listProperties').click();
      cy.get('#listlist').contains('prop1').dblclick();
      cy.focused().type('{selectAll}prop1: {{}type: string, required}, prop2: string{enter}');


      // close the config panel and make sure the view name was changed
      cy.get('#closeConfigPanelButton').click();
      cy.get('#headerPanel').should('contain', 'First User View 1');

      // add a new item and edit it
      cy.get('#addItemButton').click();
      cy.get('#itemlist').contains('prop1').dblclick();
      cy.focused().type(' edited{enter}');
      cy.get('#itemlist').should('contain', 'prop1 edited');

      // add the second property
      cy.get('#itemlist').children().contains('prop1 edited').trigger('mouseover');
      cy.get('#moreOptionsButton').click();
      cy.get('li').contains('prop2').click();
      cy.get('body').click()
      cy.get('#itemlist').should('contain', 'prop2');

      // and fill it
      cy.get('#itemlist').contains('prop2').dblclick();
      cy.focused().type(' edited{enter}');

      // unfill it to make it disappear
      cy.get('#itemlist').contains('prop2').dblclick();
      cy.focused().type('{selectAll}{backspace}{enter}');
      cy.get('#prop2').should('not.exist');

      // unfill it to make it disappear
      cy.get('#itemlist').contains('prop1').dblclick();
      cy.focused().type('{selectAll}{backspace}{enter}');
      cy.get('#itemlist').should('contain', 'prop1');

      // delete it
      deleteItem('prop1');
    });
  }

  if (!runOnlyLastTest) {
    it('1.6 - Test the different add item modes', () => {
      const addAndDeleteItemWithForm = (reset, type) => {
        if (type === Globals.addItemModeAsForm) {
          // add a new item in form mode
          cy.get('#addItemButton').click();
        }
        else {
          cy.get('#addItemButton').should('not.exist');
        }
        cy.get('input[name="prop1"]').should('be.visible');

        cy.get('#addCancelItemFormButton').should('be.visible');
        cy.get('#addItemFormButton').should('be.visible');
        cy.get('#addItemFormButton').should('be.disabled');
        if (reset) {
          cy.get('input[name="prop1"]').should('have.value', 'prop1');
          cy.get('input[name="prop1"]').focus().type(' more text');
          cy.get('#addCancelItemFormButton').click();
          cy.get('input[name="prop1"]').should('not.contain', 'more text');
          cy.get('input[name="prop2"]').should('not.exist');

        }
        cy.get('input[name="prop1"]').focus().type(' ');
        cy.get('#addItemFormButton').should('be.enabled');
        cy.focused().type('edited 2');

        // add and fill the second property
        cy.get('#itemlist').trigger('mouseover');
        cy.get('#moreOptionsButton').click();
        cy.get('li').contains('prop2').click();
        cy.get('body').click();

        // make sure it was added
        cy.get('input[name="prop2"]').should('be.visible');

        // save the new item
        cy.get('#addItemFormButton').click();
        cy.wait(1000);

        // check for the presence of the new item only when it is still visible (not in persistent form no item mode)
        cy.get('#headerViewName')
          .then($headerName => {
            if (($headerName.text().includes('First User View 1'))) {
              // make sure it was added
              cy.contains('prop1 edited 2').should('be.visible');

              // delete it
              deleteItem('prop1 edited 2');
            }
          })
      }

      login();

      // set the view
      cy.contains('First User View 1').click();

      // change to form mode
      setConfigProperty('add_item_mode', Globals.addItemModeAsForm);

      // add and cancel
      cy.get('#addItemButton').click();
      cy.get('input[name="prop1"]').focus().type(' edited');

      cy.get('#addCancelItemFormButton').click();
      cy.get('input[name="prop1"]').should('not.exist');

      // make sure the editing field was reset
      cy.get('#addItemButton').click();
      cy.get('input[name="prop1"]').should('have.value', 'prop1');

      addAndDeleteItemWithForm(false, Globals.addItemModeAsForm);
      // form should not be visible anymore
      cy.get('input[name="prop1"]').should('not.exist');

      // change to persistant form mode
      setConfigProperty('add_item_mode', Globals.addWithPersistentFormAndItems);

      addAndDeleteItemWithForm(true, Globals.addWithPersistentFormAndItems);
      // persistent form should still exists
      cy.get('input[name="prop1"]').should('exist');

      // change to persistant form mode without items
      setConfigProperty('add_item_mode', Globals.addWithPersistentFormNoItems);

      // item list should have only one children
      cy.get('#itemlist').children().should('have.length', 1);
      addAndDeleteItemWithForm(false, Globals.addWithPersistentFormNoItems);

      // delete it
      cy.get('#headerViewName').should('contain', 'Views');
      cy.contains('First User View 1').click();
      setConfigProperty('add_item_mode', Globals.addWithPersistentFormAndItems);

      // make sure it was added
      cy.contains('prop1 edited 2').should('be.visible');

      // now delete it
      deleteItem('prop1 edited 2');
    })
  }  // runOnlyLastTest
}) // describe('1 - Basic tests'

describe('2 - UI permission behavior tests', () => {
  beforeEach(() => {
    reload();
  })

  afterEach(() => {
  })

  if (!runOnlyLastTest) {
    it('2.1 - Test UI behavior when unauthorized (@all) with different add item modes', () => {
      // All default permissions

      // set the view
      cy.contains('First User View 1').click();

      /////////////////////////////////////////////////////
      // login and change the add item mode to persistent_form_no_items
      login();
      setConfigProperty('add_item_mode', Globals.addWithPersistentFormNoItems);

      cy.get('input[name="prop1"]').should('exist'); // check form is displayed
      cy.get('#addItemButton').should('not.exist'); // check add button is not displayed

      // add an item for future tests
      cy.get('input[name="prop1"]').focus().type(' {enter}');
      cy.wait(2000);
      cy.contains('First User View 1').click();

      logout();
      // since we are not logged in and the list is in persistent_form_no_items
      // mode, it should display the login form
      cy.get('#loginForm').should('contain', Globals.permissionDenied);
      cy.get('#addItemButton').should('not.exist');
      cy.get('#loginCancelButton').click(); // cancel

      /////////////////////////////////////////////////////
      // login and change the add item mode to persistent_form
      login();
      setConfigProperty('add_item_mode', Globals.addWithPersistentFormAndItems);
      
      cy.get('input[name="prop1"]').should('exist'); // check form is displayed
      cy.get('#addItemButton').should('not.exist'); // check add button is not displayed
      cy.get('#itemlist').children().contains('prop1').trigger('mouseover');
      cy.get('#deleteItemButton').should('exist'); // check delete button is displayed
      cy.get('#deleteItemButton').should('be.enabled'); // check delete button is enabled
      cy.get('#moreOptionsButton').should('exist'); // check moreOption button is displayed
      cy.get('#moreOptionsButton').click();
      cy.get('li').contains(Globals.addOptionalPropertyMenu).should('exist'); // check Add optional property exists
      cy.get('li').contains(Globals.permissionDenied).should('not.exist'); // and is enabled
      cy.get('body').click();

      // test as @all
      logout();
      cy.get('input[name="prop1"]').should('not.exist');
      cy.get('#addItemButton').should('not.exist'); // check add button is not displayed
      cy.get('#itemlist').children().contains('prop1').trigger('mouseover');
      cy.get('#deleteItemButton').should('exist'); // check delete button is displayed
      cy.get('#deleteItemButton').should('not.be.enabled'); // check delete button is enabled
      cy.get('#moreOptionsButton').should('exist'); // check moreOption button is displayed
      cy.get('#moreOptionsButton').click();
      cy.get('li').contains(Globals.addOptionalPropertyMenu).should('exist'); // check Add optional property exists
      cy.get('li').contains(Globals.permissionDenied).should('exist'); // and is not enabled
      cy.get('body').click();

      /////////////////////////////////////////////////////
      // login and change the add item mode to form
      login();
      setConfigProperty('add_item_mode', Globals.addItemModeAsForm);

      cy.get('input[name="prop1"]').should('not.exist');
      cy.get('#addItemButton').should('exist');
      cy.get('#addItemButton').should('be.enabled');

      // test as @all
      logout();
      cy.get('input[name="prop1"]').should('not.exist');
      cy.get('#addItemButton').should('exist');
      cy.get('#addItemButton').should('not.be.enabled');
      cy.get('#itemlist').children().contains('prop1').trigger('mouseover');
      cy.get('#deleteItemButton').should('exist'); // check delete button is displayed
      cy.get('#deleteItemButton').should('not.be.enabled'); // check delete button is enabled
      cy.get('#moreOptionsButton').should('exist'); // check moreOption button is displayed
      cy.get('#moreOptionsButton').click();
      cy.get('li').contains(Globals.addOptionalPropertyMenu).should('exist'); // check Add optional property exists
      cy.get('li').contains(Globals.permissionDenied).should('exist'); // and is not enabled
      cy.get('body').click();

      /////////////////////////////////////////////////////
      // login and change the add item mode to default_value
      login();
      setConfigProperty('add_item_mode', Globals.addItemModeDefault);

      cy.get('input[name="prop1"]').should('not.exist');
      cy.get('#addItemButton').should('exist');
      cy.get('#addItemButton').should('be.enabled');

      // test as @all
      logout();
      cy.get('input[name="prop1"]').should('not.exist');
      cy.get('#addItemButton').should('exist');
      cy.get('#addItemButton').should('not.be.enabled');
      cy.get('#itemlist').children().contains('prop1').trigger('mouseover');
      cy.get('#deleteItemButton').should('exist'); // check delete button is displayed
      cy.get('#deleteItemButton').should('not.be.enabled'); // check delete button is enabled
      cy.get('#moreOptionsButton').should('exist'); // check moreOption button is displayed
      cy.get('#moreOptionsButton').click();
      cy.get('li').contains(Globals.addOptionalPropertyMenu).should('exist'); // check Add optional property exists
      cy.get('li').contains(Globals.permissionDenied).should('exist'); // and is not enabled
      cy.get('body').click();
    })
  } // runOnlyLastTest\

  it('2.2 - Test UI behavior when @all have RW permission on view', () => {
    login();
    cy.contains('First User View 1').click();
    setConfigProperty('rw_permissions', '@all');

  })

}) //describe('2 - UI permission behavior tests'