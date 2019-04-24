import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => (
  <div style={{ maxWidth: 950, margin: `0 auto` }}>
    <h1>{data.wordpressPage.title}</h1>
    <div
      dangerouslySetInnerHTML={{ __html: data.wordpressPage.content.html }}
    />
  </div>
)

export const query = graphql`
  {
    wordpressPage(title: { eq: "Just testing gatsby-transformer-html" }) {
      title
      content {
        html
      }
    }
  }
`
