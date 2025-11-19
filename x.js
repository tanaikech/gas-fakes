function foc() {
  const form = FormApp.openById ("131186LbIUyL8coyaqvIf73reoR8I4aAOgPjrruGpTqs")
  const id = form.getId()
  console.log (form.getTitle())   
  const file = DriveApp.getFileById (id)
  console.log (file.getName())  

  // these work 
  form.setTitle ('a new title x')
  form.setDescription ('a new description x')
  // set the name using drive after setting the tile
  file.setName('a new name x')
}
foc()
