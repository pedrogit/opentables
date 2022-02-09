/// <reference types="cypress" />

describe('opentable basic tests', () => {
    beforeEach(() => {
      // Cypress starts out with a blank slate for each test
      // so we must tell it to visit our website with the `cy.visit()` command.
      // Since we want to visit the same URL at the start of all our tests,
      // we include it in our beforeEach function so that it runs before each test
      cy.visit('http://localhost:3000');
      cy.wait(2000);
    })

    afterEach(() => {
      // Cypress starts out with a blank slate for each test
      // so we must tell it to visit our website with the `cy.visit()` command.
      // Since we want to visit the same URL at the start of all our tests,
      // we include it in our beforeEach function so that it runs before each test
      cy.get('#headerButtons').trigger('mouseover');
      cy.get('#loginLogoutButton')
        .then(($loginButton) => {
          if (!($loginButton.text().includes('Login'))) {
            cy.get('#loginLogoutButton').click();
          }
        });
      cy.get('#loginLogoutButton').should('contain', 'Login');
    })
  
    it('1 - Make the login form appear and disappear when adding an item', () => {
      // make sure the login form is not visible
      cy.get('#loginForm').should('not.be.visible');

      // click on the add button
      cy.get('#headerButtons').trigger('mouseover');
      cy.get('#addItemButton').click();

      // make sure login panel is open and cancel
      cy.get('#loginForm').should('be.visible');
      cy.get('#emailInput').should('have.focus');
      cy.get('#loginButton').should('be.disabled');
      cy.focused().type('admin@gmail.com');
      cy.get('#loginCancelButton').click();
      cy.get('#loginForm').should('not.be.visible');
    })

    it('2 - Make the login form appear when adding an item and enter an invalid password', () => {
      // make sure the login form is not visible
      cy.get('#loginForm').should('not.be.visible');

      // click on the add button
      cy.get('#headerButtons').trigger('mouseover');
      cy.get('#addItemButton').click();

      // make sure login panel is open
      cy.get('#loginForm').should('be.visible');
      cy.get('#loginHelper').should('not.contain', 'Invalid email or password...');
      cy.get('#emailInput').should('have.focus');

      // enter valid user name but invalid password
      cy.focused().type('admin@gmail.com').tab();
      cy.get('#passwordInput').should('have.focus');
      cy.focused().type('b');
      cy.get('#loginButton').should('not.be.disabled');
      cy.focused().type('adpw{enter}');

      // display invalid credential message and cancel
      cy.get('#loginHelper').should('contain', 'Invalid email or password...');
      cy.get('#loginCancelButton').click();
      cy.get('#loginForm').should('not.be.visible');
    })

    it('3 - Makes the login form appear when adding an item, enter a valid password and check the edited value', () => {
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
    })

})