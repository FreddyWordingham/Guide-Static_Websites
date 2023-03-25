# `CSS` - Styling

CSS stands for **C**ascading **S**tyle **S**heets.
Like HTML it is a declarative language.
CSS is a language for describing the presentation of web pages, including colors, layout, and fonts. It allows one to adapt the presentation to different types of devices, such as large screens, small screens, or printers.

## What is CSS?

A simple CSS stylesheet might look like this:

```css
body {
    background-color: #f0f0f0;
    font-family: sans-serif;
}

h1 {
    color: green;
    font-weight: bold;
}

span {
    color: #0000ff;
}
```

Here, we've targeted all the `<h1>` and `<p>` elements using CSS selectors and specified different styles for each.
`background-color` changes the background colour of the element.
The `color` property changes the colour of the text, `font-size` changes the size of the text, and `font-family` changes the font family used for the text.

We can save the code in the snippet above into a file called [`style.css`](./style.css) and then link it to our `HTML` document using the `<link>` tag in the `<head>` element:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>HTML + CSS</title>
        <link rel="stylesheet" href="style.css" />
    </head>
    <body>
        <h1>Hello, again!</h1>
        <p>This is my <span>second</span> HTML document.</p>
        <button>Click me!</button>
    </body>
</html>
```

## Example

Now, if we open up the file [`index.html`](./index.html) in our browser, we should see the rendered web page with styling applied.

## Return

[Return to the top-level README](./../../README.md)
