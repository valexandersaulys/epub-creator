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
          .catch((err) => {
            console.log("error in get URL", articleUrl);
            return;
          })
      )
  );
};

const processUrlJob = (job, done) => {
  const listOfUrls = job.data.urlString.split("\n").filter((x) => x);
  const { title, outputFileName } = job.data;
  getData(listOfUrls)
    .then(async (content) => {
      content = content.filter((content) => content);
      console.log(content);
      // why you no async here?!
      return new Epub(
        { title, author: "_", content },
        path.join(booksDir, `${outputFileName}.epub`)
      ).promise;
    })
    .then(() => {
      console.log(
        "does the path exist?",
        fs.existsSync(path.join(booksDir, `${outputFileName}.epub`))
      );
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
