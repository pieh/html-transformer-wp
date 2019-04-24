module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        baseUrl: "localhost:7000",
        useACF: true,
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
