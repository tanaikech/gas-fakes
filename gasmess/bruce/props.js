import '@mcpher/gas-fakes'

const t = () => {
  const props = PropertiesService.getScriptProperties()   
  props.setProperty('test', 'test')
  props.setProperty('test2', 'test2')

  
  console.log (props.getProperties())

  props.deleteProperty('test')
  console.log (props.getProperties())

  props.deleteAllProperties()
  console.log (props.getProperties())

  props.setProperties({
    test: 'test',
    test2: 'test2'
  })
  console.log (props.getProperties())
}
t()