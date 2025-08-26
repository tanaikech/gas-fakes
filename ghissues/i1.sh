#!/bin/bash

# This script uses the GitHub CLI (gh) to create issues in the current repository.
# Make sure you have 'gh' installed and are authenticated.

# Issue 1: DataValidationCriteria Enum Differences
gh issue create --title "Discrepancy in DataValidationCriteria enum names between Apps Script and Sheets API" --body-file - <<'EOF'
There are minor differences in the string representation of some `DataValidationCriteria` enums between the Apps Script service and the underlying Sheets API. For example, Apps Script uses `TEXT_IS_VALID_EMAIL` while the API uses `TEXT_IS_EMAIL`.

`gas-fakes` maintains an internal mapping to handle these translations, but developers using both the simple and advanced services should be aware of these naming differences.
EOF

# Issue 2: Stricter Error Handling
gh issue create --title "gas-fakes throws errors for invalid arguments where Apps Script fails silently" --body-file - <<'EOF'
The live Apps Script environment often ignores invalid arguments silently. For example, `range.setBackground("invalid-color")` or `range.setHorizontalAlignment('foo')` will execute without error in Apps Script, having no effect.

`gas-fakes` intentionally implements stricter argument validation and will throw an error in these cases to provide better immediate feedback during local development. This is a deliberate design choice and a known divergence.
EOF

# Issue 3: range.copyTo Implementation
gh issue create --title "range.copyTo implementation is cleaner and stricter than the buggy Apps Script version" --body-file - <<'EOF'
The `range.copyTo()` method in Apps Script has several documented bugs and inconsistencies (see Issue 427192537), such as:
- Incorrectly handling destinations smaller than the source.
- Not throwing errors for conflicting options like `{contentsOnly: true, formatOnly: true}`.
- Ignoring invalid `CopyPasteType` enums.

`gas-fakes` implements a cleaner, more correct version of `copyTo` that behaves as documented and throws errors where appropriate. This is a known divergence from the live (buggy) environment.
EOF

# Issue 4: getTextRotation() Limitation
gh issue create --title "getTextRotation() returns 0 for angle due to Sheets API limitation" --body-file - <<'EOF'
Due to a limitation in the Sheets API (Issue 425390984), it is not possible to retrieve the angle of a text rotation that was set.

As a result, `range.getTextRotation().getDegrees()` in `gas-fakes` will always return `0`, even if a different angle has been set in the UI or via `setTextRotation()`. The `isVertical()` property, however, works as expected.
EOF

# Issue 5: appendTable() Divergence
gh issue create --title "appendTable() with no arguments creates a 1x1 table, unlike Apps Script's 0-row table" --body-file - <<'EOF'
In the live environment, `DocumentApp.getBody().appendTable()` creates a table with 0 rows. The underlying Docs API, however, requires that a table be created with at least one row and one column.

To work around this API limitation (Issue 438038924), `gas-fakes` creates a 1x1 table when `appendTable()` is called with no arguments. This is a known difference in behavior.
EOF

# Issue 6: getNotes() Normalization
gh issue create --title "getNotes() normalization for numeric values" --body-file - <<'EOF'
Apps Script has an inconsistency (Issue 429373214) where setting a note with a number can result in different string representations (e.g., "25" vs "25.0") depending on whether `setNote()` or `setNotes()` was used.

To provide consistent behavior, `gas-fakes` normalizes all numeric notes to the "xx.0" format upon retrieval. This may differ from the live behavior for notes set with `setNote()`.
EOF

# Issue 7: Unimplemented Document Features
gh issue create --title "Document Tab and HorizontalRule creation not implemented" --body-file - <<'EOF'
The underlying Google Docs API does not currently provide a programmatic way to create or manage document tabs (Issue 375867285) or insert horizontal rule elements (Issue 437825936).

Due to these API limitations, the corresponding methods in `gas-fakes` (e.g., `appendHorizontalRule`, and any methods for creating new tabs) are not implemented and are currently parked.
EOF

echo "All issues have been created."
