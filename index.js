const parseXml = require('@rgrove/parse-xml');

// === Utilities ===

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
const getNumber = (nodes) => Number.parseInt(getText(nodes), 10);

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
    throw new Error(`Missing requires <${elName}> element.`);
  }
  return child;
}

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
  thumbnail: (nodes) => getAttribute(nodes, 'url'),
  keywords: (nodes) => uniq(
    nodes.map(getTextForNode)
      .filter(isNotEmptyString)
      .map((keywords) => keywords.split(','))
      .flat()
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
    if (!(node && node.children)) { return null; }
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

    // Standardize all formats into an amount in milliseconds
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
  order: getNumber,
  season: getNumber,
  episode: getNumber,
  ttl: getNumber,
  lastBuildDate: getDate,
  pubDate: getDate,
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

  if (a.order && !b.order) {
    return 1;
  }

  if (b.order && !a.order) {
    return -1;
  }

  return (a.order > b.order) ? -1 : 1;
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

// === Main Method ===

module.exports = function getPodcastFromFeed(feed) {
  const feedObject = parseXml(feed);
  const rss = findNodeOrThrow(feedObject, 'rss');
  const channel = findNodeOrThrow(rss, 'channel');
  const items = findAllNodes(channel, 'item');

  return {
    meta: createMetaFromChannel(channel),
    episodes: createEpisodesFromItems(items),
  };
};
