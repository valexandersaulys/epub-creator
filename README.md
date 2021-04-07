# Creating ePub files with NodeJS

To start up, using [`docker-compose`](https://docs.docker.com/compose/).

```shell
# build first
docker-compose build

# then start it up
docker-compose up -d
```

The images take up ~160mb. This is using alpine images so I'm not sure
how I'd cut them down further.

There are some environmental variables present as I'm using the
excellent
[`jwilder/nginx-proxy`](https://hub.docker.com/r/jwilder/nginx-proxy)
to set this up [on my own
server](https://epub-creator.vincentsaulys.com/). You can modify these
to work with your own deployments. They can probably be safely
ignored.

May add [ebook-convert](https://www.npmjs.com/package/ebook-convert)
to this someday so its more directly compatible with the mobi format
for Kindles. 



## Odds & Ends

There's an issue with `img` tag downloads where by it can't always
parse the url right. Not sure why this is so, but I do have a shim of
sorts around line 421 to fix this. 

```javascript
// node_modules/epub-gen/lib/index.js
          $("img").each(function (index, elem) {
            var dir, extension, id, image, mediaType, url;
            url = $(elem).attr("src");
            if (!url) return;
            if (
              (image = self.options.images.find(function (element) {
                return element.url === url;
              }))
            ) {
              id = image.id;
              extension = image.extension;
            } else {
              id = uuid();
              mediaType = mime.getType(url.replace(/\?.*/, ""));
              extension = mime.getExtension(mediaType);
              dir = content.dir;
              self.options.images.push({ id, url, dir, mediaType, extension });
            }
            return $(elem).attr("src", `images/${id}.${extension}`);
          });
//...
```


Libraries in Use

  * [article-parser](https://www.npmjs.com/package/article-parser)
  * [epub-gen](https://www.npmjs.com/package/epub-gen)
  * [bull queue](https://github.com/OptimalBits/bull/tree/master)

