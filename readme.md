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

A simple package for parsing podcast feeds into manageable JavaScript objects. For use with Node and in the browser. Originally based on [jbierfeldt/podcast-feed-parser](https://github.com/jbierfeldt/podcast-feed-parser/).

## Installation

```
npm install podparse
```

See [podparse on npm](https://www.npmjs.com/package/podparse).

## Differences from jbierfeldt/podcast-feed-parser

This package:

* Does not contain the [`isomorphic-fetch`](https://github.com/matthew-andrews/isomorphic-fetch) dependency.
* Replaces [`xml2js`](https://github.com/Leonidas-from-XIV/node-xml2js) with smaller and less memory-intensive [`@rgrove/parse-xml`](https://github.com/rgrove/parse-xml).
* Is designed to be easier to use, albeit less configurable.
* Removes empty (`null`, `undefined`, `''`, `NaN`, `{}`) from the output.
* Does not use hard-coded namespace prefixes (esp. `itunes`, `googleplay`, and `atom`).

## Supported Namespaces

* iTunes (`http://www.itunes.com/dtds/podcast-1.0.dtd`)
* Google Podcasts (`http://www.google.com/schemas/play-podcasts/1.0`)
* Atom Links (`http://www.w3.org/2005/Atom`)
* Media RSS (`http://www.rssboard.org/media-rss`)
* Yahoo Media (`http://search.yahoo.com/mrss/`)
* Spotify (`https://www.spotify.com/ns/rss`)
* PodLove (`https://podlove.org/simple-chapters/`)

## Overview

By default, `podparse` will parse a podcast's xml feed and return an object with the following properties. `meta` contains all of the information pertinent to the podcast show itself, and `episodes` is list of episode objects which contain the information pertinent to each individual episode of the podcast.

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

`podparse` has one function: `getPodcastFromFeed`:

```js
const getPodcastFromFeed = require("podparse")
const fs = require('fs')

const podcastFeed = fs.readFileSync('path/to/podcast-feed.xml', 'utf8')
const podcast = getPodcastFromFeed(podcastFeed)

console.log(podcast.meta.title)
// "My Podcast"

podcast.episodes.forEach( (episode) => {
	console.log(episode.title)
})
// "My Episode 1"
// "My Episode 2"
```

## Options

`podparse` currently supports the following options:

* `includeEpisodes` (default: `true`)
  * Whether to parse `<item>` elements for each episode.

Options are passed as an object to the `getPodcastFromFeed` function, for example:

```js
const podcastWithoutEpisodes = getPodcastFromFeed(podcastFeed, {
  includeEpisodes: false
});
```

## Real-world example

`podparse` will parse a feed for values based on [this standard](https://github.com/simplepie/simplepie-ng/wiki/Spec:-iTunes-Podcast-RSS). If a field is not found in a feed, it will not be included. Here is a sample output for [Planet Money](https://www.npr.org/planetmoney):

```js
{
  meta: {
    title: 'Planet Money',
    description: `The economy explained. Imagine you could call up a friend and say, "Meet me at the bar and tell me what's going on with the economy." Now imagine that's actually a fun evening.`,
    language: 'en',
    author: 'NPR',
    summary: `The economy explained. Imagine you could call up a friend and say, "Meet me at the bar and tell me what's going on with the economy." Now imagine that's actually a fun evening.`,
    type: 'episodic',
    generator: 'NPR API RSS Generator 0.94',
    category: [ 'Business', 'News' ],
    owner: { name: 'NPR', email: 'podcasts@npr.org' },
    image: {
      url: 'https://media.npr.org/assets/img/2018/08/02/npr_planetmoney_podcasttile_sq-7b7fab0b52fd72826936c3dbe51cff94889797a0.jpg?s=1400'
    },
    lastBuildDate: '2020-03-16T21:50:01.000Z',
    pubDate: '1970-01-01T00:00:00.000Z',
    link: 'https://www.npr.org/planetmoney',
    links: []
  },
  episodes: [
    {
      title: '#980: The Fed Fights The Virus',
      description: 'The central bank is trying to prevent a health crisis from becoming a financial crisis. | Subscribe to our weekly newsletter <a href="https://www.npr.org/newsletter/money?utm_source=rss_feed_copy&utm_medium=podcast&utm_term=planet_money">here</a>.',
      subtitle: 'The Federal Reserve usually has one main job: setting interest rates. But in emergencies, another Fed job becomes more important: trying to prevent a financial crisis.',
      author: 'NPR',
      summary: 'The Federal Reserve usually has one main job: setting interest rates. But in emergencies, another Fed job becomes more important: trying to prevent a financial crisis.',
      episodeType: 'full',
      guid: '5b88529b-fed8-4562-8312-61e4b24b0451',
      image: {
        url: 'https://media.npr.org/assets/img/2020/03/16/gettyimages-1204924943-594x594_wide-60e13736df6bfcb9135f158ec2873956f134aef4.jpg?s=1400'
      },
      explicit: false,
      duration: 1097,
      enclosure: {
        url: 'https://play.podtrac.com/npr-510289/edge1.pod.npr.org/anon.npr-podcasts/podcast/npr/pmoney/2020/03/20200316_pmoney_pmpod980-e086b0be-e27c-44eb-a088-d76e3104fb20.mp3?awCollectionId=510289&amp;awEpisodeId=816684372&amp;orgId=1&amp;topicId=1017&amp;aggIds=812054919&amp;d=1097&amp;p=510289&amp;story=816684372&amp;t=podcast&amp;e=816684372&amp;size=17556408&amp;ft=pod&amp;f=510289',
        length: 17556408,
        type: 'audio/mpeg'
      },
      lastBuildDate: '1970-01-01T00:00:00.000Z',
      pubDate: '2020-03-16T21:50:01.000Z',
      link: 'https://www.npr.org/2020/03/16/816684372/episode-980-the-fed-fights-the-virus'
    },
    // ... 255 more items
  ],
}
```
