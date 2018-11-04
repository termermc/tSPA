# tSPA
Simple, lightweight Single Page Application (SPA) library

## What does it do?
Basically just loads pages without reloading the page.

## How do I use it?
Place all files in your website's root, and make sure all paths point to index.html.
Then, place all your webpages in pages/, and specify the routes for them in routes.ini.

By default, when a document is loaded, the element that gets replaced with the loaded content is the body. You can change which element gets its content replaced by setting `defaultElement` to a DOM element. For example, place the following code at the bottom of the document body to change the content of the first `<p>` element, instead of the `<body>` element.
```html
<script>
  defaultElement = document.getElementsByTagName("p")[0];
</script>
```

## How lightweight is it?
A lot more lightweight than React.
