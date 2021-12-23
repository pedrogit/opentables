/// <reference types="cypress" />

describe('opentable basic tests', () => {
    beforeEach(() => {
      // Cypress starts out with a blank slate for each test
      // so we must tell it to visit our website with the `cy.visit()` command.
      // Since we want to visit the same URL at the start of all our tests,
      // we include it in our beforeEach function so that it runs before each test
      cy.visit('http://localhost:3000')
    })

    afterEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('http://localhost:3000')
    })
  
    it('makes the login form appear and disappear', () => {
        cy.get('#loginform').should('not.be.visible');
        cy.contains('First view').dblclick();
        cy.get('#loginform').should('be.visible');
        cy.get('#emailinput').should('have.focus');
        cy.get('#loginbutton').should('be.disabled');
        cy.focused().type('admin@gmail.com');
        cy.get('#logincancelbutton').click();
        cy.get('#loginform').should('not.be.visible');
    })

    it('makes the login form appear and enter an invalid password', () => {
        cy.contains('First view').dblclick();
        cy.get('#loginform').should('be.visible');
        cy.get('#loginhelper').should('not.contain', 'Invalid email or password...');
        cy.get('#emailinput').should('have.focus');
        cy.focused().type('admin@gmail.com').tab();
        cy.get('#passwordinput').should('have.focus');
        cy.focused().type('b');
        cy.get('#loginbutton').should('not.be.disabled');
        cy.focused().type('adpw{enter}');
        cy.get('#loginhelper').should('contain', 'Invalid email or password...');
        cy.get('#logincancelbutton').click();
        cy.get('#loginform').should('not.be.visible');
    })

    it('makes the login form appear, enter a valid password and check the edited value', () => {
        cy.contains('First view').dblclick();
        cy.get('#loginform').should('be.visible');
        cy.get('#loginhelper').should('not.contain', 'Invalid email or password...');
        cy.get('#emailinput').should('have.focus');
        cy.focused().type('admin@gmail.com').tab();
        cy.get('#passwordinput').should('have.focus');
        cy.focused().type('a');
        cy.get('#loginbutton').should('not.be.disabled');
        cy.focused().type('dmin{enter}');
        cy.get('#loginform').should('not.be.visible');
        cy.get('input').last().focus().type('{end}s{enter}');
        cy.contains('First view').should('contain', 'First views');

        // undo the edit
        cy.contains('First view').dblclick();
        cy.get('input').last().focus().type('{end}{backspace}{enter}');
        cy.contains('First view').should('contain', 'First view');
        cy.contains('First view').should('not.contain', 'First views');

        // logout
        cy.get('#loginlogoutbutton').should('contain', 'Logout admin@gmail.com');
        cy.get('#loginlogoutbutton').click();
        cy.get('#loginlogoutbutton').should('contain', 'Login');
    })

})