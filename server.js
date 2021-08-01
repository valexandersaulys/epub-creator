const bodyParser = require("body-parser"); // included with express
const cookieParser = require("cookie-parser");
const cheerio = require("cheerio");
const cors = require("cors");
const csrf = require("csurf");
const express = require("express");
const fs = require("fs");
const got = require("got");
const path = require("path");
const morgan = require("morgan");

const { epubQueue } = require("./queue-def");

const app = express();
const csrfProtection = csrf({ cookie: true });
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "ejs");
app.use("/static", express.static("static"));
app.use("/samples", express.static("samples"));
app.use(morgan("short"));

app.locals.GOOGLE_ANALYTICS = process.env.GOOGLE_ANALYTICS;

const booksDir = process.env.BOOKSDIR || path.join(__dirname, "books");
console.log("Using dir for books: ", booksDir);
console.log("Using code for Google Analytics: ", app.locals.GOOGLE_ANALYTICS);

app.get("/", csrfProtection, async (req, res) => {
  res.render("index", {
    csrfToken: req.csrfToken(),
    msg: req?.query?.msg
  });
});

app.post("/", csrfProtection, (req, res) => {
  const outputFileName = Math.random().toString(16).substr(2, 8);
  if (!req.body.listOfUrls || !req.body.title)
    res.redirect(
      `/?msg=${encodeURIComponent(
        "You forgot to submit either a list of urls or title"
      )}`
    );

  epubQueue.add(
    {
      urlString: req.body.listOfUrls,
      title: req.body.title,
      outputFileName
    },
    { jobId: outputFileName }
  );
  res.redirect(`/h/${outputFileName}`);
});

app.get("/h/:submitId", async (req, res) => {
  const { submitId } = req.params;
  let reply = await epubQueue.getJob(submitId);

  if (!reply) res.render("not_found", { submitId });
  else if (reply.failedReason) res.render("failed", { submitId });
  else if (reply.finishedOn) res.render("success", { submitId });
  else res.render("waiting", { submitId });
});

app.get("/d/:submitId", (req, res, next) => {
  const { submitId } = req.params;
  const bookPath = path.join(booksDir, `${submitId}.epub`);
  if (!fs.existsSync(bookPath)) {
    res
      .status(404)
      .send("ERR0R -- can't find your download, maybe it was deleted?");
    return;
  }
  res.download(bookPath);
  return;
});

app.post("/fetchUrls", async (req, res) => {
  const { urlToFetch } = req.body;
  if (!urlToFetch) {
    return res.send("ERROR: Could not Parse URL -- did you send one?");
  }
  const gotResponse = await got(urlToFetch);
  const $ = cheerio.load(gotResponse.body);
  const links = $("a")
    .map((i, el) => el.attribs.href)
    .toArray()
    .filter((link) => link.match(urlToFetch))
    .join("\n");
  return res.send(links);
});

app.listen({ port: process.env.PORT || 3001 }, () => {
  console.log("Starting server");
});
