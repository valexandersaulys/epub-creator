const { extract } = require("article-parser");
const fs = require("fs");
const Epub = require("epub-gen");
const path = require("path");

const { epubQueue } = require("./queue-def");

const booksDir = process.env.BOOKSDIR || path.join(__dirname, "books");
//const booksDir = "/tmp";
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
          .catch((err) => null)
      )
      .filter((x) => x)
  );
};

const processUrlJob = (job, done) => {
  const listOfUrls = job.data.urlString.split("\n").filter((x) => x);
  const { title, outputFileName } = job.data;
  getData(listOfUrls)
    .then((content) => content.filter((content) => content))
    .then(async (content) => {
      return new Epub(
        { title, author: "_", content },
        path.join(booksDir, `${outputFileName}.epub`)
      ).promise;
    })
    .then(() => {
      const tmpPath = path.join(booksDir, `${outputFileName}.epub`);
      if (fs.existsSync(tmpPath)) return true;
      else throw `Could Not Find Path -- book was not created: ${tmpPath}`;
    })
    .then(() => {
      done();
    })
    .catch((err) => {
      console.error(err);
      done();
    });
};

epubQueue.process(processUrlJob);
