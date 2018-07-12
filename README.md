# gatsby-remark-video-poster

Finds video tags with poster attributes and processes the image linked.

## Install

`npm install --save gatsby-remark-video-poster gatsby-plugin-sharp`

## How to use

### Using default config

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-plugin-sharp`,
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        `gatsby-remark-video-poster`,
      ],
    },
  },
]
```

### Specifying the config options

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-plugin-sharp`,
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-video-poster`,
          options: {
            // Size of the poster in pixels
            // By default width is 1920px (HD video width)
            // If your container is smaller, you should specify a smaller size
            width: 720,
          },
        },
      ],
    },
  },
]
```

## Acknowledgments

This plugin is heavily inspired by `gatsby-remark-image` and it takes from it in the way it processes the nodes and the images. Thank you to @KyleAMathews for the inspiration and the guidance.
