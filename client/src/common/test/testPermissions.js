const csv = require('csv-parse/sync') 
const chai = require("chai");
const path = require("path");
var fs = require('fs');

const Globals = require("../globals");
const Utils = require("../utils");

var expect = chai.expect;

var csvFilePath = path.resolve("./client/src/common/test/testPermissions.csv");
var csvdata = fs.readFileSync(csvFilePath);

const permissionTests = csv.parse(csvdata, {
  columns: true,
  skip_empty_lines: true
});

//for (let i = 185; i < 186; i++) {
for (let i = 0; i < 511; i++) {
  let csvtest = permissionTests[i];
  let csvtestshort = {
    iowner: csvtest.item_owner,
    l_rw: csvtest.list_rw_permission,
    li_rw: csvtest.list_item_rw_permission,
    i_rw: csvtest.item_rw_permission
  }
  it(i + '.1 - Test validateRWPerm as ' + csvtest.user + " with (" + JSON.stringify(csvtestshort) + ")", (done) => {
    let test = {
      testnb: csvtest.testnb,
      user: csvtest.user,
      list: {
        [Globals.ownerFieldName]: 'listowner',
      },
      item: {
      },
      throwError: false
    }

    if (csvtest.list_rw_permission.substring(0, 5) !== 'unset') {
      test.list[Globals.readWritePermFieldName] = csvtest.list_rw_permission;
    }

    if (csvtest.list_item_rw_permission.substring(0, 5) !== 'unset') {
      test.list[Globals.itemReadWritePermFieldName] = csvtest.list_item_rw_permission;
    }

    if (csvtest.item_owner.substring(0, 5) !== 'unset') {
      test.item[Globals.ownerFieldName] = csvtest.item_owner;
    }
    
    if (csvtest.item_rw_permission.substring(0, 5) !== 'unset') {
      test.item[Globals.readWritePermFieldName] = csvtest.item_rw_permission;
    }
    var result = Utils.validateRWPerm(test) ? 'TRUE': 'FALSE';
    expect(result).to.equal(csvtest.result_rw);

    done();
  });

  it(i + '.2 - Test validateRPerm as ' + csvtest.user + " with (" + JSON.stringify(csvtestshort) + ")", (done) => {
    let test = {
      testnb: csvtest.testnb,
      user: csvtest.user,
      list: {
        [Globals.ownerFieldName]: 'listowner',
        [Globals.readWritePermFieldName]: 'admin', // so that validateRWPerm is always false
        [Globals.itemReadWritePermFieldName]: 'admin' // so that validateRWPerm is always false
      },
      item: {
        [Globals.readWritePermFieldName]: 'admin' // so that validateRWPerm is always false
      },
      throwError: false
    }

    if (csvtest.list_rw_permission.substring(0, 5) !== 'unset') {
      test.list[Globals.readPermFieldName] = csvtest.list_rw_permission;
    }

    if (csvtest.list_item_rw_permission.substring(0, 5) !== 'unset') {
      test.list[Globals.itemReadPermFieldName] = csvtest.list_item_rw_permission;
    }

    if (csvtest.item_owner.substring(0, 5) !== 'unset') {
      test.item[Globals.ownerFieldName] = csvtest.item_owner;
    }
    
    if (csvtest.item_rw_permission.substring(0, 5) !== 'unset') {
      test.item[Globals.readPermFieldName] = csvtest.item_rw_permission;
    }
    var result = Utils.validateRPerm(test) ? 'TRUE': 'FALSE';
    expect(result).to.equal(csvtest.result_r);

    done();
  });

  it(i + '.3 - Test validateDPerm as ' + csvtest.user + " with (" + JSON.stringify(csvtestshort) + ")", (done) => {
    let test = {
      testnb: csvtest.testnb,
      user: csvtest.user,
      list: {
        [Globals.ownerFieldName]: 'listowner',
      },
      item: {
      },
      throwError: false
    }

    if (csvtest.list_rw_permission.substring(0, 5) !== 'unset') {
      test.list[Globals.readWritePermFieldName] = csvtest.list_rw_permission;
    }

    if (csvtest.list_item_rw_permission.substring(0, 5) !== 'unset') {
      test.list[Globals.itemReadWritePermFieldName] = csvtest.list_item_rw_permission;
    }

    if (csvtest.item_owner.substring(0, 5) !== 'unset') {
      test.item[Globals.ownerFieldName] = csvtest.item_owner;
    }
    
    if (csvtest.item_rw_permission.substring(0, 5) !== 'unset') {
      test.item[Globals.readWritePermFieldName] = csvtest.item_rw_permission;
    }
    var result = Utils.validateDPerm(test) ? 'TRUE': 'FALSE';
    expect(result).to.equal(csvtest.result_d);

    done();
  });
}
