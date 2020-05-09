const generate = require('generate-source-map')
const fs = require('fs')

var file = {
  source: fs.readFileSync('static/js/popper.min.js'),
  sourceFile: 'popper.min.js'
}

var map = generate(file)

// console.log(map.toString())
fs.writeFile('static/js/popper.min.js.map', map.toString(), 'utf-8', (err, data) => {
  if (err) {
    return console.error(err)
  }
  console.log(data)
})
