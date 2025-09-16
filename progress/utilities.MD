# Utilities Service Progress - 68% completed
**Documentation:** [Utilities Service](https://developers.google.com/apps-script/reference/utilities)
---
## [Utilities](https://developers.google.com/apps-script/reference/utilities/utilities)
This service provides utilities for string encoding/decoding, date formatting, JSON manipulation, and other miscellaneous tasks.
(19 methods out of 28 (68%) completed
| method | return | status | comments |
|---|---|---|---|
| [base64Decode(encoded, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64decodeencoded,-charset) | Byte[] | Completed | |
| [base64DecodeWebSafe(encoded, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64decodewebsafeencoded,-charset) | Byte[] | Completed | |
| [base64Encode(data, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64encodedata,-charset) | String | Completed | |
| [base64EncodeWebSafe(data, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64encodewebsafedata,-charset) | String | Completed | |
| [computeDigest(algorithm, value, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computedigestalgorithm,-value,-charset) | Byte[] | Completed | |
| [computeHmacSha256Signature(value, key, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeshasignaturevalue,-key,-charset) | Byte[] | Completed | |
| [computeHmacSignature(algorithm, value, key, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeshmacsignaturealgorithm,-value,-key,-charset) | Byte[] | Not Started | |
| [computeRsaSha1Signature(value, key, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computersasha1signaturevalue,-key,-charset) | Byte[] | Not Started | |
| [computeRsaSha256Signature(value, key, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computersasha256signaturevalue,-key,-charset) | Byte[] | Not Started | |
| [computeRsaSignature(algorithm, value, key, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computersasignaturealgorithm,-value,-key,-charset) | Byte[] | Not Started | |
| [formatDate(date, timeZone, format)](https://developers.google.com/apps-script/reference/utilities/utilities#formatdatedate,-timezone,-format) | String | Not Started | |
| [formatString(template, args)](https://developers.google.com/apps-script/reference/utilities/utilities#formatstringtemplate,-args) | String | Not Started | |
| [getUuid()](https://developers.google.com/apps-script/reference/utilities/utilities#getuuid) | String | Completed | |
| [gzip(blob, name)](https://developers.google.com/apps-script/reference/utilities/utilities#gzipblob,-name) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [newBlob(data, contentType, name)](https://developers.google.com/apps-script/reference/utilities/utilities#newblobdata,-contenttype,-name) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [parseCsv(csv, delimiter)](https://developers.google.com/apps-script/reference/utilities/utilities#parsecsvcsv,-delimiter) | String[][] | Not Started | |
| [sleep(milliseconds)](https://developers.google.com/apps-script/reference/utilities/utilities#sleepmilliseconds) | void | Completed | |
| [ungzip(blob)](https://developers.google.com/apps-script/reference/utilities/utilities#ungzipblob) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [unzip(blob)](https://developers.google.com/apps-script/reference/utilities/utilities#unzipblob) | [Blob[]](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
| [zip(blobs, name)](https://developers.google.com/apps-script/reference/utilities/utilities#zipblobs,-name) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Completed | |
---
## [Charset](https://developers.google.com/apps-script/reference/utilities/charset)
A typesafe enum for character sets.
(2 methods out of 2 (100%) completed
| method | return | status | comments |
|---|---|---|---|
| [US_ASCII](https://developers.google.com/apps-script/reference/utilities/charset#us_ascii) | Charset | Completed | |
| [UTF_8](https://developers.google.com/apps-script/reference/utilities/charset#utf_8) | Charset | Completed | |
---
## [DigestAlgorithm](https://developers.google.com/apps-script/reference/utilities/digest-algorithm)
Selector of Digest algorithm.
(6 methods out of 6 (100%) completed
| method | return | status | comments |
|---|---|---|---|
| [MD2](https://developers.google.com/apps-script/reference/utilities/digest-algorithm#md2) | DigestAlgorithm | Completed | |
| [MD5](https://developers.google.com/apps-script/reference/utilities/digest-algorithm#md5) | DigestAlgorithm | Completed | |
| [SHA_1](https://developers.google.com/apps-script/reference/utilities/digest-algorithm#sha_1) | DigestAlgorithm | Completed | |
| [SHA_256](https://developers.google.com/apps-script/reference/utilities/digest-algorithm#sha_256) | DigestAlgorithm | Completed | |
| [SHA_384](https://developers.google.com/apps-script/reference/utilities/digest-algorithm#sha_384) | DigestAlgorithm | Completed | |
| [SHA_512](https://developers.google.com/apps-script/reference/utilities/digest-algorithm#sha_512) | DigestAlgorithm | Completed | |
---
## [MacAlgorithm](https://developers.google.com/apps-script/reference/utilities/mac-algorithm)
Selector of MAC algorithm.
(4 methods out of 4 (100%) completed
| method | return | status | comments |
|---|---|---|---|
| [HMAC_MD5](https://developers.google.com/apps-script/reference/utilities/mac-algorithm#hmac_md5) | MacAlgorithm | Not Started | |
| [HMAC_SHA_1](https://developers.google.com/apps-script/reference/utilities/mac-algorithm#hmac_sha_1) | MacAlgorithm | Not Started | |
| [HMAC_SHA_256](https://developers.google.com/apps-script/reference/utilities/mac-algorithm#hmac_sha_256) | MacAlgorithm | Not Started | |
| [HMAC_SHA_512](https://developers.google.com/apps-script/reference/utilities/mac-algorithm#hmac_sha_512) | MacAlgorithm | Not Started | |
---
## [RsaAlgorithm](https://developers.google.com/apps-script/reference/utilities/rsa-algorithm)
Selector of RSA algorithm.
(3 methods out of 3 (100%) completed
| method | return | status | comments |
|---|---|---|---|
| [RSA_SHA_1](https://developers.google.com/apps-script/reference/utilities/rsa-algorithm#rsa_sha_1) | RsaAlgorithm | Not Started | |
| [RSA_SHA_256](https://developers.google.com/apps-script/reference/utilities/rsa-algorithm#rsa_sha_256) | RsaAlgorithm | Not Started | |