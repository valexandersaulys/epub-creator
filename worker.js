const { extract } = require("article-parser");
const Epub = require("epub-gen");
const path = require("path");

const { epubQueue } = require("./queue-def");

const booksDir = process.env.BOOKSDIR || path.join(__dirname, "books");
console.log("Using dir for books:", booksDir);

const getData = async (listOfUrls) => {
  console.log("extracting the following list of urls", listOfUrls);
  return Promise.all(
    listOfUrls
      .filter((articleUrl) => /^(http|https):\/\/[^ "]+$/.test(articleUrl))
      .map((articleUrl) =>
        extract(articleUrl)
          .then((article) => ({
            title: article.title,
            data: article.content
          }))
          .catch((err) => {
            console.log("error in get URL", articleUrl);
            return;
          })
      )
  );
};

epubQueue.process(function (job, done) {
  const listOfUrls = job.data.urlString.split("\n").filter((x) => x);
  const { title, outputFileName } = job.data;
  getData(listOfUrls).then((content) => {
    content = content.filter((content) => content);
    new Epub(
      { title, author: "vincent", content },
      path.join(booksDir, `${outputFileName}.epub`)
    );
  });

  done();
});
