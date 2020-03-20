[![npm version](https://badge.fury.io/js/podparse.svg)](https://badge.fury.io/js/podparse)
[![Build Status](https://travis-ci.com/jbierfeldt/podcast-feed-parser.svg?branch=master)](https://travis-ci.com/jbierfeldt/podcast-feed-parser)

[![NPM](https://nodei.co/npm/podparse.png)](https://nodei.co/npm/podparse.png)

# Table of Contents

   * [podparse](#podparse)
      * [Installation](#installation)
      * [Overview](#overview)
      * [Quickstart](#quickstart)
      * [Default](#default)

# podparse

A simple package for parsing podcast feeds into manageable JavaScript objects. For use with Node and in the browser. Based on [jbierfeldt/podcast-feed-parser](https://github.com/jbierfeldt/podcast-feed-parser/).

## Installation

```
npm install podparse
```

See [podparse on npm](https://www.npmjs.com/package/podparse).

## Differences from jbierfeldt/podcast-feed-parser

This package:

* Does not contain the `isomorphic-fetch` dependency.
* Is designed to be easier to use, albeit less configurable.
* Removes empty (`null`, `undefined`, `''`, `NaN`, `{}`) from the output.
* Does not use hard-coded namespace prefixes (esp. `itunes`, `googleplay`, and `atom`).

## Overview
By default, `podcast-feed-parser` will parse a podcast's xml feed and return an object with the following properties. `meta` contains all of the information pertinent to the podcast show itself, and `episodes` is list of episode objects which contain the information pertinent to each individual episode of the podcast.

```js
{
    meta: {
      title: 'My podcast',
      description: 'A podcast about whatever',
      // ...
    },
    episodes: [
      {
        title: 'My Episode 1',
        description: 'Episode 1',
        pubDate: '2018-11-29T10:30:00.000Z',
        // ...
      }, {
        title: 'My Episode 2',
        description: 'Episode 2',
        pubDate: '2018-11-28T10:30:00.000Z',
        // ...
      }
    ]
  }
}
```

## Quickstart

`podcast-feed-parser` has one main functions: `getPodcastFromFeed`.

For parsing a podcast from an feed xml, use `getPodcastFromFeed`:

```js
const podcastFeedParser = require("podcast-feed-parser")
const fs = require('fs')

// if you already have the feed xml, you can parse
// synchronously with getPodcastFromFeed
const podcastFeed = fs.readFileSync('path/to/podcast-feed.xml', 'utf8')
const podcast = podcastFeedParser.getPodcastFromFeed(podcastFeed)

console.log(podcast.meta.title)
// "My Podcast"

podcast.episodes.forEach( (episode) => {
	console.log(episode.title)
})
// "My Episode 1"
// "My Episode 2"
```

## Default

By default, `podcast-feed-parser` will parse a feed for the following default fields, based on [this standard](https://github.com/simplepie/simplepie-ng/wiki/Spec:-iTunes-Podcast-RSS). If a field is not found in a feed, it will quietly return `undefined`.

```js
{
    meta: {
        title: '',
        description: '',
        subtitle: '',
        image: {
          url: '',
          title: '',
          link: '',
          width: 0,
          height: 0
        },
        lastUpdated: '',
        link: '',
        language: '',
        editor: '',
        author: '',
        summary: '',
        categories: [],
        owner: {
          name: '',
          email: ''
        },
        ttl: 0,
        explicit: true,
        complete: true,
        blocked: true
    },
    episodes: [
      {
        title: '',
        description: '',
        imageURL: '',
        pubDate: '',
        link: '',
        guid: '',
        language: '',
        enclosure: {
          length: '0',
          type: '',
          url: ''
        },
        duration: 0,
        summary: '',
        blocked: true,
        explicit: true,
        order: 1
      }
  ]
}
```
