

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
        throw new Error(`attempt to get non-existent property ${prop} in fake-gas-enum`)

      return Reflect.get(target, prop, receiver);
    }


  };
}

 // used to trap access to unknown properties
 export const guard = (target) => {
  return new Proxy(target, validateProperties());
 }

