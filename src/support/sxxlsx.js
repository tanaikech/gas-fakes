// import got from "got";
// import ExcelJS from "exceljs";

// async function __getWorkbook(url) {
//   const res = await got(url, { responseType: "buffer" });
//   let buf;
//   if (res.rawBody && Buffer.isBuffer(res.rawBody)) {
//     buf = res.rawBody;
//   } else if (res.body && Buffer.isBuffer(res.body)) {
//     buf = res.body;
//   } else {
//     throw new Error(res);
//   }
//   const workbook = new ExcelJS.Workbook();
//   await workbook.xlsx.load(buf);
//   return workbook;
// }

// export const sxGetImagesFromXlsx = async (_, { url, idx }) => {
//   const workbook = await __getWorkbook(url);
//   const worksheet = workbook.worksheets[idx];
//   const ar = worksheet.getImages().reduce((arr, image) => {
//     const imageId = image.imageId;
//     if (image.range.tl.nativeColOff != 0 && image.range.tl.nativeRowOff != 0) {
//       const col = image.range.tl.nativeCol;
//       const row = image.range.tl.nativeRow;
//       const { width, height } = image.range.ext;
//       arr.push({
//         imageId,
//         row,
//         col,
//         width,
//         height,
//         anchorCellXOffset: image.range.tl.nativeColOff,
//         anchorCellYOffset: image.range.tl.nativeRowOff,
//       });
//     }
//     return arr;
//   }, []);
//   return ar;
// };
