const { epubQueue } = require("./queue-def");

const listOfUrls = `
https://vincentsaulys.com/Getting%20Citrix%20to%20Work%20with%20Linux.html
https://vincentsaulys.com/asdfasdf.xml
`;

epubQueue.add({
  urlString: listOfUrls,
  title: "test run",
  outputFileName: "test-run"
});
