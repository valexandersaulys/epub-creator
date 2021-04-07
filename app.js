const Epub = require("epub-gen");
const { extract } = require("article-parser");

const listOfUrls = `
https://medium.com/@ndaidong/zato-a-powerful-python-based-esb-solution-for-your-soa-5aef67114570
https://ephemeralnewyork.wordpress.com/2021/04/05/what-remains-of-the-sterns-store-on-23rd-street/
`.split("\n");

const getData = async () => {
  return Promise.all(
    listOfUrls
      .filter((articleUrl) => articleUrl) // remove blank lines
      .map((articleUrl) =>
        extract(articleUrl).then((article) => ({
          title: article.title,
          data: article.content
        }))
      )
  );
};

// this works -- had to put a shim in to ignore images that are wonky ~ln421
getData().then((content) => {
  new Epub(
    {
      title: "Test Run of Epub",
      content: content
    },
    "test.epub"
  );
});
