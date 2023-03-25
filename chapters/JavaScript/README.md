# JavaScript - Interactivity

JavaScript is a high-level, interpreted programming language that is used to create interactive and dynamic websites.

JavaScript is primarily used for client-side web development, meaning that it runs on the user's browser and is responsible for handling user interactions and updating the page in real time.
It is also used for server-side web development through the use of platforms like Node.js.

## What is JavaScript?

A simple `JavaScript` program might look like this:

```js
function say_hello() {
    alert("Hello, World!");
}
```

This defines a simple function called `say_hello` that displays an alert box with the message `"Hello, World!"`.

We can save the above code snippet into a file called `script.js` and include it in our HTML document using a `<script>` element:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>HTML + CSS + JavaScript</title>
        <link rel="stylesheet" href="style.css" />
        <script src="script.js"></script>
    </head>
    <body>
        <h1>Hello, again!</h1>
        <p>This is my second HTML document.</p>
        <button onClick="say_hello()">Click me!</button>
    </body>
</html>
```

We can then trigger this function via the added an `onClick` attribute in the `<button>` element in our HTML document.

## Example

If we open [`index.html`](./index.html) in our browser, we should see the rendered web page with styling applied and an alert box that appears when we click the button.

## Return

[Return to the top-level README](./../../README.md)
