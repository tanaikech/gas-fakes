# [Utilities](https://developers.google.com/apps-script/reference/utilities)

This service provides utilities for string encoding/decoding, date formatting, JSON manipulation, and other miscellaneous tasks.

## Class: [Utilities](https://developers.google.com/apps-script/reference/utilities/utilities)

This service provides utilities for string encoding/decoding, date formatting, JSON manipulation, and other miscellaneous tasks.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [base64Decode(String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64Decode(String,Charset)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L139) |
| [base64Decode(String)](https://developers.google.com/apps-script/reference/utilities/utilities#base64Decode(String)) | Decodes a base-64 encoded string into a UTF-8 byte array. | Byte[] | The raw data represented by the base-64 encoded argument as a byte array. | in progress | [link](../src/services/utilities/fakeutilities.js#L139) |
| [base64DecodeWebSafe(String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64DecodeWebSafe(String,Charset)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L143) |
| [base64DecodeWebSafe(String)](https://developers.google.com/apps-script/reference/utilities/utilities#base64DecodeWebSafe(String)) | Decodes a base-64 web-safe encoded string into a UTF-8 byte array. | Byte[] | The raw data represented by the base-64 web-safe encoded argument as a byte array. | in progress | [link](../src/services/utilities/fakeutilities.js#L143) |
| [base64Encode(Byte)](https://developers.google.com/apps-script/reference/utilities/utilities#base64Encode(Byte)) | Generates a base-64 encoded string from the given byte array. Base 64 is a common encoding accepted by a variety of tools that cannot accept binary data. Base 64 is commonly used in internet protocols such as email, HTTP, or in XML documents. | String | The base-64 encoded representation of the passed in data. | in progress | [link](../src/services/utilities/fakeutilities.js#L131) |
| [base64Encode(String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64Encode(String,Charset)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L131) |
| [base64Encode(String)](https://developers.google.com/apps-script/reference/utilities/utilities#base64Encode(String)) | Generates a base-64 encoded string from the given string. Base 64 is a common encoding accepted by a variety of tools that cannot accept binary data. Base 64 is commonly used in internet protocols such as email, HTTP, or in XML documents. | String | The base-64 encoded representation of the input string. | in progress | [link](../src/services/utilities/fakeutilities.js#L131) |
| [base64EncodeWebSafe(Byte)](https://developers.google.com/apps-script/reference/utilities/utilities#base64EncodeWebSafe(Byte)) | Generates a base-64 web-safe encoded string from the given byte array. Base 64 is a common encoding accepted by a variety of tools that cannot accept binary data. Base 64 web-safe is commonly used in internet protocols such as email, HTTP, or in XML documents. | String | The base-64 web-safe encoded representation of the passed in data. | in progress | [link](../src/services/utilities/fakeutilities.js#L135) |
| [base64EncodeWebSafe(String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64EncodeWebSafe(String,Charset)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L135) |
| [base64EncodeWebSafe(String)](https://developers.google.com/apps-script/reference/utilities/utilities#base64EncodeWebSafe(String)) | Generates a base-64 web-safe encoded string from the given string. Base 64 is a common encoding accepted by a variety of tools that cannot accept binary data. Base 64 web-safe is commonly used in internet protocols such as email, HTTP, or in XML documents. | String | The base-64 web-safe encoded representation of the input string. | in progress | [link](../src/services/utilities/fakeutilities.js#L135) |
| [computeDigest(DigestAlgorithm,Byte)](https://developers.google.com/apps-script/reference/utilities/utilities#computeDigest(DigestAlgorithm,Byte)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L154) |
| [computeDigest(DigestAlgorithm,String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeDigest(DigestAlgorithm,String,Charset)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L154) |
| [computeDigest(DigestAlgorithm,String)](https://developers.google.com/apps-script/reference/utilities/utilities#computeDigest(DigestAlgorithm,String)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L154) |
| [computeHmacSha256Signature(Byte,Byte)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSha256Signature(Byte,Byte)) |  |  |  | completed | [link](../src/services/utilities/fakeutilities.js#L214) |
| [computeHmacSha256Signature(String,String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSha256Signature(String,String,Charset)) |  |  |  | completed | [link](../src/services/utilities/fakeutilities.js#L214) |
| [computeHmacSha256Signature(String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSha256Signature(String,String)) |  |  |  | completed | [link](../src/services/utilities/fakeutilities.js#L214) |
| [computeHmacSignature(MacAlgorithm,Byte,Byte)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSignature(MacAlgorithm,Byte,Byte)) |  |  |  | not started |  |
| [computeHmacSignature(MacAlgorithm,String,String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSignature(MacAlgorithm,String,String,Charset)) |  |  |  | not started |  |
| [computeHmacSignature(MacAlgorithm,String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSignature(MacAlgorithm,String,String)) |  |  |  | not started |  |
| [computeRsaSha1Signature(String,String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeRsaSha1Signature(String,String,Charset)) |  |  |  | not started |  |
| [computeRsaSha1Signature(String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#computeRsaSha1Signature(String,String)) |  |  |  | not started |  |
| [computeRsaSha256Signature(String,String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeRsaSha256Signature(String,String,Charset)) |  |  |  | not started |  |
| [computeRsaSha256Signature(String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#computeRsaSha256Signature(String,String)) |  |  |  | not started |  |
| [computeRsaSignature(RsaAlgorithm,String,String,Charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeRsaSignature(RsaAlgorithm,String,String,Charset)) |  |  |  | not started |  |
| [computeRsaSignature(RsaAlgorithm,String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#computeRsaSignature(RsaAlgorithm,String,String)) |  |  |  | not started |  |
| [formatDate(Date,String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#formatDate(Date,String,String)) |  |  |  | not started |  |
| [formatString(String,Object...)](https://developers.google.com/apps-script/reference/utilities/utilities#formatString(String,Object...)) |  |  |  | not started |  |
| [getUuid()](https://developers.google.com/apps-script/reference/utilities/utilities#getUuid()) | Get a UUID as a string (equivalent to using the java.util.UUID.randomUUID() method). This identifier is not guaranteed to be unique across all time and space. As such, do not use in situations where guaranteed uniqueness is required. | String | A string representation of the UUID. | in progress | [link](../src/services/utilities/fakeutilities.js#L80) |
| [gzip(BlobSource,String)](https://developers.google.com/apps-script/reference/utilities/utilities#gzip(BlobSource,String)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L5) |
| [gzip(BlobSource)](https://developers.google.com/apps-script/reference/utilities/utilities#gzip(BlobSource)) | gzip-compresses the provided Blob data and returns it in a new Blob object. | Blob | A new Blob containing the compressed data. | in progress | [link](../src/services/utilities/fakeutilities.js#L5) |
| [newBlob(Byte,String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(Byte,String,String)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L73) |
| [newBlob(Byte,String)](https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(Byte,String)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L73) |
| [newBlob(Byte)](https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(Byte)) | Create a new Blob object from a byte array. Blobs are used in many Apps Script APIs that take binary data as input. | Blob | The newly created Blob. | in progress | [link](../src/services/utilities/fakeutilities.js#L73) |
| [newBlob(String,String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(String,String,String)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L73) |
| [newBlob(String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(String,String)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L73) |
| [newBlob(String)](https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(String)) | Create a new Blob object from a string. Blobs are used in many Apps Script APIs that take binary data as input. | Blob | The newly created Blob. | in progress | [link](../src/services/utilities/fakeutilities.js#L73) |
| [parseCsv(String,Char)](https://developers.google.com/apps-script/reference/utilities/utilities#parseCsv(String,Char)) |  |  |  | not started |  |
| [parseCsv(String)](https://developers.google.com/apps-script/reference/utilities/utilities#parseCsv(String)) | Returns a tabular 2D array representation of a CSV string. | String[][] | A two-dimensional array containing the values in the CSV string. | not started |  |
| [parseDate(String,String,String)](https://developers.google.com/apps-script/reference/utilities/utilities#parseDate(String,String,String)) |  |  |  | not started |  |
| [sleep(Integer)](https://developers.google.com/apps-script/reference/utilities/utilities#sleep(Integer)) | Sleeps for specified number of milliseconds. Immediately puts the script to sleep for the specified number of milliseconds. The maximum allowed value is 300000 (or 5 minutes). |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L1) |
| [ungzip(BlobSource)](https://developers.google.com/apps-script/reference/utilities/utilities#ungzip(BlobSource)) | Uncompresses a Blob object and returns a Blob containing the uncompressed data. | Blob | A Blob representing the decompressed data. | in progress | [link](../src/services/utilities/fakeutilities.js#L124) |
| [unzip(BlobSource)](https://developers.google.com/apps-script/reference/utilities/utilities#unzip(BlobSource)) | Takes a Blob representing a zip file and returns its component files. | Blob[] | A Blob[] representing the component blobs, each named with the full path inside the zip. | in progress | [link](../src/services/utilities/fakeutilities.js#L7) |
| [zip(BlobSource,String)](https://developers.google.com/apps-script/reference/utilities/utilities#zip(BlobSource,String)) |  |  |  | in progress | [link](../src/services/utilities/fakeutilities.js#L5) |
| [zip(BlobSource)](https://developers.google.com/apps-script/reference/utilities/utilities#zip(BlobSource)) | Creates a new Blob object that is a zip file containing the data from the Blobs passed in. | Blob | A new blob containing the inputs as an archive. | in progress | [link](../src/services/utilities/fakeutilities.js#L5) |

## Enum: [Charset](https://developers.google.com/apps-script/reference/utilities/charset)

A typesafe enum for character sets.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| US_ASCII |  | not started |  |
| UTF_8 |  | not started |  |

## Enum: [DigestAlgorithm](https://developers.google.com/apps-script/reference/utilities/digest-algorithm)

Selector of Digest algorithm.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| MD2 | MD2 algorithm | not started |  |
| MD5 | MD5 algorithm | not started |  |
| SHA_1 | SHA-1 algorithm | not started |  |
| SHA_256 | SHA-256 algorithm | not started |  |
| SHA_384 | SHA-384 algorithm | not started |  |
| SHA_512 | SHA-512 algorithm | not started |  |

## Enum: [MacAlgorithm](https://developers.google.com/apps-script/reference/utilities/mac-algorithm)

Selector of MAC algorithm

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| HMAC_MD5 |  | not started |  |
| HMAC_SHA_1 |  | not started |  |
| HMAC_SHA_256 |  | not started |  |
| HMAC_SHA_384 |  | not started |  |
| HMAC_SHA_512 |  | not started |  |

## Enum: [RsaAlgorithm](https://developers.google.com/apps-script/reference/utilities/rsa-algorithm)

Selector of RSA algorithm

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| RSA_SHA_1 |  | not started |  |
| RSA_SHA_256 |  | not started |  |

