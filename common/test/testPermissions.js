/* eslint-env mocha */
const {parse} = require('csv-parse/sync');
const chai = require("chai");
const path = require("path");
const fs = require("fs");

const Globals = require("../globals");
const ValidatePerm = require("../validatePerm");

const { expect } = chai;

const csvFilePath = path.resolve("./common/test/testPermissions.csv");
const csvdata = fs.readFileSync(csvFilePath);

const permissionTests = parse(csvdata, {
  columns: true,
  skip_empty_lines: true,
});

// for (let i = 15; i < 16; i += 1) {
for (let i = 0; i < 800; i += 1) {
  const csvtest = permissionTests[i];
  const csvtestshort = {
    iowner: csvtest.item_owner,
    l_rw: csvtest.list_rw_permission,
    li_rw: csvtest.list_item_rw_permission,
    i_rw: csvtest.item_rw_permission,
  };

  it(`${i}.1 - Test validateRPerm as ${csvtest.user} with (${JSON.stringify(
    csvtestshort
  )})`, (done) => {
    const test = {
      testnb: csvtest.testnb,
      user: csvtest.user,
      list: {
        [Globals.ownerFieldName]: "listowner",
        [Globals.readWritePermFieldName]: "admin", // so that validateRWPerm is always false
        [Globals.itemReadWritePermFieldName]: "admin", // so that validateRWPerm is always false
      },
      item: {
        [Globals.readWritePermFieldName]: "admin", // so that validateRWPerm is always false
      },
    };

    if (csvtest.list_rw_permission.substring(0, 5) !== "unset") {
      test.list[Globals.readPermFieldName] = csvtest.list_rw_permission;
    }

    if (csvtest.list_item_rw_permission.substring(0, 5) !== "unset") {
      test.list[Globals.itemReadPermFieldName] =
        csvtest.list_item_rw_permission;
    }

    if (csvtest.item_owner.substring(0, 5) !== "unset") {
      test.item[Globals.ownerFieldName] = csvtest.item_owner;
    }

    if (csvtest.item_rw_permission.substring(0, 5) !== "unset") {
      test.item[Globals.readPermFieldName] = csvtest.item_rw_permission;
    }
    const result = ValidatePerm.validateRPerm(test) ? "TRUE" : "FALSE";
    expect(result).to.equal(csvtest.result_r);

    done();
  });

  it(`${i}.2 - Test validateRWPerm as ${csvtest.user} with (${JSON.stringify(
    csvtestshort
  )})`, (done) => {
    const test = {
      testnb: csvtest.testnb,
      user: csvtest.user,
      list: {
        [Globals.ownerFieldName]: "listowner",
      },
      item: {},
    };

    if (csvtest.list_rw_permission.substring(0, 5) !== "unset") {
      test.list[Globals.readWritePermFieldName] = csvtest.list_rw_permission;
    }

    if (csvtest.list_item_rw_permission.substring(0, 5) !== "unset") {
      test.list[Globals.itemReadWritePermFieldName] =
        csvtest.list_item_rw_permission;
    }

    if (csvtest.item_owner.substring(0, 5) !== "unset") {
      test.item[Globals.ownerFieldName] = csvtest.item_owner;
    }

    if (csvtest.item_rw_permission.substring(0, 5) !== "unset") {
      test.item[Globals.readWritePermFieldName] = csvtest.item_rw_permission;
    }
    const result = ValidatePerm.validateRWPerm(test) ? "TRUE" : "FALSE";
    expect(result).to.equal(csvtest.result_rw);

    done();
  });

  it(`${i}.3 - Test validateDPerm as ${csvtest.user} with (${JSON.stringify(
    csvtestshort
  )})`, (done) => {
    const test = {
      testnb: csvtest.testnb,
      user: csvtest.user,
      list: {
        [Globals.ownerFieldName]: "listowner",
      },
      item: {},
    };

    if (csvtest.list_rw_permission.substring(0, 5) !== "unset") {
      test.list[Globals.readWritePermFieldName] = csvtest.list_rw_permission;
    }

    if (csvtest.list_item_rw_permission.substring(0, 5) !== "unset") {
      test.list[Globals.itemReadWritePermFieldName] =
        csvtest.list_item_rw_permission;
    }

    if (csvtest.item_owner.substring(0, 5) !== "unset") {
      test.item[Globals.ownerFieldName] = csvtest.item_owner;
    }

    if (csvtest.item_rw_permission.substring(0, 5) !== "unset") {
      test.item[Globals.readWritePermFieldName] = csvtest.item_rw_permission;
    }
    const result = ValidatePerm.validateDPerm(test) ? "TRUE" : "FALSE";
    expect(result).to.equal(csvtest.result_d);

    done();
  });

  it(`${i}.4 - Test validateCPerm as ${csvtest.user} with (${JSON.stringify(
    csvtestshort
  )})`, (done) => {
    const test = {
      testnb: csvtest.testnb,
      user: csvtest.user,
      list: {
        [Globals.ownerFieldName]: "listowner",
      },
      item: {},
    };

    if (csvtest.list_rw_permission.substring(0, 5) !== "unset") {
      test.list[Globals.readWritePermFieldName] = csvtest.list_rw_permission;
    }

    if (csvtest.list_item_rw_permission.substring(0, 5) !== "unset") {
      test.list[Globals.itemReadWritePermFieldName] =
        csvtest.list_item_rw_permission;
    }

    if (csvtest.item_owner.substring(0, 5) !== "unset") {
      test.item[Globals.ownerFieldName] = csvtest.item_owner;
    }

    if (csvtest.item_rw_permission.substring(0, 5) !== "unset") {
      test.item[Globals.readWritePermFieldName] = csvtest.item_rw_permission;
    }
    const result = ValidatePerm.validateCPerm(test) ? "TRUE" : "FALSE";
    expect(result).to.equal(csvtest.result_rw);

    done();
  });
}
