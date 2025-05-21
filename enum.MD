# Enums in Apps Script

Replicating the Enum structure in Apps Script is tricky, as they are kind of odd structures to us JavaScript, unused as we are to having the kind of Enum structures you'd find in languages like Java. Apps Script is built on a back end infrastructure that is Java influenced, and until a few years ago actual ran on a JVM based JavaScript interpreter. Nowadays it runs on a V8 runtime, but the Java structural influences can still be found all over Apps Script.

## Enum properties
Let's look at the SpreadsheetApp.ColorType object, which is documented to have 3 properties

- UNSUPPORTED
- RGB
- THEME

## Enum keys
It's not a plain object with the these keys as you'd expect, but instead is an instanciation of a class with these properties

- toString()
- name()
- toJSON()
- ordinal(
- compareTo()
- UNSUPPORTED
- RGB
- THEME
- Symbol(enum_ordinal)

### Circularity
Each of the 3 property values (.UNSUPPORTED,.RGB and .THEME) have exactly the same object structure - in other words they reference each other - with only the functions returning like name() returning the value that matches the key name.

Spreadsheet.ColorType returns the exactly same (===) object as Spreadsheet.ColorType.UNSUPPORTED, so they point to the same instance. 

This leads to an ununusal circularity, where SpreadsheetApp.ColorType.RGB.RGB.RGB.RGB exists and is the same object as Spreadsheet.ColorType.RGB, and even SpreadsheetApp.ColorType.RGB.RGB.RGB.RGB.THEME === Spreadsheet.ColorType.THEME


name(),toJSON() and toString() all return the same value - for example RGB and compareTo is used to compare enums from the same Enum by returning the difference between their ordinals, which is useful for sorting enum values.

The name() of the base object - for example SpreadsheetApp.BandingTheme.toString() returns the default value "LIGHT_GREY" for the enum. In the case of SpreadsheetApp.ColorType, the default value is "UNSUPPORTED" as is often the case with enums that are used when there are builder classes involved.

I'm not saying all this is a good thing, by the way, but that's what it is, so let's look at how to replicate it.

## Approach to replicating


First we'll create a class that looks like the keys of the Apps Script enum. Since the Apps Script class doesn't hold a property for the name (or it's private - but Apps Script doesn't support private variables), we'll create these methods in the constructor.

````js
const ordinalKeySymbol = Symbol('enum_ordinal')

class CircularEnum {
  constructor(name, ordinal) {
    this[ordinalKeySymbol] = ordinal
    this.ordinal= () => this[ordinalKeySymbol]
    this.name = () => name;
    this.toString = () => name;
    this.toJSON = () => name;
    this.compareTo = (e) => this.ordinal() - e.ordinal()
  }
}

````

Next we'll make a function to generalize the creation of such classes

````js
  /**
   * make an apps script style enum
   * @param {string[]} keys the valid key values for the enum
   * @param {string} [defaultKey] normally we use the 1st key in the keys array, but this would pick another by name
   * @return {CircularEnum}
   */
  const makeCircularEnum = (keys, defaultKey) => {

    // we'll assume the default key is the first one if not specified
    let defaultIndex = 0

    // if one is specified then check it's in the list of valid values
    if (defaultKey) {
      defaultIndex = keys.indexOf(defaultKey)
      if (defaultIndex === -1) throw new Error(`Failed to find default enum key`, defaultKey)
    }
    defaultKey = keys[defaultIndex]

    // the base property (for Example SpreadsheetApp.ColorType)
    const base = new CircularEnum(defaultKey, defaultIndex)

    // now one for each requried key
    const enums = keys.map((key, i) => new CircularEnum(key, i))

    // add properties to base
    enums.forEach(e => base[e.name()] = e)

    // add circularity
    enums.forEach(e => keys.forEach(key => e[key] = base[key]))

    return base

  }
````

We can use it like this
````js
  const keys = ["UNSUPPORTED", "RGB", "THEME"]

  // imitate the SpreadsheetApp.ColorType enum
  const ColorType = makeCircularEnum (keys)
````

## Conclusion

You'll find all the Apps Script Enums coded in the services/enums folder of this repository.