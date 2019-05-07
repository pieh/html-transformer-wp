module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-graphql`,
      options: {
        // This type will contain remote schema Query type
        typeName: `WPGraphQL`,
        // This is field under which it's accessible
        fieldName: `wpgraphql`,
        // Url to query from
        url: `https://demo.wpgraphql.com/graphql`,
      },
    },

    {
      resolve: `gatsby-transformer-html`,
      options: {
        plugins: [
          {
            resolve: `gatsby-html-images`,
            options: {
              maxWidth: 950,
            },
          },
        ],
      },
    },
    `gatsby-plugin-sharp`,
  ],
}
