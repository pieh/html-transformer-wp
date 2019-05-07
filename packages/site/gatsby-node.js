const { HTMLFieldFromString } = require(`gatsby-transformer-html`)

exports.sourceNodes = ({ actions, schema }) => {
  actions.createTypes(
    schema.buildObjectType({
      name: `wordpress__PAGE`,
      interfaces: ["Node"],
      fields: {
        content: HTMLFieldFromString,
      },
    })
  )
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    WPGraphQL_Post: {
      content2: HTMLFieldFromString,
    },
  })
}
