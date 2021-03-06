let activeEnv = process.env.ACTIVE_ENV || process.env.NODE_ENV || 'development'

console.log(`Using environment config: '${activeEnv}'`)

module.exports = {
  siteMetadata: {
    title: `Badger Wallet`,
    description: `Badger Wallet is your gateway to Bitcoin Cash distributed apps, your identity vault, Simple Ledger and Wormhole tokens`,
    siteUrl: `${
      activeEnv === 'production'
        ? 'https://badger.bitcoin.com'
        : 'https://badger.btctest.net'
    }`,
  },
  plugins: [
    `gatsby-plugin-flow`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-google-tagmanager`,
      options: {
        id: 'GTM-5N6TL56',
        includeInDevelopment: false,
        // Specify optional GTM environment details.
        // gtmAuth: "YOUR_GOOGLE_TAGMANAGER_ENVIROMENT_AUTH_STRING",
        // gtmPreview: "YOUR_GOOGLE_TAGMANAGER_ENVIROMENT_PREVIEW_NAME",
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'developer-bitcoin-com',
        short_name: 'badger.bitcoin.com',
        start_url: '/',
        background_color: '#FFFFFF',
        theme_color: '#fab915',
        display: 'minimal-ui',
        icon: 'src/images/favicon.png', // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-robots-txt`,
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-remove-serviceworker`,
  ],
}
