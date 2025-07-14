

/**
 * diverts the property get to another object returned by the getApp function
 * @param {function} a function to get the proxy object to substitutes
 * @returns {function} a handler for a proxy
 */
const getAppHandler = (getApp, name) => {
  return {

    get(_, prop) {
      // this will let the caller know we're not really running in Apps Script 
      return (prop === 'isFake')  ? true : Reflect.get(getApp(), prop);
    },

    set(_, prop, value) {
      // private props are indicated with a leading __ so are allowed
      if (prop.substring(0,2) === '__') return Reflect.set (getApp(), prop, value)
      throw new Error(`setting values directly in ${name}.${prop} is not allowed`)
    },

    ownKeys(_) {
      return Reflect.ownKeys(getApp())
    }
  }
}

const registerProxy = (name, getApp) => {
  const value = new Proxy({}, getAppHandler(getApp, name))
  // add it to the global space to mimic what apps script does
  // console.log (`setting ${name} to global`)
  Object.defineProperty(globalThis, name, {
    value,
    enumerable: true,
    configurable: false,
    writable: false,
  });
}

// this proxy returns a stanard function to any attempt to access any properties
const blanketProxy = (blanketFunc) => {
  return new Proxy ({}, {
    get () {
      return blanketFunc
    }
  })
}



/**
 * for validating attempts to access non existent properties
 */
const validateProperties = () => {
  return {
    get(target, prop, receiver) {
      if (
        // skip any inserted symbos
        typeof prop !== 'symbol' &&
        // sometimes typeof & console.log looks for ths
        prop !== 'inspect' &&
        // this is a mysterious property that APPS script sometimes checks for
        prop !== '__GS_INTERNAL_isProxy' &&
        // check the object has this property
        !Reflect.has(target, prop)
      )
        throw new Error(`attempt to get non-existent property ${prop}: may not be implemented yet`)

      return Reflect.get(target, prop, receiver);
    },

    set(target, prop, value, receiver) {
      if (!Reflect.has(target, prop))
        throw `guard attempt to set non-existent property ${prop}`;
      return Reflect.set(target, prop, value, receiver);
    },
  };
}

 // used to trap access to unknown properties
 const guard = (target) => {
  return new Proxy(target, validateProperties);
 }

export const Proxies = {
  getAppHandler,
  registerProxy,
  guard,
  blanketProxy
}