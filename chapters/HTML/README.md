# HTML - Structure

HTML stands for **H**yper**T**ext **M**arkup **L**anguage.
It is a declarative language, meaning that it simply describes something, rather than instructing the computer how to do something.
It is the foundation of all websites and is used to structure the page.

## What is it?

A simple HTML document might look like this:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My First HTML Document</title>
    </head>
    <body>
        <h1>Hello, World!</h1>
        <p>This is my first HTML document.</p>
        <button>Click me!</button>
    </body>
</html>
```

HTML documents are made up of elements, which are defined by tags.
Tags are surrounded by angle brackets (< >).

The first tag in the example is `<html>`, which defines the root element of the document.
The root element is the top-level element of the document, and all other elements are nested inside it.

The `<head>` element contains information about the document, such as the document's title.
The `<body>` element contains the content of the document, such as headings (`<h1>`), paragraphs (`<p>`), buttons (`<button>`), and images (`<img>`).

## Example

Open your web browser and use `cmd+O` to open the `index.html` file in your browser, you should see the rendered web page.

Note that nothing will happen when you click the button yet.

## Return

[Return to the top-level README](./../../README.md)
