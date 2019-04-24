const { fluid } = require(`gatsby-plugin-sharp`)
const _ = require(`lodash`)
const visit = require(`unist-util-visit`)
const queryString = require(`query-string`)
const path = require(`path`)

const {
  imageClass,
  imageBackgroundClass,
  imageWrapperClass,
} = require(`./constants`)

const getImageInfo = uri => {
  const { url, query } = queryString.parseUrl(uri)
  return {
    ext: path
      .extname(url)
      .split(`.`)
      .pop(),
    url,
    query,
  }
}

exports.transformAst = async (
  { hast, getNode, getNodes, reporter, cache },
  pluginOptions
) => {
  const promises = []

  const mediaNodes = getNodes().filter(
    node => node.internal.type === `wordpress__wp_media`
  )

  visit(hast, `element`, astNode => {
    if (astNode.tagName === "img") {
      let mediaNode = null
      // hacky - use fact that wordpress uses `wp-image-${ID}` classes for inline images
      astNode.properties.className.some(c => {
        if (c.indexOf("wp-image-") === 0) {
          mediaNode = mediaNodes.find(
            // intentionall == because string vs number and wordpress ¯\_(ツ)_/¯
            node => node.wordpress_id == c.replace("wp-image-", "")
          )
        }
      })

      // try to find by src if search by class didn't work
      if (!mediaNode && astNode.properties.src) {
        mediaNode = mediaNodes.find(
          node => node.source_url == astNode.properties.src
        )
      }

      // if we found media node for that image
      if (mediaNode) {
        // make sure we add dependency on that media node for current query
        const file = getNode(
          mediaNode.localFile___NODE
          // context.path
        )

        const defaults = {
          maxWidth: 650,
          wrapperStyle: ``,
          backgroundColor: `white`,
          linkImagesToOriginal: true,
          showCaptions: false,
        }
        const options = _.defaults(pluginOptions, defaults)

        promises.push(
          fluid({
            file,
            args: options,
            reporter,
            cache,
          }).then(fluidResult => {
            // mostly copy-pasta from gatsby-remark-images at this point
            // would be nice to abstract this part to utility library (maybe
            // just helper from gatsby-plugin-sharp)
            const originalImg = fluidResult.originalImg
            const fallbackSrc = fluidResult.src
            const srcSet = fluidResult.srcSet
            const presentationWidth = fluidResult.presentationWidth

            // Generate default alt tag
            const srcSplit = getImageInfo(astNode.properties.src).url.split(`/`)
            const fileName = srcSplit[srcSplit.length - 1]
            const fileNameNoExt = fileName.replace(/\.[^/.]+$/, ``)
            const defaultAlt = fileNameNoExt.replace(/[^A-Z0-9]/gi, ` `)

            const alt = astNode.properties.alt
              ? astNode.properties.alt
              : defaultAlt

            const imageStyle = `
              width: 100%;
              height: 100%;
              margin: 0;
              vertical-align: middle;
              position: absolute;
              top: 0;
              left: 0;
              box-shadow: inset 0px 0px 0px 400px ${
                options.backgroundColor
              };`.replace(/\s*(\S+:)\s*/g, `$1`)

            // Create our base image tag
            let imageTag = `
              <img
                class="${imageClass}"
                style="${imageStyle}"
                alt="${alt}"
                src="${fallbackSrc}"
                srcset="${srcSet}"
                sizes="${fluidResult.sizes}"
              />
            `.trim()

            let placeholderImageData = fluidResult.base64
            const ratio = `${(1 / fluidResult.aspectRatio) * 100}%`

            const wrapperStyle =
              typeof options.wrapperStyle === `function`
                ? options.wrapperStyle(fluidResult)
                : options.wrapperStyle

            let rawHTML = `
              <span
                class="${imageWrapperClass}"
                style="position: relative; display: block; margin-left: auto; margin-right: auto; ${wrapperStyle} max-width: ${presentationWidth}px;"
              >
                <span
                  class="${imageBackgroundClass}"
                  style="padding-bottom: ${ratio}; position: relative; bottom: 0; left: 0; background-image: url('${placeholderImageData}'); background-size: cover; display: block;"
                ></span>
                ${imageTag}
              </span>
              `.trim()

            astNode.type = `raw`
            astNode.value = rawHTML
          })
        )
      }
      return null
    }
  })

  await Promise.all(promises)
}
