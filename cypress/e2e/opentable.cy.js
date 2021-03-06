/* global cy */
/* eslint-env mocha */
/// <reference types="cypress" />
const NodeUtil = require("util");

const Globals = require("../../common/globals");
const Errors = require("../../common/errors");

const adminPW = "admin";

const firstUserUsername = "First User";
const firstUserEmail = "firstuser@gmail.com";
const firstUserPassword = "1firstuser";

const secondUserUsername = "Second User";
const secondUserEmail = "seconduser@gmail.com";
const secondUserPassword = "1seconduser";

const runOnlyLastTest = false;
const reCreateDatabase = !runOnlyLastTest || false;
// eslint-disable-next-line no-unused-vars
const xrunOnlyLastTest = !runOnlyLastTest;
const testPermissions = true;

const reload = () => {
  cy.visit("/");
  cy.wait(2000);
};

/// //////////////////////////////////////
// available functions
//
// goHome();
// signUp();
// login();
// logout();
// fillRecaptcha();
// setProperty(property = 'prop1', value = 'prop1 edited', type = 'item');
// canDeleteItem();
// cantDeleteItem();
// canAddItem();
// cantAddItem();
// canSeeProperties(type = 'view');
// cantSeeItems(neitherView);
// canSeeViewPropertiesButNotListOnes();
// canSeeButNotSetProperty(type = 'item');
// deleteItem(text);

const goHome = () => {
  cy.get("#homeButton").click();
  cy.wait(2000);
};

const clicklOnListName = (name) => {
  cy.contains(name).click();
  cy.wait(1000);
};

const logout = () => {
  cy.get("#loginLogoutButton").then(($loginButton) => {
    if ($loginButton.text().includes("Logout")) {
      cy.get("#loginLogoutButton").click();
      cy.wait(1000);
    }
  });
  cy.get("#loginLogoutButton").should("contain", "Login");
};

const fillRecaptcha = () => {
  cy.wait(2000);
  cy.get("#g-recaptcha *> iframe").then(($iframe) => {
    const $body = $iframe.contents().find("body");
    cy.wrap($body)
      .find(".recaptcha-checkbox-border")
      .should("be.visible")
      .click();
  });
  cy.wait(2000);
};

const signUp = (
  { username, email, password } = {
    username: firstUserUsername,
    email: firstUserEmail,
    password: firstUserPassword,
  }
) => {
  logout();
  cy.get("#signUpButton").click();
  cy.get('input[name="username"]').focus().type(username).tab();
  cy.get('input[name="email"]').focus().type(email).tab();
  fillRecaptcha();
  cy.get('input[name="password"]').focus().type(password);
  cy.get("#addItemFormButton").click();
  cy.get("#loginLogoutButton").should("contain", "Logout");
  cy.wait(2000);
};

const login = (
  { email, password } = {
    email: firstUserEmail,
    password: firstUserPassword,
  }
) => {
  logout();
  cy.get("#loginLogoutButton").click();
  cy.focused().type(email).tab();
  cy.focused().type(`${password}{enter}`);
  cy.wait(2000);
  cy.get("#loginLogoutButton").should("contain", "Logout");
};

const setProperty = (
  property = "prop1",
  value = "prop1 edited",
  type = "item"
) => {
  // open the config panel and change the add item mode to form
  const id = `#${type}list`;
  if (type !== "item") {
    cy.get("#configPanelOpenButton").click();
    cy.get(`#${type}Properties`).click();
  }
  cy.get(id).then(($list) => {
    // if the property is not already set, add it from the Add Optional Property menu
    if (
      !$list
        .text()
        .includes(
          property.substring(0, 1).toUpperCase() + property.substring(1)
        )
    ) {
      cy.get(id).trigger("mouseover");
      cy.get("#moreOptionsButton").click();
      cy.contains(property).click();
    }
  });

  // escape the Add Unset Property menu if it is open
  cy.get("body").click();

  // make sure the property is present or was added
  cy.get(id).should(
    "contain",
    property.substring(0, 1).toUpperCase() + property.substring(1)
  );

  // edit it
  cy.get(`${id} #${property}`).dblclick();

  cy.get(`input[name="${property}"]`).then(($control) => {
    // cy.task('log', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    // cy.task('log', $control.parent().attr())
    // cy.task('log', Cypress.dom.isJquery($control));
    // cy.task('log', $control.prop('outerHTML'));
    // cy.task('log', 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBB');

    if ($control.prop("outerHTML").includes("Select")) {
      cy.get("ul").contains(value).first().click();
    } else {
      cy.get(`input[name="${property}"]`)
        .focus()
        .type(`{selectAll}{backspace}${value.replaceAll("{", "{{}")}{enter}`);
    }
  });
  cy.wait(2000);

  if (type !== "item") {
    cy.get("#closeConfigPanelButton").click();
  }
};

const canDeleteItem = () => {
  cy.get("#itemlist").trigger("mouseover");
  cy.get("#deleteItemButton").should("exist"); // check delete button is displayed
  cy.get("#deleteItemButton").should("be.enabled"); // check delete button is displayed
};

const cantDeleteItem = () => {
  cy.get("#itemlist").trigger("mouseover");
  cy.get("#deleteItemButton").should("exist"); // check delete button is displayed
  cy.get("#deleteItemButton").should("be.disabled"); // check delete button is displayed
};

const canAddItem = () => {
  cy.get("#addItemButton").should("exist"); // check add button is displayed
  cy.get("#addItemButton").should("be.enabled"); // check add button is enabled
};

const cantAddItem = () => {
  cy.get("#addItemButton").should("exist"); // check add button is displayed
  cy.get("#addItemButton").should("be.disabled"); // check add button is enabled
};

const canSeeProperties = (type = "view") => {
  // var id = '#' + type + 'list';
  cy.get("#configPanelOpenButton").click();
  cy.get(`#${type}Properties`).click();
  cy.get(`#${type}list`).should("contain", "Name");
  cy.get("#closeConfigPanelButton").click();
};

const cantSeeItems = (neitherView) => {
  cy.get("#uncontrolledErrorPanel").should("contain", "Warning");
  cy.get("#uncontrolledErrorPanel").should(
    "contain",
    neitherView ? Globals.noPermissionViewList : Globals.noPermissionViewItems
  );
};

const noItems = () => {
  cy.get("#uncontrolledErrorPanel").should("contain", "Warning");
  cy.get("#uncontrolledErrorPanel").should("contain", Globals.noItemsInList);
};

const canSeeViewPropertiesButNotListOnes = () => {
  // warning on items
  cantSeeItems(true);

  // can see view properties but not list properties
  canSeeProperties();
  cy.get("#configPanelOpenButton").click();
  cy.get("#listProperties").should(
    "contain",
    "List Properties (Permission denied)"
  );
  cy.get("#closeConfigPanelButton").click();

  cy.get("#addItemButton").should("exist"); // check add button is displayed
  cy.get("#addItemButton").should("be.disabled"); // check add button is enabled
  cy.get("#deleteItemButton").should("not.exist"); // check delete button is displayed
};

const canSeeButNotSetProperty = (type = "item") => {
  // open the config panel
  if (type !== "item") {
    cy.get("#configPanelOpenButton").click();
    cy.get(`#${type}Properties`).click();
  }
  if (type !== "item") {
    cy.get(`#${type}list #name`).dblclick();
  } else if (type === "item") {
    cy.get("#itemlist #prop1").dblclick();
  }
  cy.get("#errorPanel").should("contain", Globals.permissionDenied);

  // close the config panel
  if (type !== "item") {
    cy.get("#closeConfigPanelButton").click();
  }
};

const deleteItem = (text) => {
  cy.get("#itemlist").children().contains(text).trigger("mouseover");
  cy.get("#deleteItemButton").click();
  cy.wait(1000);
  cy.contains(text).should("not.exist");
};

if (reCreateDatabase) {
  describe("0 - Initial setup", () => {
    it("0.1 - Clean the database", () => {
      cy.request({
        method: "DELETE",
        url: "/api/opentables",
        auth: {
          username: "admin@gmail.com",
          password: adminPW,
        },
      });
    });
  });

  if (runOnlyLastTest) {
    describe("Recreate a usable database", () => {
      it("0.1 - Create the first user", () => {
        reload();
        signUp();
        logout();
      });

      it("0.2 - Create the second user", () => {
        reload();
        signUp({
          username: secondUserUsername,
          email: secondUserEmail,
          password: secondUserPassword,
        });
        logout();
      });
    });
  }
}

describe("1 - Basic tests", () => {
  beforeEach(() => {
    reload();
  });

  afterEach(() => {});

  if (!runOnlyLastTest) {
    it("1.1 - Make sure the list of view is displayed by default", () => {
      cy.contains("Views").should("be.visible");
      cy.contains("Lists").should("be.visible");
    });
  }

  if (!runOnlyLastTest) {
    it("1.2 - Test the reload button", () => {
      cy.get("#reloadListButton");
      cy.wait(2000);
      cy.contains("Views").should("be.visible");
      cy.contains("Lists").should("be.visible");
    });
  }

  if (!runOnlyLastTest) {
    it("1.3 - Test Sign Up", () => {
      // make sure the login form is not visible
      cy.get("#loginForm").should("not.be.visible");

      // click on the SignUp button
      cy.get("#signUpButton").click();

      // make sure the Register button is disabled when nothing is entered yet
      cy.get("#addItemFormButton").should("be.disabled");

      // test submitting just after the register button is activated
      cy.get('input[name="username"]').focus().type("F");
      cy.get("#addItemFormButton").should("not.be.disabled");
      cy.get("#addItemFormButton").click();
      cy.get("#errorPanel").should("contain", Errors.ErrMsg.Recaptcha_Failed);

      // now after the recaptcha is filled
      fillRecaptcha();
      cy.get("#addItemFormButton").click();
      cy.get("#errorPanel").should(
        "contain",
        NodeUtil.format(Errors.ErrMsg.SchemaValidator_MissingProp, "email")
      );

      // fill in more username info and email and click
      cy.get('input[name="username"]').focus().type("irst");
      cy.get('input[name="email"]').focus().type(firstUserEmail);
      cy.get("#addItemFormButton").click();
      cy.get("#errorPanel").should(
        "contain",
        NodeUtil.format(Errors.ErrMsg.SchemaValidator_MissingProp, "password")
      );

      // fill in the password
      cy.get('input[name="password"]').focus().type("1first");
      cy.get("#addItemFormButton").click();
      cy.get("#errorPanel").should(
        "contain",
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_MinLength,
          "username",
          Globals.usernameMinLength
        )
      );

      // fill in remaining username info
      cy.get('input[name="username"]').focus().type(" User");
      cy.get("#addItemFormButton").click();
      cy.get("#errorPanel").should(
        "contain",
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_MinLength,
          "password",
          Globals.passwordMinLength
        )
      );

      // success!
      cy.get('input[name="password"]').focus().type("user");
      cy.get("#addItemFormButton").click();
      cy.get("#errorPanel").should("contain", "Congratulation First User");
      cy.wait(1000);

      // logout
      logout();

      // try inserting a new user with the same username
      // click on the SignUp button
      cy.get("#signUpButton").click();
      cy.get('input[name="username"]').focus().type("First User");
      cy.get('input[name="email"]').focus().type(`x${firstUserEmail}`);
      cy.get('input[name="password"]').focus().type("xxxxxxxx");
      fillRecaptcha();
      cy.get("#addItemFormButton").click();
      cy.get("#errorPanel").should(
        "contain",
        NodeUtil.format(
          Errors.ErrMsg.SchemaValidator_NotUnique,
          "username",
          "First User"
        )
      );

      // cancel to return to the main view
      cy.get("#addCancelItemFormButton").click();
      cy.get("#headerViewName").should("contain", "Views");

      // sign up another user for further tests
      signUp({
        username: secondUserUsername,
        email: secondUserEmail,
        password: secondUserPassword,
      });
    });
  }

  if (!runOnlyLastTest) {
    it("1.4 - Test the login form", () => {
      // make sure the login form is not visible
      cy.get("#loginForm").should("not.be.visible");

      // login
      cy.get("#loginLogoutButton").click();
      cy.get("#loginForm").should("be.visible");
      cy.get("#emailInput").should("have.focus");
      cy.get("#loginButton").should("be.disabled");
      cy.get("#loginHelper").should(
        "not.contain",
        Errors.ErrMsg.InvalidEmailPassword
      );
      cy.focused().type(firstUserEmail);
      cy.get("#loginButton").should("be.disabled");

      // cancel
      cy.get("#loginCancelButton").click();
      cy.get("#loginForm").should("not.be.visible");

      // start again with bad email
      cy.get("#loginLogoutButton").click();
      cy.focused().type(`x${firstUserEmail}`).tab();
      cy.focused().type(firstUserPassword);
      cy.get("#loginButton").should("not.be.disabled");
      cy.focused().type("{enter}");
      cy.get("#loginHelper").should(
        "contain",
        Errors.ErrMsg.InvalidEmailPassword
      );

      // make sure the helper text disappear when entering new text
      cy.focused().type("x");
      cy.get("#loginHelper").should(
        "not.contain",
        Errors.ErrMsg.InvalidEmailPassword
      );
      cy.get("#loginCancelButton").click();

      // start again with good email but bad password
      cy.get("#loginForm").should("not.be.visible");
      cy.get("#loginLogoutButton").click();
      cy.get("#loginHelper").should(
        "not.contain",
        Errors.ErrMsg.InvalidEmailPassword
      );
      cy.focused().type(firstUserEmail).tab();
      cy.focused().type(`x${firstUserPassword}{enter}`);
      cy.get("#loginHelper").should(
        "contain",
        Errors.ErrMsg.InvalidEmailPassword
      );
      cy.get("#loginCancelButton").click();

      // start again with everything good and logout
      cy.get("#loginForm").should("not.be.visible");
      login();
      logout();
    });
  }

  if (!runOnlyLastTest || reCreateDatabase) {
    it("1.5 - Test creating a new list and edit it", () => {
      login();
      cy.get("#addItemButton").click();
      cy.wait(1000);
      cy.get("#itemlist").should("contain", "View Name");
      cy.contains("View Name").should("be.visible");

      // edit new view name
      cy.contains("View Name").click();
      setProperty("name", "First User View 1", "view");

      // add an optional property to the schema
      setProperty(
        "schema",
        "prop1: {type: string, required}, prop2: string",
        "list"
      );

      // make sure the view name was changed
      cy.get("#headerPanel").should("contain", "First User View 1");

      // add a new item and edit it
      cy.get("#addItemButton").click();
      cy.wait(1000);
      setProperty("prop1", "prop1 edited");
      cy.get("#itemlist").should("contain", "prop1 edited");

      // add the second property
      setProperty("prop2", "prop2 edited");

      cy.get("#itemlist").should("contain", "prop2");

      // unfill prop2 to make it disappear
      setProperty("prop2", "");
      cy.get("#prop2").should("not.exist");

      // unfill prop1 to reset it to its default
      setProperty("prop1", "");
      cy.get("#itemlist").should("contain", "prop1");

      // delete it
      deleteItem("prop1");
    });
  }

  if (!runOnlyLastTest) {
    it("1.6 - Test the different add item modes", () => {
      const addAndDeleteItemWithForm = (reset, type) => {
        if (type === Globals.addItemModeAsForm) {
          // add a new item in form mode
          cy.get("#addItemButton").click();
        } else {
          cy.get("#addItemButton").should("not.exist");
        }
        cy.get('input[name="prop1"]').should("be.visible");

        cy.get("#addCancelItemFormButton").should("be.visible");
        cy.get("#addItemFormButton").should("be.visible");
        cy.get("#addItemFormButton").should("be.disabled");
        if (reset) {
          cy.get('input[name="prop1"]').should("have.value", "prop1");
          cy.get('input[name="prop1"]').focus().type(" more text");
          cy.get("#addCancelItemFormButton").click();
          cy.get('input[name="prop1"]').should("not.contain", "more text");
          cy.get('input[name="prop2"]').should("not.exist");
        }
        cy.get('input[name="prop1"]').focus().type(" ");
        cy.get("#addItemFormButton").should("be.enabled");
        cy.focused().type("edited 2");

        // add and fill the second property
        cy.get("#itemlist").trigger("mouseover");
        cy.get("#moreOptionsButton").click();
        cy.get("li").contains("prop2").click();
        cy.get("body").click();

        // make sure it was added
        cy.get('input[name="prop2"]').should("be.visible");

        // save the new item
        cy.get("#addItemFormButton").click();
        cy.wait(1500);

        // check for the presence of the new item only when it is still visible (not in persistent form no item mode)
        cy.get("#headerViewName").then(($headerName) => {
          if ($headerName.text().includes("First User View 1")) {
            // make sure it was added
            cy.contains("prop1 edited 2").should("be.visible");

            // delete it
            deleteItem("prop1 edited 2");
          }
        });
      };

      login();

      // set the view
      clicklOnListName("First User View 1");

      // change to form mode
      setProperty("add_item_mode", Globals.addItemModeAsForm, "view");

      // add and cancel
      cy.get("#addItemButton").click();
      cy.get('input[name="prop1"]').focus().type(" edited");

      cy.get("#addCancelItemFormButton").click();
      cy.get('input[name="prop1"]').should("not.exist");

      // make sure the editing field was reset
      cy.get("#addItemButton").click();
      cy.get('input[name="prop1"]').should("have.value", "prop1");

      addAndDeleteItemWithForm(false, Globals.addItemModeAsForm);
      // form should not be visible anymore
      cy.get('input[name="prop1"]').should("not.exist");

      // change to persistant form mode
      setProperty(
        "add_item_mode",
        Globals.addWithPersistentFormAndItems,
        "view"
      );

      addAndDeleteItemWithForm(true, Globals.addWithPersistentFormAndItems);
      // persistent form should still exists
      cy.get('input[name="prop1"]').should("exist");

      // change to persistant form mode without items
      setProperty(
        "add_item_mode",
        Globals.addWithPersistentFormNoItems,
        "view"
      );

      // item list should have only one children
      cy.get("#itemlist").children().should("have.length", 1);
      addAndDeleteItemWithForm(false, Globals.addWithPersistentFormNoItems);

      // delete it
      cy.get("#headerViewName").should("contain", "Views");
      clicklOnListName("First User View 1");
      setProperty(
        "add_item_mode",
        Globals.addWithPersistentFormAndItems,
        "view"
      );

      // make sure it was added
      cy.contains("prop1 edited 2").should("be.visible");

      // now delete it
      deleteItem("prop1 edited 2");

      // reset the add item mode to default
      setProperty("add_item_mode", Globals.addItemModeDefault, "view");
    });
  } // runOnlyLastTest
}); // describe('1 - Basic tests'

if (testPermissions) {
  describe("2 - UI permission behavior tests", () => {
    beforeEach(() => {
      reload();
    });

    afterEach(() => {});

    if (!runOnlyLastTest || testPermissions) {
      it("2.1 - Test UI behavior when unauthorized (@all) with different add item modes", () => {
        // Test with default permissions

        // set the view
        clicklOnListName("First User View 1");

        /// //////////////////////////////////////////////////
        // login and change the add item mode to persistent_form_no_items
        login();
        setProperty(
          "add_item_mode",
          Globals.addWithPersistentFormNoItems,
          "view"
        );

        cy.get('input[name="prop1"]').should("exist"); // check form is displayed
        cy.get("#addItemButton").should("not.exist"); // check add button is not displayed

        // add an item for future tests
        cy.get('input[name="prop1"]').focus().type(" {enter}");
        cy.wait(2000);

        // we were redirected to the home list, return to the editing list
        clicklOnListName("First User View 1");

        logout();
        // since we are not logged in and the list is in persistent_form_no_items
        // mode, it should display the login form
        cy.get("#loginForm").should("contain", Globals.permissionDenied);
        cy.get("#addItemButton").should("not.exist");
        cy.get("#loginCancelButton").click(); // cancel

        /// //////////////////////////////////////////////////
        // login and change the add item mode to persistent_form
        login();
        setProperty(
          "add_item_mode",
          Globals.addWithPersistentFormAndItems,
          "view"
        );

        cy.get('input[name="prop1"]').should("exist"); // check form is displayed
        cy.get("#addItemButton").should("not.exist"); // check add button is not displayed
        cy.get("#itemlist").children().contains("prop1").trigger("mouseover");
        cy.get("#deleteItemButton").should("exist"); // check delete button is displayed
        cy.get("#deleteItemButton").should("be.enabled"); // check delete button is enabled
        cy.get("#moreOptionsButton").should("exist"); // check moreOption button is displayed
        cy.get("#moreOptionsButton").click();
        cy.get("li").contains(Globals.addOptionalPropertyMenu).should("exist"); // check Add optional property exists
        cy.get("li").contains(Globals.permissionDenied).should("not.exist"); // and is enabled
        cy.get("body").click();

        // test as @all
        logout();
        cy.get('input[name="prop1"]').should("not.exist");
        cy.get("#addItemButton").should("not.exist"); // check add button is not displayed
        cy.get("#itemlist").children().contains("prop1").trigger("mouseover");
        cy.get("#deleteItemButton").should("exist"); // check delete button is displayed
        cy.get("#deleteItemButton").should("not.be.enabled"); // check delete button is not enabled
        cy.get("#moreOptionsButton").should("exist"); // check moreOption button is displayed
        cy.get("#moreOptionsButton").click();
        cy.get("li").contains(Globals.addOptionalPropertyMenu).should("exist"); // check Add optional property exists
        cy.get("li").contains(Globals.permissionDenied).should("exist"); // and is not enabled
        cy.get("body").click();

        /// //////////////////////////////////////////////////
        // login and change the add item mode to form
        login();
        setProperty("add_item_mode", Globals.addItemModeAsForm, "view");

        cy.get('input[name="prop1"]').should("not.exist");
        cy.get("#addItemButton").should("exist");
        cy.get("#addItemButton").should("be.enabled");

        // test as @all
        logout();
        cy.get('input[name="prop1"]').should("not.exist");
        cy.get("#addItemButton").should("exist");
        cy.get("#addItemButton").should("not.be.enabled");
        cy.get("#itemlist").children().contains("prop1").trigger("mouseover");
        cy.get("#deleteItemButton").should("exist"); // check delete button is displayed
        cy.get("#deleteItemButton").should("not.be.enabled"); // check delete button is not enabled
        cy.get("#moreOptionsButton").should("exist"); // check moreOption button is displayed
        cy.get("#moreOptionsButton").click();
        cy.get("li").contains(Globals.addOptionalPropertyMenu).should("exist"); // check Add optional property exists
        cy.get("li").contains(Globals.permissionDenied).should("exist"); // and is not enabled
        cy.get("body").click();

        /// //////////////////////////////////////////////////
        // login and change the add item mode to default_value
        login();
        setProperty("add_item_mode", Globals.addItemModeDefault, "view");

        cy.get('input[name="prop1"]').should("not.exist");
        cy.get("#addItemButton").should("exist");
        cy.get("#addItemButton").should("be.enabled");

        // test as unauthenticated users
        logout();
        cy.get('input[name="prop1"]').should("not.exist");
        cy.get("#addItemButton").should("exist");
        cy.get("#addItemButton").should("not.be.enabled");
        cy.get("#itemlist").children().contains("prop1").trigger("mouseover");
        cy.get("#deleteItemButton").should("exist"); // check delete button is displayed
        cy.get("#deleteItemButton").should("not.be.enabled"); // check delete button is not enabled
        cy.get("#moreOptionsButton").should("exist"); // check moreOption button is displayed
        cy.get("#moreOptionsButton").click();
        cy.get("li").contains(Globals.addOptionalPropertyMenu).should("exist"); // check Add optional property exists
        cy.get("li").contains(Globals.permissionDenied).should("exist"); // and is not enabled
        cy.get("body").click();
      });
    } // runOnlyLastTest\

    if (!runOnlyLastTest) {
      it("2.2.1 - Test UI behavior with default permissions on view", () => {
        // view R perm = @all
        // view RW perm = @owner

        /// //////////////////////////////////////
        // second user should be able to see view properties but not to set them
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        clicklOnListName("First User View 1");
        cy.get("#headerViewName").should("contain", "First User View 1");

        // but not to edit its view properties
        canSeeButNotSetProperty("view");

        /// //////////////////////////////////////
        // same for unauthenticated users
        logout();
        clicklOnListName("First User View 1");
        cy.get("#headerViewName").should("contain", "First User View 1");

        // but not to edit its view properties
        canSeeButNotSetProperty("view");
      });

      it("2.2.2 - Test UI behavior when @all have RW permission on view", () => {
        // view R perm = @all
        // view RW perm = @all
        login();
        clicklOnListName("First User View 1");
        setProperty("rw_permissions", "@all", "view");

        /// //////////////////////////////////////
        // second user should be able to add and edit view unset properties
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        setProperty("add_item_mode", "unset", "view");
        setProperty("add_item_mode", Globals.addItemModeDefault, "view");

        /// //////////////////////////////////////
        // unauthenticated users should be able to see view properties but not to set them
        logout();
        canSeeButNotSetProperty("view");
      });

      it("2.2.3 - Test UI behavior when @owner have R permission and @all have RW permission on view", () => {
        // view R perm = @owner
        // view RW perm = @all
        login();
        clicklOnListName("First User View 1");
        setProperty("r_permissions", "@owner", "view");

        /// //////////////////////////////////////
        // second user gets rw permission on view and should be able to set view properties
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        setProperty("add_item_mode", "unset", "view");
        setProperty("add_item_mode", Globals.addItemModeDefault, "view");

        /// //////////////////////////////////////
        // unauthenticated users should not be able to view the list and be presented with a login form
        logout();
        cy.get("#loginForm").should("contain", Globals.permissionDenied);
        // neither from the list of views
        goHome();
        cy.contains("First User View 1").should("not.exist");
      });

      it("2.2.4 - Test UI behavior when only @owner have R permission on view", () => {
        // view R perm = @owner
        // view RW perm = @owner
        login();
        clicklOnListName("First User View 1");
        setProperty("rw_permissions", "", "view");

        /// //////////////////////////////////////
        // second user should NOT be able to view the list at all
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cy.get("#loginForm").should("contain", Globals.permissionDenied);
        goHome();
        cy.contains("First User View 1").should("not.exist");

        /// //////////////////////////////////////
        // unauthenticated users should NOT be able to view the list at all
        logout();
        cy.get("#loginForm").should("contain", Globals.permissionDenied);
        // neither from the list of views
        goHome();
        cy.contains("First User View 1").should("not.exist");

        /// //////////////////////////////////////
        // reset the r_permission to its default value
        login();
        clicklOnListName("First User View 1");
        setProperty("r_permissions", "", "view");
        logout();
      });
    } // runOnlyLastTest\

    if (!runOnlyLastTest) {
      it("2.3.1 - Test UI behavior with default permissions on list", () => {
        // list R perm = @all
        // list RW perm = @owner

        /// //////////////////////////////////////
        // second user should be able to view list properties
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        clicklOnListName("First User View 1");
        cy.get("#headerViewName").should("contain", "First User View 1");

        // but not to edit them
        canSeeButNotSetProperty("list");

        // neither its items
        cantAddItem();
        canSeeButNotSetProperty("item");
        cantDeleteItem();

        /// //////////////////////////////////////
        // unauthenticated users should be able to view the list
        goHome();
        logout();
        clicklOnListName("First User View 1");
        cy.get("#headerViewName").should("contain", "First User View 1");

        // but not to edit its list properties
        canSeeButNotSetProperty("list");

        // neither its items
        cantAddItem();
        canSeeButNotSetProperty("item");
        cantDeleteItem();
      });

      it("2.3.2 - Test UI behavior when @all have RW permission on list", () => {
        // list R perm = @all
        // list RW perm = @all
        login();
        clicklOnListName("First User View 1");
        setProperty("rw_permissions", "@all", "list");

        /// //////////////////////////////////////
        // second user should be able to view list properties
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        clicklOnListName("First User View 1");
        cy.get("#headerViewName").should("contain", "First User View 1");

        // edit them
        setProperty("rw_permissions", "@all", "list");

        // and add and edit item properties as well
        canAddItem();
        setProperty("prop1");

        // but not delete them since he is not owner
        cantDeleteItem();

        /// //////////////////////////////////////
        // unauthenticated users should be able to see view properties
        goHome();
        logout();
        clicklOnListName("First User View 1");
        cy.get("#headerViewName").should("contain", "First User View 1");

        // but not to edit list ones
        canSeeButNotSetProperty("list");

        // neither items
        cantAddItem();
        canSeeButNotSetProperty("item");
        cantDeleteItem();
      });

      it("2.3.3 - Test UI behavior when @owner have R permission and @all have RW permission on list", () => {
        // list R perm = @owner
        // list RW perm = @all
        login();
        clicklOnListName("First User View 1");
        setProperty("r_permissions", "@owner", "list");

        /// //////////////////////////////////////
        // second user should be able to view list properties
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        // edit them
        setProperty("r_permissions", "@owner", "list");

        // and edit item properties as well
        canAddItem();
        setProperty("prop1");

        // but not delete them since he is not owner
        cantDeleteItem();

        /// //////////////////////////////////////
        // unauthenticated users should be able to see view properties but not list ones, neither items
        goHome();
        logout();
        clicklOnListName("First User View 1");
        cy.get("#headerViewName").should("contain", "First User View 1");

        cantAddItem();
        canSeeViewPropertiesButNotListOnes();
      });

      it("2.3.4 - Test UI behavior when only @owner have R permission on list", () => {
        // list R perm = @owner
        // list RW perm = @owner
        login();
        clicklOnListName("First User View 1");
        setProperty("rw_permissions", "@owner", "list");

        /// //////////////////////////////////////
        // second user should be able to view list properties but not list ones
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });

        cantAddItem();
        canSeeViewPropertiesButNotListOnes();

        /// //////////////////////////////////////
        // same for unauthenticated users
        logout();

        cantAddItem();
        canSeeViewPropertiesButNotListOnes();

        // reset permissions to their default
        login();
        clicklOnListName("First User View 1");
        setProperty("r_permissions", "", "list");
        setProperty("rw_permissions", "", "list");
        logout();
      });
    } // runOnlyLastTest\

    if (!runOnlyLastTest) {
      it("2.4.1 - Test UI behavior with default permissions on list items", () => {
        // list_item R perm = @all
        // list_item RW perm = @owner

        clicklOnListName("First User View 1");
        cy.get("#headerViewName").should("contain", "First User View 1");

        /// //////////////////////////////////////
        // second user should be able to view item properties but not to edit them
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        canSeeButNotSetProperty("item");

        /// //////////////////////////////////////
        // same for unauthenticated users
        logout();
        canSeeButNotSetProperty("item");
      });

      it("2.4.2 - Test UI behavior when @all have RW permission on list items", () => {
        // list_item R perm = @all
        // list_item RW perm = @all

        login();
        clicklOnListName("First User View 1");
        setProperty("item_rw_permissions", "@all", "list");

        /// //////////////////////////////////////
        // second user should be able to set item properties
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        setProperty();

        /// //////////////////////////////////////
        // but not unauthenticated users
        logout();
        canSeeButNotSetProperty("item");
      });

      it("2.4.3 - Test UI behavior when @owner have R permission and @all have RW permission on list items", () => {
        // list_item R perm = @owner
        // list_item RW perm = @all
        login();
        clicklOnListName("First User View 1");
        setProperty("item_r_permissions", "@owner", "list");

        /// //////////////////////////////////////
        // second user should be able to set item properties
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        setProperty();

        /// //////////////////////////////////////
        // unauthenticated users should not be able to see them
        logout();
        canSeeProperties("view");
        canSeeProperties("list");
        cantSeeItems();
      });

      it("2.4.4 - Test UI behavior when only @owner have R permission on list items", () => {
        // list_item R perm = @owner
        // list_item RW perm = @owner
        login();
        clicklOnListName("First User View 1");
        setProperty("item_rw_permissions", "@owner", "list");

        /// //////////////////////////////////////
        // second user should be able to set item properties
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        canSeeProperties("view");
        canSeeProperties("list");
        cantSeeItems();

        /// //////////////////////////////////////
        // same for unauthenticated users
        logout();
        canSeeProperties("view");
        canSeeProperties("list");
        cantSeeItems();

        // reset the permission to its default value
        login();
        setProperty("item_r_permissions", "", "list");
        setProperty("item_rw_permissions", "", "list");
        logout();
      });
    } // runOnlyLastTest\

    if (!runOnlyLastTest) {
      it("2.5.0 - Test UI behavior with default permissions on items (implicitly set)", () => {
        // item R perm = @all
        // item RW perm = @owner

        login();
        clicklOnListName("First User View 1");
        // change schema so it is possible to set item R and RW properties
        setProperty(
          Globals.listSchemaFieldName,
          `prop1: {type: string, required}, prop2: string, ${Globals.readPermFieldName}: {type: user_list, default: ${Globals.allUserName}}, ${Globals.readWritePermFieldName}: {type: user_list, default: ${Globals.ownerUserName}}`,
          "list"
        );

        // set permission on the item to their defaults
        setProperty(Globals.readPermFieldName, "", "item");
        setProperty(Globals.readWritePermFieldName, "", "item");

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only owner can
        canSeeButNotSetProperty(); // @all and hence "second user" can read but not edit
        cantDeleteItem(); // only owner can

        /// //////////////////////////////////////
        // unauthenticated users
        logout();
        cantAddItem(); // only list owner can
        canSeeButNotSetProperty(); // @all and hence unauthenticated users can read but not edit
        cantDeleteItem(); // only owner can
      });

      it("2.5.1 - Test UI behavior with default permissions on items (explicly set)", () => {
        // item R perm = @all
        // item RW perm = @owner

        login();
        clicklOnListName("First User View 1");

        // set permission on the item to their defaults
        setProperty(Globals.readPermFieldName, Globals.allUserName, "item");
        setProperty(
          Globals.readWritePermFieldName,
          Globals.ownerUserName,
          "item"
        );

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only list owner can
        canSeeButNotSetProperty(); // @all can read but not edit
        cantDeleteItem(); // only list owner can

        /// //////////////////////////////////////
        // unauthenticated users
        logout();
        cantAddItem(); // only list owner can
        canSeeButNotSetProperty(); // @all and hence unauthenticated users can read but not edit
        cantDeleteItem(); // only list owner can
      });

      it("2.5.2 - Test UI behavior when @all have RW permission on one item", () => {
        // item R perm = @all
        // item RW perm = @all

        login();
        clicklOnListName("First User View 1");

        // set RW permission to @all
        setProperty(
          Globals.readWritePermFieldName,
          Globals.allUserName,
          "item"
        );

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only list owner can
        setProperty("prop2", "", "item"); // @all and hence "Second User" can read and edit
        canDeleteItem(); // @all and hence "Second User" can delete the item since it has no owner

        /// //////////////////////////////////////
        // unauthenticated users
        logout();
        cantAddItem(); // only list owner can
        canSeeButNotSetProperty(); // @all and hence unauthenticated users can read but not edit
        cantDeleteItem(); // only owner and second user can
      });

      it("2.5.3 - Test UI behavior when @owner have R permission and @all have RW permission on one item", () => {
        // item R perm = @owner
        // item RW perm = @all

        login();
        clicklOnListName("First User View 1");

        // set R permission to @owner
        setProperty(Globals.readPermFieldName, Globals.ownerUserName, "item");

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only list owner can
        setProperty("prop2", "", "item"); // @all and hence "second user" can read and edit
        canDeleteItem(); // @all and hence "second user" can delete the item since it has no owner

        /// //////////////////////////////////////
        // unauthenticated users
        logout();
        cantAddItem(); // only list owner can
        noItems(); // @all RW permissions does not grant unauthenticated users permissions
      });

      it("2.5.4 - Test UI behavior when only @owner have R permission on one item", () => {
        // item R perm = @owner
        // item RW perm = @owner

        login();
        clicklOnListName("First User View 1");

        // set RW permission to @owner
        setProperty(
          Globals.readWritePermFieldName,
          Globals.ownerUserName,
          "item"
        );

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only list owner can
        noItems(); // only owner have read permission

        /// //////////////////////////////////////
        // unauthenticated users
        logout();
        cantAddItem(); // only list owner can
        noItems(); // only owner have read permission

        // reset permissions on the item to their defaults
        login();
        setProperty(Globals.readPermFieldName, "", "item");
        setProperty(Globals.readWritePermFieldName, "", "item");
        logout();
      });
    } // runOnlyLastTest\

    if (!runOnlyLastTest) {
      it('2.6.1 - Test UI behavior with R permissions on items set to "Second User"', () => {
        // item R perm = "Second User"
        // item RW perm = @owner

        login();
        clicklOnListName("First User View 1");

        // set permission on the item
        setProperty(Globals.readPermFieldName, secondUserUsername, "item");
        setProperty(
          Globals.readWritePermFieldName,
          Globals.ownerUserName,
          "item"
        );

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only list owner can
        canSeeButNotSetProperty(); // "Second User" can read but not edit
        cantDeleteItem(); // only list owner can

        /// //////////////////////////////////////
        // unauthenticated users should not be able to set them
        logout();
        cantAddItem(); // only list owner can
        noItems(); // only "Second User" can read
      });

      it('2.6.2 - Test UI behavior when "Second User" have RW permission on one item', () => {
        // item R perm = "Second User"
        // item RW perm = "Second User"

        login();
        clicklOnListName("First User View 1");

        // set RW permission to "Second User"
        setProperty(Globals.readWritePermFieldName, secondUserUsername, "item");

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only list owner can
        setProperty("prop2", "", "item"); // "second user" can read and edit
        canDeleteItem(); // "Second User" can delete the item since it has no owner

        /// //////////////////////////////////////
        // unauthenticated users
        logout();
        cantAddItem(); // only list owner can
        noItems(); // only owner and "Second User" have read permission
      });

      it('2.6.3 - Test UI behavior when @owner have R permission and "Second User" have RW permission on one item', () => {
        // item R perm = @owner
        // item RW perm = "Second User"

        login();
        clicklOnListName("First User View 1");

        // set R permission to @owner
        setProperty(Globals.readPermFieldName, Globals.ownerUserName, "item");

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only list owner can
        setProperty("prop2", "", "item"); // "second user" can read and edit
        canDeleteItem(); // "second user" can delete the item since it has no owner

        /// //////////////////////////////////////
        // unauthenticated users
        logout();
        cantAddItem(); // only list owner can
        noItems(); // only owner and "Second User" have read permission
      });

      it("2.6.4 - Test UI behavior when only @owner have R permission on one item", () => {
        // item R perm = @owner
        // item RW perm = @owner

        login();
        clicklOnListName("First User View 1");

        // set RW permission to @owner
        setProperty(
          Globals.readWritePermFieldName,
          Globals.ownerUserName,
          "item"
        );

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only list owner can
        noItems(); // only owner have read permission

        /// //////////////////////////////////////
        // unauthenticated users
        logout();
        cantAddItem(); // only list owner can
        noItems(); // only owner have read permission

        // reset permissions on the item to their defaults
        login();
        setProperty(Globals.readPermFieldName, "", "item");
        setProperty(Globals.readWritePermFieldName, "", "item");
        logout();
      });
    } // runOnlyLastTest\

    if (!runOnlyLastTest) {
      it('2.7.1 - Test UI behavior when "Second User" have RW permission on one item having an owner', () => {
        // item R perm = "Second User"
        // item RW perm = "Second User"

        login();
        clicklOnListName("First User View 1");

        // change schema so it is possible to set item R and RW properties
        setProperty(
          Globals.listSchemaFieldName,
          `prop1: {type: string, required}, prop2: string, ${Globals.ownerFieldName}:  {type: user, required}, ${Globals.readPermFieldName}: {type: user_list, default: ${Globals.allUserName}}, ${Globals.readWritePermFieldName}: {type: user_list, default: ${Globals.ownerUserName}}`,
          "list"
        );

        // set RW permission to "Second User"
        setProperty(Globals.readPermFieldName, secondUserUsername, "item");
        setProperty(Globals.readWritePermFieldName, secondUserUsername, "item");
        setProperty(Globals.ownerFieldName, firstUserUsername, "item");

        /// //////////////////////////////////////
        // "Second User"
        login({
          email: secondUserEmail,
          password: secondUserPassword,
        });
        cantAddItem(); // only list owner can
        setProperty("prop2", "", "item"); // "second user" can read and edit
        cantDeleteItem(); // "Second User" can not delete the item since it has a owner

        /// //////////////////////////////////////
        // unauthenticated users
        logout();
        cantAddItem(); // only list owner can
        noItems(); // only owner and "Second User" have read permission

        /// //////////////////////////////////////
        // reset the schema
        login();
        setProperty(
          "schema",
          "prop1: {type: string, required}, prop2: string",
          "list"
        );
      });
    } // runOnlyLastTest\
  }); // describe('2 - UI permission behavior tests'
}
