const fs = require('fs')
const path = require('path')
require('dotenv').config()

walk(process.env.MAIN_DIRECTORY)
  .then(results => {
    results.forEach(file => {
      let supportedExtensions = JSON.parse(process.env.SUPPORTED_EXTENSIONS)
      let matchedExtensions = supportedExtensions.filter(extension => (file.length - extension.length) === file.lastIndexOf(extension))
      if (matchedExtensions.length) {
        fs.readFile(file, 'utf8', function (err, data) {
          if (err) {
            return console.log(err);
          }
          let result = data.replace(new RegExp(process.env.MATCHING_WORD, "g"), process.env.REPLACEMENT_WORD)

          fs.writeFile(file, result, 'utf8', function (err) {
            if (err) return console.log(err);
          })
        })
      }
    })
  })

function walk(dir) {
  return new Promise(((resolve, reject) => {
    let results = []
    fs.readdir(dir, function (err, files) {
      if (err) {
        return reject(err)
      }
      files.forEach((file, index) => {
        file = path.resolve(dir, file)
        fs.stat(file, (err, stat) => {
          if (stat && stat.isDirectory()) {
            return walk(file)
              .then(innerFiles => {
                results = results.concat(innerFiles)
                if (files.length === index+1) {
                  return resolve(results)
                }
              })
          } else {
            results.push(file)
            if (files.length === index+1) {
              return resolve(results)
            }
          }
        })
      })
    })
  }))
}
