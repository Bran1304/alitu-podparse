/* eslint-disable no-unused-expressions */
const fs = require('fs');
const path = require('path');
const getPodcastFromFeed = require('../index');

const testFilesPath = path.join(__dirname, 'testfiles');
const convertedPath = path.join(__dirname, 'json');

const start = Date.now();

const sampleFeed = fs.readFileSync(`${testFilesPath}/bc-sample.xml`, 'utf8').toString();
const sampleFeedOrder = fs.readFileSync(`${testFilesPath}/bc-sample-order.xml`, 'utf8').toString();
const replyAllOrdering = fs.readFileSync(`${testFilesPath}/replyall-sample-ordering.xml`, 'utf8').toString();
const planeyMoney = fs.readFileSync(`${testFilesPath}/planet-money.xml`, 'utf8').toString();
const theDaily = fs.readFileSync(`${testFilesPath}/the-daily.xml`, 'utf8').toString();
const orbita = fs.readFileSync(`${testFilesPath}/orbita.xml`, 'utf8').toString();
const ruminant = fs.readFileSync(`${testFilesPath}/ruminant.xml`, 'utf8').toString();
const enigma = fs.readFileSync(`${testFilesPath}/enigma.xml`, 'utf8').toString();
const itunesu = fs.readFileSync(`${testFilesPath}/itunesu.xml`, 'utf8').toString();
const podlove = fs.readFileSync(`${testFilesPath}/podlove.xml`, 'utf8').toString();
const hours80000 = fs.readFileSync(`${testFilesPath}/80000HoursPodcast.xml`, 'utf8').toString();
const bbcMinutes = fs.readFileSync(`${testFilesPath}/bbc_minutes.xml`, 'utf8').toString();
const geoLatlong = fs.readFileSync(`${testFilesPath}/georss_latlong.xml`, 'utf8').toString();
const geoPoint = fs.readFileSync(`${testFilesPath}/georss_point.xml`, 'utf8').toString();
const tvillingpodden = fs.readFileSync(`${testFilesPath}/tvillingpodden.xml`, 'utf8').toString();
const riordansDesk = fs.readFileSync(`${testFilesPath}/riordans_desk.xml`, 'utf8').toString();
const podcastNamespaceEx = fs.readFileSync(`${testFilesPath}/podcast_example.xml`, 'utf8').toString();
const howToStart = fs.readFileSync(`${testFilesPath}/start_podcast.xml`, 'utf8').toString();

fs.writeFileSync(`${convertedPath}/bc-sample.json`, JSON.stringify(getPodcastFromFeed(sampleFeed), null, 2));
fs.writeFileSync(`${convertedPath}/bc-sample-order.json`, JSON.stringify(getPodcastFromFeed(sampleFeedOrder), null, 2));
fs.writeFileSync(`${convertedPath}/replyall-sample-ordering.json`, JSON.stringify(getPodcastFromFeed(replyAllOrdering), null, 2));
fs.writeFileSync(`${convertedPath}/planet-money.json`, JSON.stringify(getPodcastFromFeed(planeyMoney), null, 2));
fs.writeFileSync(`${convertedPath}/the-daily.json`, JSON.stringify(getPodcastFromFeed(theDaily), null, 2));
fs.writeFileSync(`${convertedPath}/orbita.json`, JSON.stringify(getPodcastFromFeed(orbita), null, 2));
fs.writeFileSync(`${convertedPath}/ruminant.json`, JSON.stringify(getPodcastFromFeed(ruminant), null, 2));
fs.writeFileSync(`${convertedPath}/enigma.json`, JSON.stringify(getPodcastFromFeed(enigma), null, 2));
fs.writeFileSync(`${convertedPath}/itunesu.json`, JSON.stringify(getPodcastFromFeed(itunesu), null, 2));
fs.writeFileSync(`${convertedPath}/podlove.json`, JSON.stringify(getPodcastFromFeed(podlove), null, 2));
fs.writeFileSync(`${convertedPath}/80000HoursPodcast.json`, JSON.stringify(getPodcastFromFeed(hours80000), null, 2));
fs.writeFileSync(`${convertedPath}/bbc_minutes.json`, JSON.stringify(getPodcastFromFeed(bbcMinutes), null, 2));
fs.writeFileSync(`${convertedPath}/georss_latlong.json`, JSON.stringify(getPodcastFromFeed(geoLatlong), null, 2));
fs.writeFileSync(`${convertedPath}/georss_point.json`, JSON.stringify(getPodcastFromFeed(geoPoint), null, 2));
fs.writeFileSync(`${convertedPath}/tvillingpodden.json`, JSON.stringify(getPodcastFromFeed(tvillingpodden), null, 2));
fs.writeFileSync(`${convertedPath}/riordans_desk.json`, JSON.stringify(getPodcastFromFeed(riordansDesk), null, 2));
fs.writeFileSync(`${convertedPath}/podcast_example.json`, JSON.stringify(getPodcastFromFeed(podcastNamespaceEx), null, 2));
fs.writeFileSync(`${convertedPath}/start_podcast.json`, JSON.stringify(getPodcastFromFeed(howToStart), null, 2));

console.log(`Conversion complete in ${Date.now() - start}ms`);