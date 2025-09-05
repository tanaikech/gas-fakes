# Utilities Service Progress

## **Documentation:** [Utilities Service](https://developers.google.com/apps-script/reference/utilities) - 65% completed

## [Utilities](https://developers.google.com/apps-script/reference/utilities/utilities)

Provides a collection of miscellaneous tools.
65% completed

| method                                                                                                                                          | return          | status      | comments |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------- | -------- |
| [base64Decode(encoded)](https://developers.google.com/apps-script/reference/utilities/utilities#base64decodeencoded)                            | Byte[]          | Completed   |          |
| [base64DecodeWebSafe(encoded)](https://developers.google.com/apps-script/reference/utilities/utilities#base64decodewebsafeencoded)              | Byte[]          | Completed   |          |
| [base64Encode(data)](https://developers.google.com/apps-script/reference/utilities/utilities#base64encodedata)                                  | String          | Completed   |          |
| [base64EncodeWebSafe(data)](https://developers.google.com/apps-script/reference/utilities/utilities#base64encodewebsafedata)                    | String          | Completed   |          |
| [computeDigest(algorithm, value)](https://developers.google.com/apps-script/reference/utilities/utilities#computedigestalgorithm,-value)        | Byte[]          | Completed   |          |
| [computeHmacSha256Signature(value, key)](https://developers.google.com/apps-script/reference/utilities/utilities#computeshasignaturevalue,-key) | Byte[]          | Completed   |          |
| [formatDate(date, timeZone, format)](https://developers.google.com/apps-script/reference/utilities/utilities#formatdatedate,-timezone,-format)  | String          | Not Started |          |
| [formatString(template, args)](https://developers.google.com/apps-script/reference/utilities/utilities#formatstringtemplate,-args)              | String          | Not Started |          |
| [getUuid()](https://developers.google.com/apps-script/reference/utilities/utilities#getuuid)                                                    | String          | Completed   |          |
| [gzip(blob)](<https://developers.google.com/apps-script/reference/utilities/utilities#gzip(BlobSource)>)                                        | [Blob](#blob)   | Completed   |          |
| [newBlob(data)](https://developers.google.com/apps-script/reference/utilities/utilities#newblobdata)                                            | [Blob](#blob)   | Completed   |          |
| [parseCsv(csv)](https://developers.google.com/apps-script/reference/utilities/utilities#parsecsvcsv)                                            | String[][]      | Not Started |          |
| [sleep(milliseconds)](https://developers.google.com/apps-script/reference/utilities/utilities#sleepmilliseconds)                                | void            | Completed   |          |
| [ungzip(blob)](<https://developers.google.com/apps-script/reference/utilities/utilities#ungzip(BlobSource)>)                                    | [Blob](#blob)   | Completed   |          |
| [unzip(blob)](<https://developers.google.com/apps-script/reference/utilities/utilities#unzip(BlobSource)>)                                      | [Blob[]](#blob) | Completed   |          |
| [zip(blobs)](<https://developers.google.com/apps-script/reference/utilities/utilities#zip(BlobSource)>)                                         | [Blob](#blob)   | Completed   |          |

---

## [Blob](https://developers.google.com/apps-script/reference/utilities/blob)

Represents a data interchange object.
100% completed

| method                                                                                                                          | return        | status    | comments |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- | -------- |
| [copyBlob()](https://developers.google.com/apps-script/reference/utilities/blob#copyblob)                                       | [Blob](#blob) | Completed |          |
| [getBytes()](https://developers.google.com/apps-script/reference/utilities/blob#getbytes)                                       | Byte[]        | Completed |          |
| [getContentType()](https://developers.google.com/apps-script/reference/utilities/blob#getcontenttype)                           | String        | Completed |          |
| [getDataAsString()](https://developers.google.com/apps-script/reference/utilities/blob#getdataasstring)                         | String        | Completed |          |
| [getName()](https://developers.google.com/apps-script/reference/utilities/blob#getname)                                         | String        | Completed |          |
| [isGoogleType()](https://developers.google.com/apps-script/reference/utilities/blob#isgoogletype)                               | Boolean       | Completed |          |
| [setBytes(data)](https://developers.google.com/apps-script/reference/utilities/blob#setbytesdata)                               | [Blob](#blob) | Completed |          |
| [setContentType(contentType)](https://developers.google.com/apps-script/reference/utilities/blob#setcontenttypecontenttype)     | [Blob](#blob) | Completed |          |
| [setContentTypeFromExtension()](https://developers.google.com/apps-script/reference/utilities/blob#setcontenttypefromextension) | [Blob](#blob) | Completed |          |
| [setDataFromString(string)](https://developers.google.com/apps-script/reference/utilities/blob#setdatafromstringstring)         | [Blob](#blob) | Completed |          |
| [setName(name)](https://developers.google.com/apps-script/reference/utilities/blob#setnamename)                                 | [Blob](#blob) | Completed |          |

---

## Enums

| Enum                                                                                              | Status      |
| ------------------------------------------------------------------------------------------------- | ----------- |
| [Charset](https://developers.google.com/apps-script/reference/utilities/charset)                  | Completed   |
| [DigestAlgorithm](https://developers.google.com/apps-script/reference/utilities/digest-algorithm) | Completed   |
| [MacAlgorithm](https://developers.google.com/apps-script/reference/utilities/mac-algorithm)       | Not Started |
| [RsaAlgorithm](https://developers.google.com/apps-script/reference/utilities/rsa-algorithm)       | Not Started |
