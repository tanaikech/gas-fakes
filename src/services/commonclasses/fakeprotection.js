import { Proxies } from '../../support/proxies.js'
import { notYetImplemented, signatureArgs } from '../../support/helpers.js'
import { Utils } from '../../support/utils.js'
import { FakeSheetRange } from '../spreadsheetapp/fakesheetrange.js'
import { newFakeUser } from './fakeuser.js'
const { is } = Utils



/**
 * create a new FakeBorder instance
 * @param  {...any} args 
 * @returns {FakeBorder}
 */
export const newFakeProtection = (...args) => {
  return Proxies.guard(new FakeProtection(...args))
}

class FakeProtection {
  /**
   * @param {object} p params
   * @param {FakeProtectionType} p.type of protection
   * @param {FakeSheet} p.sheet sheet this applies to
   * @param {ProtectedRange} p.apiResult https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/sheets#ProtectedRange
   * @return {FakeProtection}
   */

  constructor({ type, sheet, apiResult }) {
    this.__type = type
    this.__sheet = sheet

    if (!apiResult?.range) {
      throw new Error("missing range property in protection api result")
    }

    if (type.toString() === 'RANGE' && !Reflect.has(apiResult.range, 'startRowIndex')) {
      throw new Error(`Missing gridrange properties for range protection:` + JSON.stringify(gridRange))
    }

    // if this is a type SHEET, then fakesheetrange should be able to handle dummying up its functions to cope
    this.__range = new FakeSheetRange(apiResult.range, sheet)
    this.__apiResult = apiResult


    const props = [
      "addEditor",
      "addEditors",

      "addTargetAudience",
      // TODO we get a rangename ID - TODO once named ranges are implemented
      "getRangeName",
      
      // TODO i believe this refers to any thing that's been explicitly set - TODO once i implement these sets
      "addTargetAudience",
      "getTargetAudiences",

      "remove",
      "removeEditor",
      "removeEditors",
      "removeTargetAudience",
      "setDescription",
      "setDomainEdit",
      "setNamedRange",
      "setRange",
      "setRangeName",
      "setUnprotectedRanges",
      "setWarningOnly"
    ]
    props.forEach(f => {
      this[f] = () => {
        return notYetImplemented(f)
      }
    })
  }
  getProtectionType() {
    return this.__type
  }
  getSheet() {
    return this.__sheet
  }
  getRange() {
    return this.__range
  }
  toString() {
    return 'Protection'
  }
  /**
   * canEdit() https://developers.google.com/apps-script/reference/spreadsheet/protection#canedit
   * Determines whether the user has permission to edit the protected range or sheet. The spreadsheet owner is always able to edit protected ranges and sheets.
   * @returns {boolean}
   */
  canEdit () {
    return this.__apiResult.requestingUserCanEdit
  }
  getEditors() {
    return this.__apiResult.editors?.users?.map(f=>newFakeUser({email:f})) || []
  }
  canDomainEdit () {
    return this.__apiResult.editors?.domainUsersCanEdit || false
  }
  getDescription () {
    return this.__apiResult.description || ''
  }
  getUnprotectedRanges () {
    return this.__apiResult.unprotectedRanges?.map (f => new FakeSheetRange(f, this.__sheet)) || []
  }
  isWarningOnly () {
    return this.__apiResult.warningOnly || false
  }
  

}