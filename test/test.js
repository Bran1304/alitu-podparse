/* eslint-disable no-unused-expressions */
/* global describe,it */
const chai = require('chai');
const fs = require('fs');
const path = require('path');
const getPodcastFromFeed = require('../index');

const { expect } = chai;

const testFilesPath = path.join(__dirname, 'testfiles');

const sampleFeed = fs.readFileSync(`${testFilesPath}/bc-sample.xml`, 'utf8').toString();
const badSampleFeed = fs.readFileSync(`${testFilesPath}/bc-sample-bad.xml`, 'utf8').toString();
const sampleFeedOrder = fs.readFileSync(`${testFilesPath}/bc-sample-order.xml`, 'utf8').toString();
const replyAllOrdering = fs.readFileSync(`${testFilesPath}/replyall-sample-ordering.xml`, 'utf8').toString();
const planeyMoney = fs.readFileSync(`${testFilesPath}/planet-money.xml`, 'utf8').toString();
const theDaily = fs.readFileSync(`${testFilesPath}/the-daily.xml`, 'utf8').toString();
const orbita = fs.readFileSync(`${testFilesPath}/orbita.xml`, 'utf8').toString();
const ruminant = fs.readFileSync(`${testFilesPath}/ruminant.xml`, 'utf8').toString();
const enigma = fs.readFileSync(`${testFilesPath}/enigma.xml`, 'utf8').toString();
const itunesu = fs.readFileSync(`${testFilesPath}/itunesu.xml`, 'utf8').toString();
const extraContent = fs.readFileSync(`${testFilesPath}/canal.xml`, 'utf8').toString();
const notRss = fs.readFileSync(`${testFilesPath}/products.xml`, 'utf8').toString();
const otherEntities = fs.readFileSync(`${testFilesPath}/babesinbusiness.xml`, 'utf8').toString();
const badEntity = fs.readFileSync(`${testFilesPath}/comintegrator.xml`, 'utf8').toString();
const podlove = fs.readFileSync(`${testFilesPath}/podlove.xml`, 'utf8').toString();
const hours80000 = fs.readFileSync(`${testFilesPath}/80000HoursPodcast.xml`, 'utf8').toString();
const bbcMinutes = fs.readFileSync(`${testFilesPath}/bbc_minutes.xml`, 'utf8').toString();
const geoLatlong = fs.readFileSync(`${testFilesPath}/georss_latlong.xml`, 'utf8').toString();
const geoPoint = fs.readFileSync(`${testFilesPath}/georss_point.xml`, 'utf8').toString();
const tvillingpodden = fs.readFileSync(`${testFilesPath}/tvillingpodden.xml`, 'utf8').toString();
const riordansDesk = fs.readFileSync(`${testFilesPath}/riordans_desk.xml`, 'utf8').toString();
const podcastNamespaceEx = fs.readFileSync(`${testFilesPath}/podcast_example.xml`, 'utf8').toString();
const howToStart = fs.readFileSync(`${testFilesPath}/start_podcast.xml`, 'utf8').toString();
const podnews = fs.readFileSync(`${testFilesPath}/podnews.xml`, 'utf8').toString();
const podnewsDec21 = fs.readFileSync(`${testFilesPath}/podnews-dec21.xml`, 'utf8').toString();
const podland22 = fs.readFileSync(`${testFilesPath}/podland.xml`, 'utf8').toString();

describe('Reading files', () => {
  it('should read the file', () => {
    expect(sampleFeed).to.be.a('string');
  });
});

describe('Parsing Local Feeds', () => {
  it('should parse the feed and return a Podcast object', () => {
    expect(getPodcastFromFeed(sampleFeed)).to.be.an('object').that.contains.keys('meta', 'episodes');
  });

  it('should parse a bad feed and return an error', () => {
    expect(() => getPodcastFromFeed(badSampleFeed)).to.throw();
  });

  it('should throw an error for extra content', () => {
    // extra content before or after the XML document
    expect(() => getPodcastFromFeed(extraContent)).to.throw();
  });

  it('should throw an error when root element is not <rss>', () => {
    expect(() => getPodcastFromFeed(notRss)).to.throw(/Missing required <rss> element/);
  });

  it('should parse HTML entities like &nbsp;', () => {
    expect(() => getPodcastFromFeed(otherEntities)).not.to.throw(/Named entity isn't defined/);
  });

  it('should throw an error for invalid entities', () => {
    expect(() => getPodcastFromFeed(badEntity)).to.throw(/Named entity isn't defined/);
  });
});

describe('Getting Podcast Object from Sample Feed', () => {
  const podcast = getPodcastFromFeed(sampleFeed);

  it('should be a valid Podcast Object', () => {
    expect(podcast).to.be.an('object').that.contains.keys('meta', 'episodes');
  });

  describe('Checking Podcast Meta Information', () => {
    it('should be a valid object with all default fields', () => {
      expect(podcast.meta).to.be.an('object').that.contains.keys(
        'title',
        'description',
        'image',
        'lastBuildDate',
        'link',
        'links',
        'language',
        'managingEditor',
        'author',
        'summary',
        'category',
        'owner',
        'explicit',
        'generator',
      );
    });

    it('should have expected information', () => {
      expect(podcast.meta.title).to.equal('All Things Chemical');
      expect(podcast.meta.description).to.equal('All Things Chemical is a podcast produced by Bergeson & Campbell, P.C. (B&C®), a Washington D.C. law firm focusing on chemical law, business, and litigation matters. All Things Chemical is hosted by Lynn L. Bergeson, managing partner of B&C. In each episode, we bring you intelligent, insightful, and engaging conversation about everything related to industrial, pesticidal, and specialty chemicals, as well as the law and business issues surrounding chemicals. Our incredibly talented team of lawyers, scientists, and consultants keep you abreast of the changing world of both domestic and international chemical regulation and provide analysis of the many intriguing and complicated issues surrounding this space.');
      expect(podcast.meta.image.url).to.equal('https://ssl-static.libsyn.com/p/assets/0/0/e/b/00eb13bdea311055/AllThingsChemicalLogo1400.png');
      expect(podcast.meta.lastBuildDate).to.equal('2018-12-06T17:51:50.000Z');
      expect(podcast.meta.link).to.equal('http://www.lawbc.com');
      expect(podcast.meta.language).to.equal('en');
      expect(podcast.meta.managingEditor).to.equal('info@lawbc.com (info@lawbc.com)');
      expect(podcast.meta.author).to.equal('Bergeson & Campbell, PC');
      expect(podcast.meta.summary).to.equal('All Things Chemical is a podcast produced by Bergeson & Campbell, P.C. (B&C®), a Washington D.C. law firm focusing on chemical law, business, and litigation matters. All Things Chemical is hosted by Lynn L. Bergeson, managing partner of B&C. In each episode, we bring you intelligent, insightful, and engaging conversation about everything related to industrial, pesticidal, and specialty chemicals, as well as the law and business issues surrounding chemicals. Our incredibly talented team of lawyers, scientists, and consultants keep you abreast of the changing world of both domestic and international chemical regulation and provide analysis of the many intriguing and complicated issues surrounding this space.');
      expect(podcast.meta.category).to.eql(['Business', 'Business News', 'Government & Organizations']);
      expect(podcast.meta.owner).to.eql({ name: 'Bergeson & Campbell, PC', email: 'info@lawbc.com' });
      expect(podcast.meta.explicit).to.equal(false);
      expect(podcast.meta.complete).to.be.undefined;
      expect(podcast.meta.blocked).to.be.undefined;
    });

    it('should have a links section', () => {
      expect(podcast.meta.links).to.be.an('array');
      expect(podcast.meta.links[0]).to.be.an('object').that.contains.keys('href', 'type', 'rel');
    });
  });

  describe('Parses Google Play Schema', () => {
    const enigmaPodcast = getPodcastFromFeed(enigma);

    it('parses podcast metadata', () => {
      expect(enigmaPodcast.meta.author).to.equal('JuanPaLaguna');
      expect(enigmaPodcast.meta.image.url).to.equal('https://d3wo5wojvuv7l.cloudfront.net/t_rss_itunes_square_1400/images.spreaker.com/original/3d221577de5b436cf44fc10b77370732.jpg');
      expect(enigmaPodcast.meta.description).to.equal('El viaje para la búsqueda de la verdad ( o lo más cercano a ella) en el mundo del misterio.');
    });

    it('handles explicit values case-insensitive', () => {
      expect(enigmaPodcast.meta.explicit).to.equal(false); // "No"
    });

    it('handles both category and googleplay:category elements', () => {
      expect(enigmaPodcast.meta.category).to.eql(['Leisure', 'Society & Culture']);
    });

    it('handles "clean" as not explicit', () => {
      const orbitaPodcast = getPodcastFromFeed(orbita);
      expect(orbitaPodcast.meta.explicit).to.equal(false); // "clean"
    });
  });

  describe('Parsing Planet Money', () => {
    const money = getPodcastFromFeed(planeyMoney);

    it('should have expected information', () => {
      expect(money.meta.title).to.equal('Planet Money');
      expect(money.meta.description).to.equal('The economy explained. Imagine you could call up a friend and say, "Meet me at the bar and tell me what\'s going on with the economy." Now imagine that\'s actually a fun evening.');
      expect(money.meta.image.url).to.equal('https://media.npr.org/assets/img/2018/08/02/npr_planetmoney_podcasttile_sq-7b7fab0b52fd72826936c3dbe51cff94889797a0.jpg?s=1400');
      expect(money.meta.type).to.equal('episodic');
      expect(money.meta.link).to.equal('https://www.npr.org/planetmoney');
      expect(money.meta.language).to.equal('en');
      expect(money.meta.author).to.equal('NPR');
      expect(money.meta.summary).to.equal(money.meta.description);
      expect(money.meta.category).to.eql(['Business', 'News']);
      expect(money.meta.owner).to.eql({ name: 'NPR', email: 'podcasts@npr.org' });
      expect(money.meta.explicit).to.be.undefined;
      expect(money.meta.complete).to.be.undefined;
      expect(money.meta.blocked).to.be.undefined;
    });
  });

  describe('Checking Podcast Episode Information', () => {
    it('should have expected number of episodes', () => {
      expect(podcast.episodes).to.have.length(4);
    });

    it('should list episodes in order of newest to oldest', () => {
      expect(podcast.episodes[0].title).to.be.equal('Confidential Business Information under TSCA');
      expect(podcast.episodes[3].title).to.be.equal('Introducing All Things Chemical');
    });

    describe('Checking Episode of Podcast', () => {
      it('should be a valid object with all default fields', () => {
        expect(podcast.episodes[0]).to.be.an('object').that.contains.keys(
          'title', 
'description', 
'subtitle', 
'image', 
'pubDate',
          'link', 
'enclosure', 
'duration', 
'summary',
          'explicit', 
'guid', 
'episode', 
'episodeType', 
'season',
        );
      });

      it('should have expected information', () => {
        expect(podcast.episodes[0].title).to.equal('Confidential Business Information under TSCA');
        expect(podcast.episodes[0].description).to.equal('<p>This week, I sat down with Dr. Richard Engler, our Director of Chemistry, to discuss Confidential Business Information (CBI). CBI is both a term of art under the Toxic Substances Control Act (TSCA) and can be understood broadly to be anything from trade secrets to you know, the secret sauce of a chemical formulation that makes a product profitable. In our conversation, we focused on how this concept of CBI functions under TSCA and how businesses need to handle CBI during the EPA’s chemical review process.</p> <p>Rich is the perfect person to discuss the concept of CBI. Rich is 17-year veteran of the U.S. Environmental Protection Agency (EPA). He has participated in thousands of Toxic Substances Control Act (TSCA) substance reviews at EPA, and knows the ins-and-outs of how CBI should be handled.</p> <p>Our conversation touches upon some of the most important legal and business considerations when dealing with CBI and the EPA: how the EPA exactly defines CBI, where problems can arise, and how to avoid these through careful preparation and planning.</p> <p>ALL MATERIALS IN THIS PODCAST ARE PROVIDED SOLELY FOR INFORMATIONAL AND ENTERTAINMENT PURPOSES. THE MATERIALS ARE NOT INTENDED TO CONSTITUTE LEGAL ADVICE OR THE PROVISION OF LEGAL SERVICES. ALL LEGAL QUESTIONS SHOULD BE ANSWERED DIRECTLY BY A LICENSED ATTORNEY PRACTICING IN THE APPLICABLE AREA OF LAW.</p> <p> </p>');
        expect(podcast.episodes[0].subtitle).to.equal('This week, I sat down with Dr. Richard Engler, our Director of Chemistry, to discuss Confidential Business Information (CBI). CBI is both a term of art under the Toxic Substances Control Act (TSCA) and can be understood broadly to be anything from...');
        expect(podcast.episodes[0].image.url).to.equal('https://ssl-static.libsyn.com/p/assets/0/0/e/b/00eb13bdea311055/AllThingsChemicalLogo1400.png');
        expect(podcast.episodes[0].pubDate).to.equal('2018-11-29T10:30:00.000Z');
        expect(podcast.episodes[0].link).to.equal('http://allthingschemical.libsyn.com/confidential-business-information-under-tsca');
        expect(podcast.episodes[0].language).to.be.undefined;
        expect(podcast.episodes[0].enclosure).to.eql({
          length: 28882931,
          type: 'audio/mpeg',
          url: 'https://traffic.libsyn.com/secure/allthingschemical/ep3_final_96.mp3?dest-id=814653',
        });
        expect(podcast.episodes[0].duration).to.equal(2398);
        expect(podcast.episodes[0].summary).to.equal('This week, I sat down with Dr. Richard Engler, our Director of Chemistry, to discuss Confidential Business Information (CBI). CBI is both a term of art under the Toxic Substances Control Act (TSCA) and can be understood broadly to be anything from trade secrets to you know, the secret sauce of a chemical formulation that makes a product profitable. In our conversation, we focused on how this concept of CBI functions under TSCA and how businesses need to handle CBI during the EPA’s chemical review process.');
        expect(podcast.episodes[0].blocked).to.be.undefined;
        expect(podcast.episodes[0].explicit).to.equal(false);
        expect(podcast.episodes[0].order).to.be.undefined;
      });
    });

    describe('Parsing Planet Money', () => {
      const money = getPodcastFromFeed(planeyMoney);

      it('should have expected information', () => {
        expect(money.episodes[0].title).to.equal('#980: The Fed Fights The Virus');
        expect(money.episodes[0].description).to.equal('The central bank is trying to prevent a health crisis from becoming a financial crisis. | Subscribe to our weekly newsletter <a href="https://www.npr.org/newsletter/money?utm_source=rss_feed_copy&utm_medium=podcast&utm_term=planet_money">here</a>.');
        expect(money.episodes[0].image.url).to.equal('https://media.npr.org/assets/img/2020/03/16/gettyimages-1204924943-594x594_wide-60e13736df6bfcb9135f158ec2873956f134aef4.jpg?s=1400');
        expect(money.episodes[0].episodeType).to.equal('full');
        expect(money.episodes[0].link).to.equal('https://www.npr.org/2020/03/16/816684372/episode-980-the-fed-fights-the-virus');
        expect(money.episodes[0].pubDate).to.equal('2020-03-16T21:50:01.000Z');
        expect(money.episodes[0].duration).to.equal(1097);
        expect(money.episodes[0].summary).to.equal('The Federal Reserve usually has one main job: setting interest rates. But in emergencies, another Fed job becomes more important: trying to prevent a financial crisis.');
        expect(money.episodes[0].enclosure.url).to.equal('https://play.podtrac.com/npr-510289/edge1.pod.npr.org/anon.npr-podcasts/podcast/npr/pmoney/2020/03/20200316_pmoney_pmpod980-e086b0be-e27c-44eb-a088-d76e3104fb20.mp3?awCollectionId=510289&awEpisodeId=816684372&orgId=1&topicId=1017&aggIds=812054919&d=1097&p=510289&story=816684372&t=podcast&e=816684372&size=17556408&ft=pod&f=510289');
        expect(money.episodes[0].enclosure.length).to.equal(17556408);
        expect(money.episodes[0].enclosure.type).to.equal('audio/mpeg');
        expect(money.episodes[0].guid).to.equal('5b88529b-fed8-4562-8312-61e4b24b0451');
      });
    });

    describe('Parsing The Daily', () => {
      const daily = getPodcastFromFeed(theDaily);

      it('should have expected information', () => {
        expect(daily.episodes[0].title).to.equal('Gov. Andrew Cuomo: ‘It’s Making Sure We Live Through This.’');
        expect(daily.episodes[0].image.url).to.equal('https://content.production.cdn.art19.com/images/01/1b/f3/d6/011bf3d6-a448-4533-967b-e2f19e376480/c81936f538106550b804e7e4fe2c236319bab7fba37941a6e8f7e5c3d3048b88fc5b2182fb790f7d446bdc820406456c94287f245db89d8656c105d5511ec3de.jpeg');
        expect(daily.episodes[0].episodeType).to.equal('full');
        expect(daily.episodes[0].pubDate).to.equal('2020-03-18T09:52:39.000Z');
        expect(daily.episodes[0].duration).to.equal((60 * 30) + 52);
        expect(daily.episodes[0].enclosure.url).to.equal('https://dts.podtrac.com/redirect.mp3/rss.art19.com/episodes/4bc87d0e-844c-4008-9a7e-b5bff3114ded.mp3');
        expect(daily.episodes[0].enclosure.length).to.equal(29635395);
        expect(daily.episodes[0].enclosure.type).to.equal('audio/mpeg');
        expect(daily.episodes[0].guid).to.equal('gid://art19-episode-locator/V0/eooL1KYI_E0xdACmvP47Uaj_PHCfMpQIB8oH6V5V09E');
      });
    });
  });
});

describe('Supports PodLove Simple Chapters', () => {
  const podChapters = getPodcastFromFeed(podlove);

  it('should include a chapters element', () => {
    expect(podChapters.episodes[0].chapters).to.be.an('array');
    expect(podChapters.episodes[0].chapters.length).to.eql(4);
  });

  it('should include chapter titles, start times, and links', () => {
    expect(podChapters.episodes[0].chapters[0].start).to.eql('0');
    expect(podChapters.episodes[0].chapters[0].title).to.eql('Welcome');
    expect(podChapters.episodes[0].chapters[1].href).to.eql('http://podlove.org/');
  });

  it('should not include empty values', () => {
    expect(podChapters.episodes[0].chapters[0].href).to.be.undefined;
    expect(podChapters.episodes[0].chapters[0].image).to.be.undefined;
  });
});

describe('Supports Spotify attributes', () => {
  const podChapters = getPodcastFromFeed(podlove);

  it('should parse the country of origin element', () => {
    expect(podChapters.meta.countryOfOrigin).to.eql('us');
  });

  it('should parse the limit element', () => {
    expect(podChapters.meta.limit).to.eql(1);
  });
});

describe('Supports Iono Namespace', () => {
  const bbcPodcast = getPodcastFromFeed(bbcMinutes);

  it('should include cover art urls', () => {
    expect(bbcPodcast.meta.coverart).to.eql('https://static.iono.fm/img/iono2/black/ionofm_black_tagline_square_with_background_300w.png');
    expect(bbcPodcast.episodes[0].coverart).to.be.undefined;
  });

  it('should include thumbnail urls', () => {
    expect(bbcPodcast.meta.thumbnail).to.eql('https://static.iono.fm/files/p4/logo_2946_20191028_163751_600.jpg');
    expect(bbcPodcast.episodes[0].thumbnail).to.eql('https://static.iono.fm/files/p4/logo_2946_20191028_163751_600.jpg');
  });
});

describe('Supports GeoRSS Namespace', () => {
  const geoPointFeed = getPodcastFromFeed(geoPoint);
  const geoLatlongFeed = getPodcastFromFeed(geoLatlong);

  it('should include GeoRSS points', () => {
    expect(geoPointFeed.episodes[0].point).to.eql([45.256, -71.92]);
  });

  it('should include W3 geo lat long', () => {
    expect(geoLatlongFeed.episodes[0].lat).to.eql(5.5319);
    expect(geoLatlongFeed.episodes[0].long).to.eql(95.8972);
  });
});

describe('Supports Omny Namespace', () => {
  const geoPointFeed = getPodcastFromFeed(geoPoint);

  it('should include ClipID', () => {
    expect(geoPointFeed.episodes[0].clipId).to.equal('bd6e1cae-b8fe-4c39-a947-ab7d00020c51');
  });
});

describe('Supports Podping Namespace', () => {
  const podden = getPodcastFromFeed(tvillingpodden);

  it('should include pingback receiver', () => {
    expect(podden.meta.receiver).to.equal('https://interaction.acast.com/pingback');
  });
});

describe('Supports Acast Namespace', () => {
  const podden = getPodcastFromFeed(tvillingpodden);

  it('should include showId and showUrl', () => {
    expect(podden.meta.showId).to.equal('2b0d74ba-ec2d-4b08-93c1-ed0941812903');
    expect(podden.meta.showUrl).to.equal('tvillingpodden');
  });

  it('should include episodeId and episodeUrl', () => {
    expect(podden.episodes[0].episodeId).to.equal('c0622b11-f879-4a28-adea-25bc81b532d6');
    expect(podden.episodes[0].episodeUrl).to.equal('292.ostsnippa');
  });
});

describe('Checking re-ordering functionality', () => {
  it('should list episodes in order described by order tags in the rss feed', () => {
    const podcast = getPodcastFromFeed(sampleFeedOrder);
    expect(podcast.episodes[3].title).to.equal('Chemical Regulation in the Middle East'); // order 1
    expect(podcast.episodes[2].title).to.equal('Animal Testing and New TSCA'); // order 2
    expect(podcast.episodes[1].title).to.equal('Introducing All Things Chemical'); // default ordering by pubDate
  });

  it('should order by title when no order is specified and pubDate is the same', () => {
    const podcast = getPodcastFromFeed(replyAllOrdering);
    expect(podcast.episodes[2].title).to.equal('Reply All Mic Test'); // first by pubDate
    expect(podcast.episodes[1].title).to.equal('#1 A Stranger Says I Love You'); // pubDate is the same, order by title
    expect(podcast.episodes[0].title).to.equal('#2 The Secret, Gruesome Internet For Doctors'); // pubDate is the same, order by title
  });
});

describe('Deduplication', () => {
  it('should deduplicate keywords', () => {
    const podcast = getPodcastFromFeed(replyAllOrdering);
    expect(podcast.meta.keywords).to.eql(['Storytelling']);
  });

  it('should support comma-separated keywords', () => {
    const podcast = getPodcastFromFeed(ruminant);
    expect(podcast.meta.keywords).to.eql(['farm', 'farming', 'food', 'gardening', 'ideas', 'organic', 'politics', 'scale', 'skills', 'small', 'sustainable']);
  });

  it('should deduplicate categories', () => {
    const podcast = getPodcastFromFeed(orbita);
    expect(podcast.meta.category).to.eql(['Comedy']);
  });
});

describe('Sorting when Type = Serial', () => {
  const riordan = getPodcastFromFeed(riordansDesk);

  it('sorts Season 1 before Season 2', () => {
    const seasonOneIndex = riordan.episodes.findIndex((e) => e.season === 1);
    const seasonTwoIndex = riordan.episodes.findIndex((e) => e.season === 2);
    expect(seasonOneIndex).to.be.lessThan(seasonTwoIndex);
  });

  it('sorts Episode 1 before Episode 2', () => {
    const episodeOneIndex = riordan.episodes.findIndex((e) => e.episode === 1);
    const episodeTwoIndex = riordan.episodes.findIndex((e) => e.episode === 2);
    expect(episodeOneIndex).to.be.lessThan(episodeTwoIndex);
  });

  it('sorts in reverse chronological order', () => {
    const firstEpisodeDate = (new Date(riordan.episodes[0].pubDate)).valueOf();
    const lastEpisodeDate = (new Date(
      riordan.episodes[riordan.episodes.length - 1].pubDate,
    )).valueOf();
    expect(firstEpisodeDate).to.be.lessThan(lastEpisodeDate);
  });

  it('sorts S1E1 first', () => {
    const firstEpisode = riordan.episodes[0];
    expect(firstEpisode.episode).to.eql(1);
    expect(firstEpisode.season).to.eql(1);
    expect(firstEpisode.guid).to.eql('Buzzsprout-3664768');
    expect(firstEpisode.pubDate).to.eql('2020-05-07T22:00:00.000Z');
  });

  it('sorts S2E11 last', () => {
    const lastEpisode = riordan.episodes[riordan.episodes.length - 1];
    expect(lastEpisode.episode).to.eql(11);
    expect(lastEpisode.season).to.eql(2);
    expect(lastEpisode.guid).to.eql('Buzzsprout-5865685');
    expect(lastEpisode.pubDate).to.eql('2020-10-13T00:00:00.000Z');
  });

  it('sorts episodes in order', () => {
    for (let i = 1, e = riordan.episodes.length; i < e; i += 1) {
      const a = riordan.episodes[i - 1];
      const b = riordan.episodes[i];

      if (a.season === b.season) {
        expect(a.episode).to.be.lessThan(b.episode);
      } else {
        expect(a.season).to.be.lessThan(b.season);
      }
    }
  });
});

describe('Duration element', () => {
  // i.e. <itunes:duration></itunes:duration>
  it('handles empty duration', () => {
    const podcast = getPodcastFromFeed(itunesu);
    expect(podcast.episodes[0].duration).to.be.undefined;
  });

  it('parses HH:MM:SS format correctly', () => {
    const podcast = getPodcastFromFeed(hours80000);
    // 02:11:36
    expect(podcast.episodes[0].duration).to.eq((2 * 60 * 60) + (11 * 60) + 36);
    // 00:26:45
    expect(podcast.episodes[2].duration).to.eq((0 * 60 * 60) + (26 * 60) + 45);
  });
});

describe('Options', () => {
  it('doesn\'t parse episodes when includeEpisodes is set to false', () => {
    const podcast = getPodcastFromFeed(itunesu, { includeEpisodes: false });
    expect(podcast.episodes).to.be.undefined;
    expect(podcast.meta).to.be.an('object');
  });
});

describe('Supports Podcast Namespace', () => {
  const howToStartPodcast = getPodcastFromFeed(howToStart);
  const podcastNSExample = getPodcastFromFeed(podcastNamespaceEx);
  const podnewsFeed = getPodcastFromFeed(podnews);
  const podnewsFeed21 = getPodcastFromFeed(podnewsDec21);

  it('should include person elements', () => {
    const { person } = podcastNSExample.episodes[0];
    expect(person).to.be.an('array');
    expect(person.length).to.eq(3);
    expect(person.map(({ name }) => name)).to.eql(['Adam Curry', 'Dave Jones', 'Becky Smith']);
    expect(person.map(({ role }) => role)).to.eql(['host', 'guest', 'cover art designer']);
    expect(person.map(({ group }) => group)).to.eql(['cast', 'cast', 'visuals']);
    expect(person.map(({ href }) => href)).to.eql([
      'https://www.podchaser.com/creators/adam-curry-107ZzmWE5f',
      'https://github.com/daveajones/',
      'https://example.com/artist/beckysmith',
    ]);
  });

  it('should include location element', () => {
    const { location } = howToStartPodcast.meta;
    expect(location.name).to.eql('Jacksonville, FL, USA');
    expect(location.geo).to.eql([30.3321838, -81.65565099999999]);
  });

  it('should include funding elements', () => {
    const funding = podcastNSExample.meta.funding[0];
    expect(funding.url).to.eql('https://example.com/donate');
    expect(funding.name).to.eql('Support the show!');
  });

  it('should include license element', () => {
    const { license } = podcastNSExample.meta;
    expect(license.url).to.eql('https://creativecommons.org/licenses/by/4.0/');
    expect(license.slug).to.eql('cc-by-4.0');
  });

  it('should include locked element', () => {
    expect(howToStartPodcast.meta.locked).to.equal(false);
    expect(podcastNSExample.meta.locked).to.equal(true);
  });

  it('should include soundbite elements', () => {
    const soundbite = podcastNSExample.episodes[0].soundbite[0];
    expect(soundbite.startTime).to.equal(33.833);
    expect(soundbite.duration).to.equal(60.0);
  });

  it('should include transcript elements', () => {
    const transcripts = howToStartPodcast.episodes[0].transcript;
    expect(transcripts.map(({ url }) => url)).to.be.eql([
      'https://feeds.buzzsprout.com/1/805964/transcript',
      'https://feeds.buzzsprout.com/1/805964/transcript.json',
      'https://feeds.buzzsprout.com/1/805964/transcript.srt',
    ]);
    expect(transcripts.map(({ type }) => type)).to.be.eql([
      'text/html',
      'application/json',
      'application/srt',
    ]);
  });

  it('should include chapters element', () => {
    const chapter = podcastNSExample.episodes[0].chapters;
    expect(chapter.url).to.eql('https://example.com/ep3_chapters.json');
    expect(chapter.type).to.eql('application/json');
  });

  it('should include id element', () => {
    expect(howToStartPodcast.meta.id.platform).to.eql('buzzsprout');
  });

  it('should include medium element', () => {
    expect(howToStartPodcast.meta.medium).to.eql('podcast');
  });

  it('should include gateway element', () => {
    const lastEpisode = howToStartPodcast.episodes[howToStartPodcast.episodes.length - 1];
    expect(lastEpisode.gateway).to.be.an('object');
    expect(lastEpisode.gateway.order).to.eql(1);
    expect(lastEpisode.gateway.text).to.eql('Start here!');
  });

  describe('images tag', () => {
    it('should include images element', () => {
      const lastEpisode = howToStartPodcast.episodes[howToStartPodcast.episodes.length - 1];
      expect(howToStartPodcast.meta.images).not.to.be.empty;
      expect(lastEpisode.images).not.to.be.empty;
    });

    it('should include normalize srcset attribute', () => {
      expect(howToStartPodcast.meta.images.srcset).to.eql('https://example.com/images/ep1/pci_avatar-massive.jpg 1500w,\nhttps://example.com/images/ep1/pci_avatar-middle.jpg 600w,\nhttps://example.com/images/ep1/pci_avatar-small.jpg 300w,\nhttps://example.com/images/ep1/pci_avatar-tiny.jpg 150w');
      expect(podnewsFeed21.meta.images.srcset).to.eql('https://podnews.net/uploads/p3000.png 3000w,\nhttps://podnews.net/static/podnews-2000x2000.png 2000w,\nhttps://podnews.net/uploads/p1000.png 1000w,\nhttps://podnews.net/uploads/p500.png 500w,\nhttps://podnews.net/uploads/p250.png 250w,\nhttps://podnews.net/uploads/p125.png 125w');
    });
  });

  describe('alternateEnclosure tag', () => {
    it('should include the alternateEnclosure element', () => {
      expect(podnewsFeed.episodes[0].alternateEnclosure).to.be.an('array');
    });

    it('should include multiple alternateEnclosures, if present', () => {
      expect(podnewsFeed.episodes[0].alternateEnclosure).not.to.be.empty;
    });

    it('should include alternateEnclosures attributes', () => {
      const enclosure = podnewsFeed.episodes[0].alternateEnclosure[0];
      expect(enclosure.default).to.eql(true);
      expect(enclosure.type).to.eql('audio/aac');
      expect(enclosure.bitrate).to.eql(64000);
      expect(enclosure.length).to.eql(1880380);
    });

    it('should include alternateEnclosures sources', () => {
      const source = podnewsFeed.episodes[0].alternateEnclosure[0].source[0];
      expect(source.uri).to.eql('https://podnews.net/audio/podnews210609.m4a');
    });

    it('shouldn\'t include the alternateEnclosures, if it\'s not present', () => {
      expect(howToStartPodcast.episodes[0]).not.to.have.property('alternateEnclosures');
    });
  });

  describe('trailer tag', () => {
    const podland = getPodcastFromFeed(podland22);
    const podcast = getPodcastFromFeed(sampleFeed);

    it('should include trailer attributes', () => {
      expect(podland.meta.trailer).to.be.an('array');
      expect(podland.meta.trailer[0]).to.be.an('object').that.contains.keys('url', 'title', 'type', 'length', 'season', 'pubDate');
    });

    it('shouldn\'t be present when not included', () => {
      expect(podcast.meta.trailer).to.be.undefined;
    });

    it('should include trailer values', () => {
      const trailer = podland.meta.trailer[0];
      expect(trailer.url).to.eql('https://www.buzzsprout.com/1538779/6749611-all-about-podland-news.mp3');
      expect(trailer.title).to.eql('All about Podland News');
      expect(trailer.pubDate).to.eql('Sat, 28 Nov 2020 09:00:00 +0000');
      expect(trailer.type).to.eql('audio/mpeg');
      expect(trailer.season).to.eql(1);
      expect(trailer.length).to.eql(1250447);
    });
  });
});
