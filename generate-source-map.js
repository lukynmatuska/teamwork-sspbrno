const generate = require('generate-source-map')
const fs = require('fs')
const pathToFile = process.env.pathToFile || 'static/admin/assets/vendor/bootstrap/dist/js/bootstrap.bundle.min.js'
let file = {
  source: fs.readFileSync(pathToFile),
  sourceFile: pathToFile.split('/')[(pathToFile.split('/').length - 1)]
}
let map = generate(file)
fs.writeFile(`${pathToFile}.map`, map.toString(), 'utf-8', (err, data) => {
  if (err) {
    return console.error(err)
  }
  console.log('Successfully wrote a file.')
})
