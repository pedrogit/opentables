/// <reference types="cypress" />

const username = "First User";
const email = "firstuser@gmail.com";
const password = "1firstuser";
const runAllTests = true;

const reload = () => {
  cy.visit('http://localhost:3000');
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
      cy.get('#loginLogoutButton').should('contain', 'Logout');
      cy.wait(2000);
  });
}

const logout = () => {
  cy.get('#loginLogoutButton')
    .then($loginButton => {
      if (!($loginButton.text().includes('Login'))) {
        cy.get('#loginLogoutButton').click();
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

describe('Initial setup', () => {
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

if (!runAllTests) {
  describe('Recreate a usable database', () => {
    it('1.1 - Create the first user', () => {
      reload();
      signUp();
      logout();
    })
  })
}

describe('Opentable basic tests', () => {
  if (runAllTests) {
    beforeEach(() => {
      // Cypress starts out with a blank slate for each test
      // so we must tell it to visit our website with the `cy.visit()` command.
      // Since we want to visit the same URL at the start of all our tests,
      // we include it in our beforeEach function so that it runs before each test
      reload();
    })

    afterEach(() => {
      // Cypress starts out with a blank slate for each test
      // so we must tell it to visit our website with the `cy.visit()` command.
      // Since we want to visit the same URL at the start of all our tests,
      // we include it in our beforeEach function so that it runs before each test
    })

    it('1.1 - Make sure the list of view is displayed by default', () => {
      cy.contains('Views').should('be.visible');
      cy.contains('Lists').should('be.visible');
    })

    it('1.2 - Test the reload button', () => {
      cy.get('#reloadListButton');
      cy.wait(2000);
      cy.contains('Views').should('be.visible');
      cy.contains('Lists').should('be.visible');
    })

    it('2.1 - Test Sign Up', () => {
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

    it('3.1 - Test the login form', () => {
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
  } // runAllTests

  it('4.1 - Test creating a new list and edit it', () => {
    login();
    cy.get('#addItemButton').click();
    cy.wait(1000);
    cy.get('#itemlist').should('contain', 'View Name');
    cy.contains('View Name').should('be.visible');

    // edit new view name
    cy.contains('View Name').click();
    cy.get('#configPanelOpenButton').click();
    cy.wait(2000);

    //cy.get('#listProperties').click();*/
    cy.get('#viewlist').contains('View Name').dblclick();
    cy.focused().type('{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}First User View 1{enter}');
    
    // close the config panel and make sure the view name was changed
    cy.get('#closeConfigPanelButton').click();
    cy.get('#headerPanel').should('contain', 'First User View 1');

    // add a new item and edit it
    cy.get('#addItemButton').click();
    cy.get('#itemlist').contains('prop1').dblclick();
    cy.focused().type(' edited{enter}');
    cy.get('#itemlist').should('contain', 'prop1 edited');
  });

  it('5.1 - Test the different add item modes', () => {
    const changeAddItemMode = (mode) => {
      // open the config panel and change the add item mode to form
      cy.get('#configPanelOpenButton').click();
      cy.get('#viewlist')
        .then($viewlist => {
          if (!($viewlist.text().includes('Add_item_mode'))) {
            cy.get('#viewlist').trigger('mouseover');
            cy.get('#moreItemButton').click();
            cy.contains('add_item_mode').click();
            // escape the Add Unset Property menu
            cy.get('body').click()
          }
        })
         
      cy.get('#viewlist').should('contain', 'Add_item_mode');
      cy.get('#viewlist #add_item_mode').dblclick();
      cy.contains(mode).click();
      cy.wait(2000);
      cy.get('#closeConfigPanelButton').click();
    }

    const addAndDeleteItemWithForm = (reset = false) => {
      // add a new item in form mode
      cy.get('#addItemButton').click();
      cy.get('input[name="prop1"]').should('be.visible');
      cy.get('#addCancelItemFormButton').should('be.visible');
      cy.get('#addItemFormButton').should('be.visible');
      cy.get('#addItemFormButton').should('be.disabled');
      if (reset) {
        cy.get('input[name="prop1"]').should('have.value', 'prop1');
        cy.get('input[name="prop1"]').focus().type(' more text');
        cy.get('#addCancelItemFormButton').click();
        cy.get('input[name="prop1"]').should('not.contain', 'more text');
      }
      cy.get('input[name="prop1"]').focus().type(' ');
      cy.get('#addItemFormButton').should('be.enabled');
      cy.focused().type('edited 2{enter}');
      cy.wait(2000);

      // check for the presence af the new item only when not in persistent form no item mode
      cy.get('#viewlist')
        .then($viewlist => {
          if (($viewlist.text().includes('Add_item_mode'))) {
            // make sure it was added
            cy.contains('prop1 edited 2').should('be.visible');

            // delete it
            cy.get('#itemlist').children().contains('prop1 edited 2').trigger('mouseover');
            cy.get('#deleteItemButton').click();
            cy.wait(2000);
            cy.contains('prop1 edited 2').should('not.exist');
          }
        })
    }

    login();

    // set the view
    cy.contains('First User View 1').click();

    // change to form mode
    changeAddItemMode('form');

    // add and cancel
    cy.get('#addItemButton').click();
    cy.get('#addCancelItemFormButton').click();
    cy.get('input[name="prop1"]').should('not.exist');

    addAndDeleteItemWithForm();
    // form should not be visible anymore
    cy.get('input[name="prop1"]').should('not.exist');

    // change to persistant form mode
    changeAddItemMode('persistent_form');
    addAndDeleteItemWithForm(true);
    // persistent form should still exists
    cy.get('input[name="prop1"]').should('exist');

    // change to persistant form mode without items
    changeAddItemMode('persistent_form_no_items');
    // item list should have only one children
    cy.get('#itemlist').children().should('have.length', 1);
    addAndDeleteItemWithForm();
  })
    
/*  it('1.3 - Makes the login form appear when adding an item, enter a valid password and check the edited value', () => {
    // make sure the login form is not visible
    cy.get('#loginForm').should('not.be.visible');

    // click on the add button
    cy.get('#headerButtons').trigger('mouseover');
    cy.get('#addItemButton').click();

    // make sure login panel is open
    cy.get('#loginForm').should('be.visible');
    cy.get('#loginHelper').should('not.contain', 'Invalid email or password...');
    cy.get('#emailInput').should('have.focus');

    // enter valid credentials
    cy.focused().type('admin@gmail.com').tab();
    cy.get('#passwordInput').should('have.focus');
    cy.focused().type('a');
    cy.get('#loginButton').should('not.be.disabled');
    cy.focused().type('dmin{enter}');
    cy.get('#loginForm').should('not.be.visible');

    // make sure the new item was added
    cy.contains('View name').should('be.visible');

    // make sure the login button is in logout mode and logout
    cy.get('#headerButtons').trigger('mouseover');
    cy.get('#loginLogoutButton').should('contain', 'Logout admin@gmail.com');
    cy.get('#loginLogoutButton').click();
    cy.get('#loginForm').should('not.be.visible');

    // now edit and unedit the value

    // try to edit the view name
    cy.contains('View name').dblclick();

    // make sure login panel is open
    cy.get('#loginForm').should('be.visible');
    cy.get('#loginHelper').should('not.contain', 'Invalid email or password...');
    cy.get('#emailInput').should('have.focus');

    // enter valid credentials
    cy.focused().type('admin@gmail.com').tab();
    cy.get('#passwordInput').should('have.focus');
    cy.focused().type('a');
    cy.get('#loginButton').should('not.be.disabled');
    cy.focused().type('dmin{enter}');
    cy.get('#loginForm').should('not.be.visible');

    // edit the name
    cy.get('input[id="outlined-basic"]').focus().type('{end}s{enter}');
    cy.contains('View name').should('contain', 'View names');

    // undo the edit
    cy.contains('View names').dblclick();
    cy.get('input[id="outlined-basic"]').focus().type('{end}{backspace}{enter}');
    cy.contains('View name').should('contain', 'View name');
    cy.contains('View name').should('not.contain', 'View names');

    // delete the item
    cy.contains('View name').trigger('mouseover');
    cy.get('#deleteItemButton').click();
    cy.contains('View name').should('not.exist');

    // make sure the login button is in logout mode and logout
    cy.get('#headerButtons').trigger('mouseover');
    cy.get('#loginLogoutButton').should('contain', 'Logout admin@gmail.com');
    cy.get('#loginLogoutButton').click();
  })*/
})

/*describe('opentable basic tests', () => {
  it('2.1 - create a new list', () => {
    // go to the website
    cy.visit('http://localhost:3000');
    cy.wait(2000);

    // make sure the login form is not visible
    cy.get('#loginForm').should('not.be.visible');

    // click on the add button
    cy.get('#headerButtons').trigger('mouseover');
    cy.get('#addItemButton').click();

    // make sure login panel is open
    cy.get('#loginForm').should('be.visible');
    cy.get('#loginHelper').should('not.contain', 'Invalid email or password...');
    cy.get('#emailInput').should('have.focus');

    // enter valid credentials
    cy.focused().type('admin@gmail.com').tab();
    cy.get('#passwordInput').should('have.focus');
    cy.focused().type('a');
    cy.get('#loginButton').should('not.be.disabled');
    cy.focused().type('dmin{enter}');
    cy.get('#loginForm').should('not.be.visible');

    // make sure the new item was added
    cy.contains('View name').should('be.visible');
  })
})*/