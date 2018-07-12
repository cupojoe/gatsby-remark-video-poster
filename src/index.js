const select = require(`unist-util-select`)
const path = require(`path`)
const isRelativeUrl = require(`is-relative-url`)
const _ = require(`lodash`)
const { queueImageResizing } = require(`gatsby-plugin-sharp`)
const Promise = require(`bluebird`)
const cheerio = require(`cheerio`)
const slash = require(`slash`)

// If the poster is relative (not hosted elsewhere)
// 1. Find the image file
// 2. Create an optimized image
// TODO: Return a replacement for the video tag with inline css for the aspect ratio of the video based on the poster aspect ratio
module.exports = (
  { files, markdownNode, markdownAST, pathPrefix, getNode, reporter },
  pluginOptions
) => {
  const defaults = {
    width: 1920,
    pathPrefix,
  }

  const options = _.defaults(pluginOptions, defaults)

  // Takes a node and generates the optimized image and then returns the path to it
  const generateImage = async function(node, resolve) {
    // Check if this markdownNode has a File parent. This plugin
    // won't work if the image isn't hosted locally.
    const parentNode = getNode(markdownNode.parent)
    let imagePath
    if (parentNode && parentNode.dir) {
      imagePath = slash(path.join(parentNode.dir, node.url))
    } else {
      return null
    }

    const imageNode = _.find(files, file => {
      if (file && file.absolutePath) {
        return file.absolutePath === imagePath
      }
      return null
    })

    if (!imageNode || !imageNode.absolutePath) {
      return resolve()
    }

    let processedImage = await queueImageResizing({
      file: imageNode,
      args: options,
      reporter,
    })

    if (!processedImage) {
      return resolve()
    }

    return processedImage.src
  }

  const rawHtmlNodes = select(markdownAST, `html`)
  Promise.all(
    rawHtmlNodes.map(node => {
      return new Promise(async (resolve, reject) => {
        const $ = cheerio.load(node.value)
        const posterNode = $('[poster]')
        const posterAttr = posterNode.attr('poster')
        if (typeof posterAttr !== 'undefined') {
          const generatedUrl = await generateImage({ url: posterAttr }, resolve)
          if (generatedUrl) {
            node.value = node.value.replace(
              new RegExp(posterAttr, `g`),
              generatedUrl
            )
            resolve(node)
          } else {
            resolve()
          }
        }
      })
    })
  )
}
