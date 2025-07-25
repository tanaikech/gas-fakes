import '../../main.js';


// put all this stuff in a temp folder for easy deletion
const doc = DocumentApp.openById("1uGBfWSm_v_Ur-thjven12B-1Z7z8zFSykHYSt81l8sc")

const body = doc.getBody()

console.log (body.getNumChildren())
const child = body.getChild(10)
const childIndex = body.getChildIndex(child)
const child2 = body.getChild(childIndex)
console.log (childIndex,body.getChildIndex(child2)===body.getChildIndex(child)===10)
const parent = child.getParent()


