# tSPA
Simple, lightweight Single Page Application (SPA) library

## What does it do?
Basically just loads pages without reloading the page.

## How do I use it?
Place all files in your website's root, and make sure all paths point to index.html.
Then, place all your webpages in pages/, and specify the routes for them in routes.ini.

(v1.1)
By default, when a document is loaded, the element that gets replaced with the loaded content is the body. You can change which element gets its content replaced by setting `defaultElement` to a DOM element. For example, place the following code at the bottom of the document body to change the content of the first `<p>` element, instead of the `<body>` element.
```html
<script>
  defaultElement = document.getElementsByTagName("p")[0];
</script>
```

(v1.2)
You can add hooks to page loading events, such as when the page starts loading, is loaded, or if there is an error while loading.
A code example is below.
```js
onPageLoading = function(event) {
  // The path that's being loaded, e.g. /index.html
  console.log(event.url);
  
  // To cancel a page being loaded, return false
  return false;
  // The page will not be loaded now
}
onPageLoaded = function(event) {
  // The full URL of the page loaded, e.g. https://termer.net/helloworld
  console.log("URL: "+event.url);
  // The status returned by the server
  console.log("Status: "+event.status);
  // The content returned by the server, the page's content
  console.log("Content: "+event.content);
}
onPageLoadError = function(event) {
  // The event object here contains all the same fields as onPageLoaded
  alert("Failed to load URL "+event.url+"!\nReturned status: "+event.status");
}
``

## How lightweight is it?
A lot more lightweight than React.
