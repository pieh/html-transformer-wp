const unified = require("unified")
const parse = require("rehype-parse")
const visit = require(`unist-util-visit`)
const astToHtml = require(`hast-util-to-html`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)

const wrapBodyInRoot = ast => {
  // we have html AST, but there is some things to clean up, because it added `body` element
  // and this should be partial html, so when we visit this AST we make sure to find body and replace
  // it with `div` that will serve as top level node
  let resultAst = ast

  visit(ast, `element`, astNode => {
    if (astNode.tagName === "body") {
      resultAst = {
        type: `root`,
        children: astNode.children,
      }
    }
  })

  return resultAst
}

exports.sourceNodes = (
  { actions, schema, loadNodeContent, getCache, ...rest },
  pluginOptions
) => {
  actions.createTypes(
    schema.buildObjectType({
      name: `HTML`,
      interfaces: ["Node"],
      fields: {
        html: {
          type: `String`,
          resolve: async (source, fieldArgs, context, info) => {
            const content = await loadNodeContent(source)

            /**
             * HTML AST
             */
            const hast = unified()
              .use(parse)
              .parse(content)

            // use hast subplugins here
            await Promise.each(pluginOptions.plugins, plugin => {
              const requiredPlugin = require(plugin.resolve)
              if (_.isFunction(requiredPlugin.transformAst)) {
                return requiredPlugin.transformAst(
                  {
                    hast,
                    actions,
                    cache: getCache(plugin.name),
                    ...rest,
                  },
                  plugin.pluginOptions
                )
              } else {
                return Promise.resolve()
              }
            })

            // extract body and wrap it into root element
            const bodyHast = wrapBodyInRoot(hast)

            return astToHtml(bodyHast, {
              allowDangerousHTML: true,
            })
          },
        },
      },
    })
  )
}
