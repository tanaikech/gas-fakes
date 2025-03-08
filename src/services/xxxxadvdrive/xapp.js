// fake Apps Script advanced drive Drive
import { getAuthedClient } from '../drive/drapis.js'
import { Proxies } from '../../support/proxies.js'

// this differs from the normal proxy handler
// - there is no set
// - the objects in the the advanced service dont exactly map to the node service
// - for example Drive.Files in adv service = Drive.files in the Node client
// - functions will need to be converted to async from async
// - there are some that don't have an equivalent
const getAppHandler = (getApp, name) => {
  return {

    get(_, prop) {

      // this will let the caller know we're not really running in Apps Script 
      if (prop === 'isFake') return true
      console.log (prop)
      // need to do some mapping between adv service and node api
      const app = getApp()

      // so maybe its a known anomaly (eg getVersion which doesnt exist in the api)
      if (Reflect.has (anomalies, prop)) {
        return anomalies[prop]
      }

      // in this case its some non public thing so let that fo
      if (typeof prop === 'symbol' ) {
        return Reflect.get (app, prop)
      }

      // we may need to convert to sync
      const applyHandler = (useProp) => {
        const ob = Reflect.get(app, useProp)
        if (typeof ob !== 'function') {
          return ob
        }
        return new Proxy (ob, {
          apply (target, thisArg, ...args) {
            console.log ('applying useprop')
            return target (...args)
          }
        })
      }

      // it matches
      if (Reflect.has(app, prop)) {
        return applyHandler (prop)
      }

      // lets try lowercasing the prop name
      const apiProp =  prop.substring(0, 1).toLowerCase() + prop.substring(1)
      if (Reflect.has (app, apiProp)) {
        return applyHandler (apiProp)
      }


      // i give up
      return Reflect.get(app, prop)

    },

    set(_, prop, value) {
      // private props are indicated with a leading __ so are allowed
      if (prop.substring(0, 2) === '__') return Reflect.set(getApp(), prop, value)
      throw new Error(`setting values directly in ${name}.${prop} is not allowed`)
    },

    ownKeys(_) {
      return Reflect.ownKeys(getApp())
    }
  }
}

/**
 * 
 * @param {} app 
 * @param {*} prop 
 */
const anomalies = {
  getVersion: () => 'v3'
}


const registerProxy = (name, getApp) => {
  const value = new Proxy({}, getAppHandler(getApp, name))
  // add it to the global space to mimic what apps script does
  Object.defineProperty(globalThis, name, {
    value,
    enumerable: true,
    configurable: false,
    writable: false,
  });
}


// This will eventually hold a proxy for DriveApp
let _app = null

/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "Drive"
if (typeof globalThis[name] === typeof undefined) {

  const getApp = () => {
    // if it hasne been intialized yet then do that
    if (!_app) {
      _app = Proxies.guard(getAuthedClient())
    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }

  registerProxy(name, getApp)

}
