const generate = require('generate-source-map')
const fs = require('fs')

const pathToFile = 'static/admin/assets/js/plugins/bootstrap/dist/js/bootstrap.bundle.min.js'

var file = {
  source: fs.readFileSync(pathToFile),
  sourceFile: pathToFile.split('/')[(pathToFile.split('/').length-1)]
}

var map = generate(file)

// console.log(map.toString())
fs.writeFile(`${pathToFile}.map`, map.toString(), 'utf-8', (err, data) => {
  if (err) {
    return console.error(err)
  }
  console.log(data)
})
