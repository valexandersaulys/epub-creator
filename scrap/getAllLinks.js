const cheerio = require("cheerio");
const got = require("got");

got("http://racehist.blogspot.com/")
  .then(response => cheerio.load(response.body))
  .then($ => {
    $("a").each((i,link) => {
      console.log(link.attribs.href);
    });
  });