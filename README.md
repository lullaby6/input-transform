# InputTransform

InputTransform is a lightweight JavaScript library that provides various input transformations, such as formatting text, validating file uploads, and converting images to Base64 or WebP format.

## Installation

### NPM

Install the library using NPM:

```bash
npm i @lullaby6/input-transform
```

### Import

```js
// CommonJS
const InputTransform = require('@lullaby6/input-transform');

// ES Modules
import InputTransform from '@lullaby6/input-transform';
```

### CDN

```html
<script src='https://cdn.jsdelivr.net/gh/lullaby6/input-transform/input-transform.min.js'></script>
```

### Download

<a href="https://cdn.jsdelivr.net/gh/lullaby6/input-transform/input-transform.min.js" target="_blank">Download</a> and include the downloaded file in your project:

```html
<script src="/path/to/input-transform.min.js"></script>
```

## Usage

```js
// Simple example
InputTransform.init('input#username', {
    capitalize: true,
    trim: true,
    maxLength: 20,
})

// Change option
document.getElementById('username').InputTransformOptions.maxLength = 25;

// Initialize image transformations
InputTransform.init('input#image-upload', {
    fileType: 'jpg,png,webp',
    maxImageSize: 500000, // 500 KB
    imageBase64: true // transform the input image to a image in base64 encoded string
});
```

### Using `initOne` and `initAll`

Instead of manually defining transformations in JavaScript, you can use HTML data attributes. The `initOne` method applies transformations based on an element's attributes, while `initAll` applies them to all inputs on the page.

#### Example:

```html
<input type="text" id="username" data-input-transform-max-length="25" data-input-transform-trim="true">
```

```js
InputTransform.initOne('#username');
```
This will automatically trim spaces and limit the input to 25 characters.

Alternatively, to initialize all matching inputs on the page:

```js
InputTransform.initAll();
```
This will apply transformations to all elements that have `data-input-transform-*` attributes.

## API

| Method         | Description | Parameters |
|---------------|-------------|------------|
| `regex` | Applies a regex replacement to the input value. | `regex` (RegExp), `replace` (string, optional) |
| `regexs` | Applies multiple regex replacements. | `regexs` (array of `{ regex, replace }`) |
| `minNumber` | Ensures the number is at least a minimum value. | `minNumber` (number) |
| `maxNumber` | Ensures the number is at most a maximum value. | `maxNumber` (number) |
| `uppercase` | Converts the input to uppercase. | None |
| `lowercase` | Converts the input to lowercase. | None |
| `capitalize` | Capitalizes the first letter of the input. | None |
| `trim` | Removes leading and trailing spaces. | None |
| `clearSpaces` | Removes all spaces from the input. | None |
| `clearNumbers` | Removes all numbers from the input. | None |
| `onlyNumbers` | Removes all non-numeric characters. | None |
| `clearSymbols` | Removes all symbols except letters and numbers. | None |
| `onlySymbols` | Removes all letters and numbers, keeping only symbols. | None |
| `clearLetters` | Removes all letters from the input. | None |
| `onlyLetters` | Removes all non-letter characters. | None |
| `maxLength` | Limits the input to a maximum number of characters. | `maxLength` (number) |
| `clear` | Removes a specific substring. | `clear` (string) |
| `clears` | Removes multiple substrings. | `clears` (comma-separated string) |
| `fileType` | Validates allowed file extensions. | `fileType` (comma-separated string) |
| `maxImageSize` | Restricts file size for uploaded images. | `maxImageSize` (bytes) |
| `imageBase64` | Converts uploaded images to Base64. | None |
| `imageBase64Webp` | Converts uploaded images to WebP format. | None |

## Initialization Methods

| Method       | Description | Parameters |
|-------------|-------------|------------|
| `init` | Initializes an input field with specified transformation methods. | `input` (string or Element), `options` (object) |
| `initOne` | Automatically initializes a single input using data attributes. | `input` (string or Element) |
| `initAll` | Automatically initializes all inputs on the page that have transformation data attributes. | None |

## Events

InputTransform emits custom events that you can listen to:

| Event Name | Description |
|-----------|-------------|
| `input-transform.init` | Triggered when an input transformation is initialized. |
| `input-transform.error` | Triggered when an error occurs (e.g., invalid file type or size). |
| `input-transform.change` | Triggered when the input value is transformed. |

### Example:

```js
document.getElementById('username').addEventListener('input-transform.change', event => {
    console.log('Transformed value:', event.detail.value);
});

window.addEventListener('input-transform.error', event => {
    console.error('Error:', event.detail.message);
})
```

## License

MIT

