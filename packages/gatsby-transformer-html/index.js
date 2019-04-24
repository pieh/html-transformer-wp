// no-op
exports.HTMLFieldFromString = {
  type: `HTML`,
  resolve: (source, fieldArgs, context, info) => {
    const htmlString = source[info.fieldName]
    return {
      id: `phantom-from-opera`,
      parent: null,
      children: [],
      internal: {
        content: htmlString,
        // this is not really used - but HTML implements Node for
        // traditional transformer flows (i.e. for transforming html files)
        contentDigest: `foobar`,
        type: `HTML`,
      },
    }
  },
}
