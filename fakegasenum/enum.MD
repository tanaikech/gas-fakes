# Fake Gas Enum

Allows creation of Apps Script Style Enums in both Node (npm module) and Apps Script (library available).

## installation Node
````
npm i @mcpher/fake-gas-enum
````
## Usage

````js
import { newFakeGasEnum } from '../main.js'
const Fruit = newFakeGasEnum (["APPLE", "BANANA", "ORANGE"])
````

## installation Apps Script
````
````
## Usage

````js

const Fruit = newGasEnum (["APPLE", "BANANA", "ORANGE"])
````

## Enums in Apps Script

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

This leads to an unusal circularity, where SpreadsheetApp.ColorType.RGB.RGB.RGB.RGB exists and is the same object as Spreadsheet.ColorType.RGB, and even SpreadsheetApp.ColorType.RGB.RGB.RGB.RGB.THEME === Spreadsheet.ColorType.THEME

name(),toJSON() and toString() all return the same value - for example RGB and compareTo is used to compare enums from the same Enum by returning the difference between their ordinals, which is useful for sorting enum values.

The name() of the base object - for example SpreadsheetApp.BandingTheme.toString() returns the default value "LIGHT_GREY" for the enum. In the case of SpreadsheetApp.ColorType, the default value is "UNSUPPORTED" as is often the case with enums that are used when there are builder classes involved.


## Approach to replicating

I'm not saying all this circularity is a good thing, by the way, but that's what it is.

Here's a set of tests imitating the Apps Script ColorType Enum
````js
    /// apps script fake example
  const keys = ["UNSUPPORTED", "RGB", "THEME"]

  // imitate the SpreadsheetApp.ColorType enum
  const ColorType = newFakeGasEnum (keys)

  t.is(ColorType.toString(), "UNSUPPORTED")
  t.is(ColorType.name(), "UNSUPPORTED")
  t.is(ColorType.toJSON(), "UNSUPPORTED")
  t.is(ColorType.ordinal(), 0)
  t.is(ColorType.compareTo(ColorType.UNSUPPORTED), 0)
  t.is(ColorType.RGB.toString(), "RGB")
  t.is(ColorType.RGB.name(), "RGB")
  t.is(ColorType.RGB.toJSON(), "RGB")
  t.is(ColorType.RGB.ordinal(), 1)
  t.is(ColorType.RGB.compareTo(ColorType.RGB), 0)
  t.is(ColorType.THEME.toString(), "THEME") 
  t.is(ColorType.THEME.name(), "THEME")
  t.is(ColorType.THEME.toJSON(), "THEME")
  t.is(ColorType.THEME.ordinal(), 2)
  t.is(ColorType.THEME.compareTo(ColorType.THEME), 0)

  t.is(ColorType.THEME.compareTo(ColorType), 2)
  t.is(ColorType.RGB.compareTo(ColorType), 1)
  t.is(ColorType.RGB.compareTo(ColorType.THEME), -1)

  t.is(ColorType.THEME.RGB.RGB.THEME.UNSUPPORTED.RGB.RGB.toString(), "RGB", "just some Apps Script weirdness")

````

### Default key

As you'll have seen, the FakeGasEnum has a default value. In the case of the ColorType above, ColorType.name() is the same as ColorType.UNSUPPORTED.name(). This is simply the first value in the array of keys you provide to newFakeGasEnum(keys).

If you really want to for some reason, you can provide a different default value.
````js
const Fruit = newFakeGasEnum (["apple", "banana", "orange"], "orange")

// in this case
t.is(Fruit.name(), "orange")
t.is(Fruit.name(), Fruits.orange.name())

````

Note that there is no case conversion performed, so in keeping with convention you should probably use upper case for the key names.
````js
const Fruit = newFakeGasEnum (["APPLE", "BANANA", "ORANGE"], "ORANGE")

// in this case
t.is(Fruit.name(), "ORANGE")
t.is(Fruit.name(), Fruits.ORANGE.name())
````

## Proxy guarding

All key accesses are checked for validity via a proxy and will throw an error if you try to access a key that doesn't exist.
````js
 t.is( t.threw (()=>p.foo).message, "attempt to get non-existent property foo in fake-gas-enum", "check proxies are guarding")
````

You can of course use Reflect to see if an Enum has a particular key defined.
````js
Reflect.has (ColorType, "foo") // false
````


## Conclusion

This project is associated with the project to imitate a synchronous Apps Script environment directly on Node - [gas-fakes](https://github.com/brucemcpherson/gas-fakes)

You'll find all the Apps Script Enums coded using this technique in the src/services/enums folder