import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';
const isEnum = (a) => is.object(a) && Reflect.has(a, "compareTo") && is.function(a.compareTo)
/**
 * Retrieves all unique properties from an object 
 * and its entire prototype chain.
 * @param {object} obj The object/class to inspect (e.g., DocumentApp).
 * @returns {string[]} An array of method names.
 */
const getAllKeys = (obj) => {
  const keys = new Set();
  let currentObj = obj;

  // Traverse the entire prototype chain
  while (currentObj && currentObj !== Object.prototype) {
    // Collect all own keys (including non-enumerable ones like methods)
    Object.getOwnPropertyNames(currentObj).forEach(key => keys.add(key));
    Object.getOwnPropertySymbols(currentObj).forEach(symbol => keys.add(symbol));
    
    // Move up the prototype chain
    currentObj = Object.getPrototypeOf(currentObj);
  }

  
  return Array.from(keys.keys());
}

const getService = (ob) => {
    const keys = getAllKeys (ob)
    return {
        name: ob.toString ? ob.toString() : 'na',
        properties: keys.map(key => {
            let ok = null
            try {
                ok = ob[key]
            } catch (err) {
                // because get on not yet implemented
                if (!err.message.includes('implemented')) {
                    throw err
                }
            }
            const type = is.null (ok) ? 'in progress' : (isEnum(ok) ? 'Enum' : is(ok))
            const item = {
                type,
                key,
            }
            if (ok && type !== 'Enum' && is.nonEmptyObject(ok)) {
                item.children = getService(ok)
            }
            return item
        })
    }

}

const main = () => {

    const obs = [DocumentApp,DriveApp]
    const services = obs.map(s => getService(s))
    console.log(JSON.stringify(services, null, 2))
}
main()