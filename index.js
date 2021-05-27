const parseXml = require('@rgrove/parse-xml');

// === Utilities ===

const SERIAL = 'serial';

// Five predefined XML entities supported by parse-xml,
// see: https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references#Predefined_entities_in_XML
// Additional entities determined empirically.
const entityMap = new Map([
  ['&nbsp;', ' '],
  ['&acirc;', 'Â'],
  ['&mdash;', '—'],
  ['&ndash;', '–'],
  ['&hyphen;', '‐'],
  ['&dash;', '‐'],
  ['&hellip;', '…'],
  ['&ldquo;', '“'],
  ['&rdquo;', '”'],
  ['&lsaquo;', '‹'],
  ['&rsaquo;', '›'],
  ['&raquo;', '»'],
  ['&laquo;', '«'],
  ['&bull;', '•'],
  ['&Atilde;', 'Ã'],
  ['&agrave;', 'à'],
  ['&aacute;', 'á'],
  ['&trade;', '™'],
  ['&larr;', '←'],
  ['&cent;', '¢'],
  ['&rsquo;', '’'],
  ['&lsquo;', '‘'],
  ['&zwnj;', String.fromCodePoint(8204)],
  ['&zwj;', String.fromCodePoint(8205)],
  ['&wj;', String.fromCodePoint(8288)],
  ['&rarr;', '→'],
  ['&copy;', '©'],
  ['&copysr;', '℗'],
  ['&eacute;', 'é'],
  ['&Ccedil;', 'Ç'],
  ['&ccedil;', 'ç'],
  ['&Acirc;', 'Â'],
  ['&euro;', '€'],
  ['&Oslash;', 'Ø'],
  ['&oslash;', 'ø'],
]);

function fromEntries(entries) {
  return entries.reduce((main, [key, value]) => ({ ...main, [key]: value }), {});
}

function isEmptyString(str) {
  return (typeof str !== 'string' || str.length === 0);
}

const isNotEmptyString = (str) => !isEmptyString(str);

function isEmptyValue(v) {
  return (
    (v === null || v === undefined)
    || Number.isNaN(v)
    || (typeof v === 'string' && v.trim().length === 0)
    || (Array.isArray(v) && v.length === 0)
  );
}

const uniq = (arr) => Array.from(new Set(arr));

// === Document Navigation ===

// Get text content for a given node
function getTextForNode({ children }) {
  if (!children || children.length === 0) { return null; }
  const textNode = children.find(({ type }) => type === 'text');
  return (textNode) ? textNode.text.trim() : textNode;
}

// Get text content for a the first node
function getText([node]) {
  if (!node) { return null; }
  return getTextForNode(node);
}

// Get attribute from first node
function getAttribute([node], attrName) {
  if (!node) { return null; }
  return node.attributes[attrName];
}

// Get text content and parse as ISO date
function getDate(nodes) {
  const dateString = getText(nodes);
  try {
    return new Date(dateString).toISOString();
  } catch (error) { // RangeError
    return dateString;
  }
}

// Get text content and parse as a Number
const getInteger = (nodes) => Number.parseInt(getText(nodes), 10);
const getFloat = (nodes) => Number.parseFloat(getText(nodes), 10);

function isYes(nodes) {
  const string = getText(nodes);
  if (isEmptyString(string)) { return null; }
  return (string.toLowerCase() === 'yes');
}

// Find the first node with a given name
const findNode = (node, elName) => node.children.find(({ name }) => elName === name);

// Like findNode but throws an error if element is missing
const findNodeOrThrow = (node, elName) => {
  const child = findNode(node, elName);
  if (!child) {
    throw new Error(`Missing required <${elName}> element.`);
  }
  return child;
};

// Find all nodes with a given name
const findAllNodes = (node, elName) => node.children.filter(({ name }) => elName === name);

// Case-insensitive match checks both prefixes and suffixes.
// This is to get around XML namespace concerns.
function nodeNameLike(aName, bName) {
  return (
    aName === bName
    || aName.startsWith(`${bName}:`)
    || aName.endsWith(`:${bName}`)
  );
}

// Find all nodes with a name similar to a given name.
function findNodesLike(node, elName) {
  const nameUpper = elName.toUpperCase();
  return node.children.filter(({ name }) => {
    if (typeof name !== 'string') { return false; }
    return nodeNameLike(name.toUpperCase(), nameUpper);
  });
}

// PodLove Simple Chapters
function getChapterElements(chapterNode) {
  const chapter = {
    start: getAttribute([chapterNode], 'start'),
  };

  const title = getAttribute([chapterNode], 'title');
  const href = getAttribute([chapterNode], 'href');
  const image = getAttribute([chapterNode], 'image');

  if (!isEmptyString(title)) { chapter.title = title; }
  if (!isEmptyString(href)) { chapter.href = href; }
  if (!isEmptyString(image)) { chapter.image = image; }

  return chapter;
}

// === RSS Transformation ===

const rssElements = Object.freeze({
  title: getText,
  description: getText,
  subtitle: getText,
  language: getText,
  author: getText,
  summary: getText,
  managingEditor: getText,
  webMaster: getText,
  episodeType: getText, // full, trailer, or bonus
  type: getText, // episodic or serial
  guid: getText,
  generator: getText,
  countryOfOrigin: getText, // spotify
  limit: ([node]) => { // spotify
    if (!(node && node.children)) { return null; }
    return Number.parseInt(getAttribute([node], 'recentCount'), 10);
  },
  chapters: ([node]) => {
    if (!node) { return null; }

    // PodLove Chapters
    if (node.children && node.children.length > 0) {
      const chapterNodes = findNodesLike(node, 'chapter');
      return chapterNodes.map(getChapterElements);
    }

    // Podcast Namespace Chapters
    const url = getAttribute([node], 'url');
    const type = getAttribute([node], 'type');

    // Both url and type are required
    if (isEmptyString(url) || isEmptyString(type)) {
      return null;
    }

    return {
      url,
      type,
    };
  },
  thumbnail: (nodes) => (getAttribute(nodes, 'url') || getAttribute(nodes, 'href')),
  coverart: (nodes) => getAttribute(nodes, 'href'),
  keywords: (nodes) => uniq(
    nodes.map(getTextForNode)
      .filter(isNotEmptyString)
      .map((keywords) => keywords.split(','))
      .flat()
      .map((keyword) => keyword.trim())
      .sort(),
  ),
  category: (nodes) => {
    const categoryText = nodes.map((node) => getText([node]));
    const categories = nodes.map((node) => getAttribute([node], 'text'));
    const subcategories = nodes.map((node) => getAttribute(findNodesLike(node, 'category'), 'text'));
    return uniq(
      categories.concat(categoryText).concat(subcategories).filter(isNotEmptyString),
    ).sort();
  },
  owner: ([node]) => {
    if (!(node && node.children && node.children.length)) { return null; }
    return {
      name: getText(findNodesLike(node, 'name')),
      email: getText(findNodesLike(node, 'email')),
    };
  },
  image: ([node]) => {
    if (!(node && node.children)) { return null; }

    // i.e. <image><url>http://cdn.example.org/mylogo.png</url></image>
    const urlNode = findNode(node, 'url');
    if (urlNode) {
      return {
        url: getText([urlNode]),
        link: getText([findNode(node, 'link')]),
        title: getText([findNode(node, 'title')]),
      };
    }

    // i.e. <itunes:image href="http://cdn.example.org/mylogo.png" />
    if (isNotEmptyString(node.attributes.href)) {
      return {
        url: node.attributes.href,
      };
    }

    // i.e. <image>http://cdn.example.org/mylogo.png</image>
    return {
      url: getText([node]),
    };
  },
  explicit: (nodes) => {
    const nodeStr = getText(nodes);
    if (isEmptyString(nodeStr)) { return null; }
    const explicitString = nodeStr.toLowerCase();

    // Values meaning explicit
    if (['yes', 'explicit', 'true'].includes(explicitString)) {
      return true;
    }

    // Values meaning not explicit
    if (['clean', 'no', 'false'].includes(explicitString)) {
      return false;
    }

    return null;
  },
  complete: isYes,
  blocked: isYes,
  isClosedCaptioned: isYes,
  duration: ([node]) => {
    if (!node) { return null; }

    const dur = getText([node]);
    if (isEmptyString(dur)) { return null; }

    const times = dur.split(':').map(Number);
    const [h, m, s] = times;

    // Standardize all formats into an amount in seconds
    switch (times.length) {
      case 3: // i.e. 01:24:13
        return (60 * 60 * h) + (60 * m) + s;
      case 2: // i.e. 24:13
        return (60 * h) + m;
      default: // 1399
        return h;
    }
  },
  enclosure: ([node]) => {
    if (!(node && node.children)) { return null; }

    // i.e. <enclosure length="28882931" type="audio/mpeg" url="http://cdn.example.org/episode-1.mp3" />
    const url = getAttribute([node], 'url');
    if (isNotEmptyString(url)) {
      return {
        length: Number.parseInt(getAttribute([node], 'length'), 10),
        type: getAttribute([node], 'type'),
        url,
      };
    }

    return null;
  },
  content: ([node]) => {
    if (!(node && node.children)) { return null; }

    // i.e. <media:content url="https://cdn.example.org/episode-1.mp3" fileSize="19745645" type="audio/mpeg" />
    const url = getAttribute([node], 'url');
    if (isNotEmptyString(url)) {
      return {
        fileSize: Number.parseInt(getAttribute([node], 'fileSize'), 10),
        type: getAttribute([node], 'type'),
        url,
      };
    }

    return null;
  },
  order: getInteger,
  season: getInteger,
  episode: getInteger,
  ttl: getInteger,
  lastBuildDate: getDate,
  pubDate: getDate,
  // Omny
  clipId: getText,
  // Acast (excluding settings, signature, and network)
  showId: getText,
  showUrl: getText,
  episodeUrl: getText,
  episodeId: getText,
  // Pingback
  receiver: getText,
  // GeoRSS
  lat: getFloat,
  long: getFloat,
  point: ([node]) => {
    if (!node) { return null; }

    const pt = getText([node]);
    if (isEmptyString(pt)) { return null; }

    // i.e. '45.256 -71.92'
    return pt.split(' ').map(Number); // [45.256, -71.92]
  },
  // === Podcast 2.0 Namespace ===
  locked: isYes, // count = single
  // Location
  location: ([node]) => {
    if (!node) { return null; } // count = single

    const name = getText([node]); // i.e. Jacksonville, FL, USA

    const geoAttr = getAttribute([node], 'geo');
    const osm = getAttribute([node], 'osm');

    // Parse geo, i.e. geo:30.3321838,-81.65565099999999
    let coords = null;
    if (!isEmptyString(geoAttr)) {
      if (geoAttr.startsWith('geo:')) {
        coords = geoAttr
          .substring(4)
          .split(',')
          .map(Number);
      }
    }

    return {
      name, // Jacksonville, FL, USA
      geo: coords, // [ 30.3321838, -81.65565099999999 ]
      osm, // R113314
    };
  },
  // Soundbites
  soundbite: (nodes) => nodes.map((node) => ({
    name: getText([node]), // i.e. Why the Podcast Namespace Matters
    startTime: Number.parseFloat(getAttribute([node], 'startTime'), 10), // i.e. 73.0
    duration: Number.parseFloat(getAttribute([node], 'duration'), 10), // i.e. 60.0
  })).filter(({ startTime, duration }) => !(isEmptyValue(startTime) || isEmptyValue(duration))),
  // People
  person: (nodes) => nodes.map((node) => ({
    name: getText([node]), // i.e. Jane Doe
    role: getAttribute([node], 'role') || 'host',
    group: getAttribute([node], 'group') || 'cast',
    img: getAttribute([node], 'img'),
    href: getAttribute([node], 'href'),
  })).filter(({ name }) => !isEmptyString(name)),
  // Transcripts
  transcript: (nodes) => nodes.map((node) => ({
    url: getAttribute([node], 'url'),
    type: getAttribute([node], 'type'),
    language: getAttribute([node], 'language'),
    rel: getAttribute([node], 'rel'),
  })).filter(({ url, type }) => !(isEmptyString(url) || isEmptyString(type))),
  // Funding
  funding: (nodes) => nodes.map((node) => ({
    name: getText([node]),
    url: getAttribute([node], 'url'),
  })).filter(({ url, name }) => !(isEmptyString(name) || isEmptyString(url))),
  // Host Identifier
  id: ([node]) => {
    if (!node) { return null; } // count = single

    // See list of service slugs: https://github.com/Podcastindex-org/podcast-namespace/blob/main/serviceslugs.txt
    const platform = getAttribute([node], 'platform');
    const id = getAttribute([node], 'id');
    const url = getAttribute([node], 'url');

    if (isEmptyString(platform) || isEmptyString(id)) {
      return null;
    }

    return {
      platform,
      id,
      url,
    };
  },
  // License
  license: ([node]) => {
    if (!node) { return null; } // count = single
    const slug = getText([node]);
    const url = getAttribute([node], 'url');

    if (isEmptyString(slug) && isEmptyString(url)) {
      return null;
    }

    return {
      slug, url
    };
  },
});

// List of supported element names
const supportedElements = Object.keys(rssElements);

// Sorts episodes by order first, then sorts by date.
// If multiple episodes were published at the same time,
// they are then sorted by title.
function episodeComparator(a, b) {
  if (a.order === b.order) {
    if (a.pubDate === b.pubDate) {
      return (a.title > b.title) ? -1 : 1;
    }
    return (b.pubDate > a.pubDate) ? 1 : -1;
  }

  if (a.order && !b.order) { return 1; }
  if (b.order && !a.order) { return -1; }

  return (a.order > b.order) ? -1 : 1;
}

// For itunes:type = "serial", use reverse chronological order
// to keep seasons in order
function serialComparator(a, b) {
  // Same season, sort by episode
  if (a.season === b.season) {
    if (!(a.episode && b.episode)) {
      if (a.pubDate === b.pubDate) {
        return (a.title > b.title) ? -1 : 1;
      }

      return (b.pubDate > a.pubDate) ? -1 : 1;
    }

    return (a.episode > b.episode) ? 1 : -1;
  }

  // Default to reverse chronological
  if (!(a.season && b.season)) {
    if (a.pubDate === b.pubDate) {
      return (a.title > b.title) ? -1 : 1;
    }

    return (b.pubDate > a.pubDate) ? -1 : 1;
  }

  return (a.season > b.season) ? 1 : -1;
}

// Get an array of links
function getLinksFromChannel(channel) {
  return findNodesLike(channel, 'link')
    .filter(({ attributes }) => attributes.rel && attributes.href)
    .map(({ attributes: { rel, href, type } }) => ({ rel, href, type }));
}

// Parse an individual element
function parseElement(element) {
  const parsedValues = supportedElements
    .map((elName) => [elName, rssElements[elName](findNodesLike(element, elName))])
    .filter(([, v]) => !isEmptyValue(v));

  const parsedElement = fromEntries(parsedValues);

  // Add <link> if one exact match exists
  const mainLink = getText(findAllNodes(element, 'link'));
  if (isNotEmptyString(mainLink)) {
    parsedElement.link = mainLink;
  }

  return parsedElement;
}

// Parse main channel element
function createMetaFromChannel(channel) {
  const metaObject = parseElement(channel);
  metaObject.links = getLinksFromChannel(channel);
  return metaObject;
}

// Parse item elements
const createEpisodesFromItems = (items) => items.map(parseElement).sort(episodeComparator);
const createSeasonsFromItems = (items) => items.map(parseElement).sort(serialComparator);

// Resolve undefined entities
const entityResolver = entityMap.get.bind(entityMap);

// === Main Method ===

const DEFAULT_OPTIONS = Object.freeze({
  includeEpisodes: true,
});

module.exports = function getPodcastFromFeed(feed,
  { includeEpisodes } = DEFAULT_OPTIONS) {
  const feedObject = parseXml(feed.trim(), {
    resolveUndefinedEntity: entityResolver,
  });
  const rss = findNodeOrThrow(feedObject, 'rss');
  const channel = findNodeOrThrow(rss, 'channel');

  const meta = createMetaFromChannel(channel);

  if (includeEpisodes) {
    const isSerial = (meta && meta.type && meta.type.toLowerCase() === SERIAL);
    const items = findAllNodes(channel, 'item');
    const episodes = (isSerial) ? createSeasonsFromItems(items) : createEpisodesFromItems(items);

    return { meta, episodes };
  }

  return { meta };
};
