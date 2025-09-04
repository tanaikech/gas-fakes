# Utilities Service Progress
**Documentation:** [Utilities Service](https://developers.google.com/apps-script/reference/utilities)
---
Overall Service Completion: 51% completed
## [Charset](https://developers.google.com/apps-script/reference/utilities/charset)
An enum representing the character sets supported by this service.

100% completed

| method | return | status | comments |
|---|---|---|---|
| US_ASCII | [Charset](#charset) | Completed | |
| UTF_8 | [Charset](#charset) | Completed | |
---
## [DigestAlgorithm](https://developers.google.com/apps-script/reference/utilities/digest-algorithm)
An enum representing the digest algorithms supported by this service.

100% completed

| method | return | status | comments |
|---|---|---|---|
| MD2 | [DigestAlgorithm](#digestalgorithm) | Completed | |
| MD5 | [DigestAlgorithm](#digestalgorithm) | Completed | |
| SHA_1 | [DigestAlgorithm](#digestalgorithm) | Completed | |
| SHA_256 | [DigestAlgorithm](#digestalgorithm) | Completed | |
| SHA_384 | [DigestAlgorithm](#digestalgorithm) | Completed | |
| SHA_512 | [DigestAlgorithm](#digestalgorithm) | Completed | |
---
## [MacAlgorithm](https://developers.google.com/apps-script/reference/utilities/mac-algorithm)
An enum representing the MAC algorithms supported by this service.

100% completed

| method | return | status | comments |
|---|---|---|---|
| HMAC_MD5 | [MacAlgorithm](#macalgorithm) | Completed | |
| HMAC_SHA_1 | [MacAlgorithm](#macalgorithm) | Completed | |
| HMAC_SHA_256 | [MacAlgorithm](#macalgorithm) | Completed | |
| HMAC_SHA_512 | [MacAlgorithm](#macalgorithm) | Completed | |
---
## [RsaAlgorithm](https://developers.google.com/apps-script/reference/utilities/rsa-algorithm)
An enum representing the RSA algorithms supported by this service.

100% completed

| method | return | status | comments |
|---|---|---|---|
| RSA_SHA_1 | [RsaAlgorithm](#rsaalgorithm) | Completed | |
| RSA_SHA_256 | [RsaAlgorithm](#rsaalgorithm) | Completed | |
---
## [Utilities](https://developers.google.com/apps-script/reference/utilities/utilities)
A collection of utility methods.

29% completed

| method | return | status | comments |
|---|---|---|---|
| [base64Decode(encoded)](https://developers.google.com/apps-script/reference/utilities/utilities#base64Decode(String)) | Byte[] | Completed | |
| [base64Decode(encoded, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64Decode(String,Charset)) | String | Not Started | |
| [base64DecodeWebSafe(encoded)](https://developers.google.com/apps-script/reference/utilities/utilities#base64DecodeWebSafe(String)) | Byte[] | Not Started | |
| [base64Encode(data)](https://developers.google.com/apps-script/reference/utilities/utilities#base64Encode(Byte[])) | String | Completed | |
| [base64Encode(data, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#base64Encode(String,Charset)) | String | Not Started | |
| [base64EncodeWebSafe(data)](https://developers.google.com/apps-script/reference/utilities/utilities#base64EncodeWebSafe(Byte[])) | String | Not Started | |
| [computeDigest(algorithm, value)](https://developers.google.com/apps-script/reference/utilities/utilities#computeDigest(DigestAlgorithm,Byte[])) | Byte[] | Completed | |
| [computeDigest(algorithm, value, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeDigest(DigestAlgorithm,String,Charset)) | Byte[] | Not Started | |
| [computeHmacSha256Signature(value, key)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSha256Signature(String,String)) | Byte[] | Not Started | |
| [computeHmacSha256Signature(value, key, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSha256Signature(String,String,Charset)) | Byte[] | Not Started | |
| [computeHmacSignature(algorithm, value, key)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSignature(MacAlgorithm,Byte[],Byte[])) | Byte[] | Completed | |
| [computeHmacSignature(algorithm, value, key, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSignature(MacAlgorithm,String,String,Charset)) | Byte[] | Not Started | |
| [computeRsaSha256Signature(value, key)](https://developers.google.com/apps-script/reference/utilities/utilities#computeRsaSha256Signature(String,String)) | Byte[] | Completed | |
| [computeRsaSha256Signature(value, key, charset)](https://developers.google.com/apps-script/reference/utilities/utilities#computeRsaSha256Signature(String,String,Charset)) | Byte[] | Not Started | |
| [exponentialBackoff(func)](https://developers.google.com/apps-script/reference/utilities/utilities#exponentialBackoff(Function)) | Object | Not Started | |
| [formatDate(date, timeZone, format)](https://developers.google.com/apps-script/reference/utilities/utilities#formatDate(Date,String,String)) | String | Not Started | |
| [formatString(format, args)](https://developers.google.com/apps-script/reference/utilities/utilities#formatString(String,Object...)) | String | Not Started | |
| [getUuid()](https://developers.google.com/apps-script/reference/utilities/utilities#getUuid()) | String | Completed | |
| [gzip(blob)](https://developers.google.com/apps-script/reference/utilities/utilities#gzip(BlobSource)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [jsonParse(jsonString)](https://developers.google.com/apps-script/reference/utilities/utilities#jsonParse(String)) | Object | Completed | |
| [jsonStringify(obj)](https://developers.google.com/apps-script/reference/utilities/utilities#jsonStringify(Object)) | String | Completed | |
| [newBlob(data)](https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(Byte[])) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [newBlob(data, contentType)](https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(String,String)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [newBlob(data, contentType, name)](https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(String,String,String)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [parseCsv(csv)](https://developers.google.com/apps-script/reference/utilities/utilities#parseCsv(String)) | String[][] | Not Started | |
| [parseCsv(csv, delimiter)](https://developers.google.com/apps-script/reference/utilities/utilities#parseCsv(String,Char)) | String[][] | Not Started | |
| [sleep(milliseconds)](https://developers.google.com/apps-script/reference/utilities/utilities#sleep(Integer)) | void | Completed | |
| [ungzip(blob)](https://developers.google.com/apps-script/reference/utilities/utilities#ungzip(BlobSource)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [unzip(blob)](https://developers.google.com/apps-script/reference/utilities/utilities#unzip(BlobSource)) | [Blob[]](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [zip(blobs)](https://developers.google.com/apps-script/reference/utilities/utilities#zip(BlobSource[])) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |
| [zip(blobs, name)](https://developers.google.com/apps-script/reference/utilities/utilities#zip(BlobSource[],String)) | [Blob](https://developers.google.com/apps-script/reference/base/blob) | Not Started | |