/**
 * Fake implementation of Google Apps Script Jdbc's BigDecimal (java.math.BigDecimal proxy)
 */
export class FakeJdbcBigDecimal {
  constructor(val) {
    this.val = String(val);
  }

  /**
   * Returns the string representation of this BigDecimal.
   * This is how it's typically used in Apps Script for comparison or output.
   */
  toString() {
    return this.val;
  }

  /**
   * Returns the value as a JavaScript number.
   * Corresponds to Java's doubleValue()
   */
  doubleValue() {
    return Number(this.val);
  }

  /**
   * Returns the value as an integer.
   * Corresponds to Java's intValue()
   */
  intValue() {
    return Math.floor(Number(this.val));
  }

  /**
   * Returns the value as a long integer.
   * Corresponds to Java's longValue()
   */
  longValue() {
    return Math.floor(Number(this.val));
  }

  /**
   * Returns the string representation without scientific notation.
   * Corresponds to Java's toPlainString()
   */
  toPlainString() {
    return this.val;
  }

  /**
   * Returns the scale of this BigDecimal.
   */
  scale() {
    const parts = this.val.split('.');
    return parts.length > 1 ? parts[1].length : 0;
  }

  /**
   * Returns the precision of this BigDecimal.
   */
  precision() {
    return this.val.replace('.', '').replace('-', '').length;
  }
}
