# InputTransform

[desc]

## Installation

#### NPM

Install the library using NPM:

```bash
npm i @lullaby6/input-transform
```

#### Import

```js
// CommonJS
const InputTransform = require('@lullaby6/input-transform');

// ES Modules
import InputTransform from '@lullaby6/input-transform';
```

#### CDN

```html
<script src='https://cdn.jsdelivr.net/gh/lullaby6/input-transform/input-transform.min.js'></script>
```

#### Download

<a href="https://cdn.jsdelivr.net/gh/lullaby6/input-transform/input-transform.min.js" target="_blank">Download</a> and include the downloaded file in your project:

```html
<script src="/path/to/input-transform.min.js"></script>
```

## Usage

```js
// simple example
InputTransform.init('input#username', {
    capitalize: true,
    trim: true,
    maxLength: 20,
})

// change option
document.getElementById('#username').InputTransformOptions.maxLength = 25
```

## API

[api]

## License

MIT

