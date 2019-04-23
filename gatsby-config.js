module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        baseUrl: "localhost:7000",
        useACF: true,
      }
    }
  ]
}