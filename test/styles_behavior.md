# Learnings on Google Apps Script DocumentApp Style Behavior

Through extensive testing and debugging of `testdocsstyles.js` against the live Google Apps Script (GAS) environment, several key behavioral differences and oddities were discovered compared to the `gas-fakes` emulator and general developer expectations. This document summarizes these findings.

## 1. `Element.getAttributes()`

This method's behavior is the most significant and nuanced discovery. It does **not** return the full *computed* style of an element.

*   **General Rule**: For any element (like a `Paragraph`) that has a named style applied (e.g., `HEADING_1`, `HEADING_2`), `getAttributes()` will return `null` for any attribute that is inherited from that style. It only returns a value for attributes that have been set as an **inline override** on that specific element.

*   **The `NORMAL_TEXT` Exception**: Paragraphs with the default `NORMAL_TEXT` style behave differently. For these paragraphs, `getAttributes()` **will** return the computed values for *paragraph-level* attributes (like `HORIZONTAL_ALIGNMENT` and `LINE_SPACING`). However, it still returns `null` for inherited *text-level* attributes (like `FONT_FAMILY`).

*   **Implication**: This makes it difficult to programmatically check the full, rendered style of an element using only `getAttributes()`. You cannot rely on it to tell you the font or alignment of a `HEADING_1` paragraph, as those values will be `null`.

## 2. `Body.setHeadingAttributes(heading, attributes)`

This method modifies the *definition* of a named style (e.g., `HEADING_1`) for the entire document.

*   **No Effect on Existing Paragraphs**: Calling this method does **not** change the appearance of paragraphs that *already* use the specified heading style. It only affects paragraphs to which the heading is applied *after* the call.

*   **Ignores Text Attributes**: The live API correctly ignores any text-level attributes passed in the `attributes` object. This includes:
    *   `FONT_FAMILY`
    *   `ITALIC`
    *   `BOLD`
    *   `FOREGROUND_COLOR`
    *   etc.

*   **Partial Application of Paragraph Attributes**: This is a key oddity. The live API does not apply all valid paragraph attributes. In our tests:
    *   `SPACING_BEFORE` was **successfully** applied to the style definition.
    *   `HORIZONTAL_ALIGNMENT` was **ignored**.

    This means you cannot reliably set all paragraph-level styles for a heading using this method.

## 3. `Body.setAttributes(attributes)`

This method is intended to set the default attributes for the body, which affects newly inserted content and can also modify existing content.

*   **Effect on Existing Paragraphs**:
    *   It **applies** text-level attributes (`ITALIC`, `FONT_FAMILY`, etc.) as inline styles to all existing paragraphs in the body.
    *   It does **not** apply paragraph-level attributes (`HORIZONTAL_ALIGNMENT`, etc.) to existing paragraphs.

*   **Effect on New Paragraphs**:
    *   When a new paragraph is appended after `setAttributes` is called, it **inherits** the new default *text-level* attributes.
    *   It does **not** inherit the *paragraph-level* attributes; these fall back to the `NORMAL_TEXT` defaults (e.g., `HORIZONTAL_ALIGNMENT` remains `LEFT`).

## 4. API Synchronization and Document State

*   **State Discrepancy**: Changes made via the `DocumentApp` service are not always immediately reflected when inspecting the document via the advanced `Docs` service (and vice-versa).

*   **`saveAndClose()` is Key**: The pattern of using `doc.saveAndClose()` followed by `DocumentApp.openById(id)` is a reliable method to force synchronization and ensure that subsequent API calls see the latest state of the document. This is crucial for writing reliable tests that mix both services.

*   **`Document.clear()`**: The `clear()` method only removes the content from the document's `Body`. It does **not** remove or reset headers, footers, or the `documentStyle` (e.g., margins).

## Conclusion

The live `DocumentApp` service has several non-obvious behaviors, particularly around style inheritance and application. The `getAttributes()` method is not a reliable way to get the full computed style of an element, and methods like `setHeadingAttributes()` have inconsistent effects. Developers should be aware of these quirks and test their style-manipulation code thoroughly against the live environment. For complex style verification, using the advanced `Docs` service to inspect the underlying document resource is often more reliable.