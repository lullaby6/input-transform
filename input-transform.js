const InputTransform = {
    messages: {
        maxImageSize: value => `The maximum image size is ${value} bytes`,
        fileType: value => `Only files with the following extensions are allowed: ${value}`,
    },
    methods: {
        regex: (value, regex) => {
            if (typeof regex === 'string' && regex.includes('|')) {
                const [regex_, replace] = regex.split('|');
                regex = new RegExp(regex_, 'g');
                return value.replace(regex, replace || '');
            }

            return value.replace(regex, '');
        },
        regexs: (value, regexs) =>
            regexs.split(',').reduce((acc, pair) => {
                const [regex, replace = ''] = pair.split('|');
                return acc.replace(new RegExp(regex, 'g'), replace);
            }, value),
        minNumber: (value, minNumber) => value ? Math.max(minNumber, parseFloat(value.replaceAll(/\D+/g, ''))) : '',
        maxNumber: (value, maxNumber) => value ? Math.min(maxNumber, parseFloat(value.replaceAll(/\D+/g, ''))) : '',
        uppercase: value => value.toUpperCase(),
        lowercase: value => value.toLowerCase(),
        capitalize: value => value ? value.charAt(0).toUpperCase() + value.slice(1) : '',
        trim: value => value.trim(),
        clearSpaces: value => value.replace(/\s+/g, ''),
        clearNumbers: value => value.replaceAll(/\d+/g, ''),
        onlyNumbers: value => value.replaceAll(/\D+/g, ''),
        clearSymbols: value => value.replaceAll(/[^a-zA-Z0-9]/g, ''),
        onlySymbols: value => value.replaceAll(/[a-zA-Z0-9]/g, ''),
        clearLetters: value => value.replaceAll(/[a-zA-Z]/g, ''),
        onlyLetters: value => value.replaceAll(/[^a-zA-Z]/g, ''),
        maxLength: (value, maxLength) => value.slice(0, maxLength),
        clear: (value, clear) => value.replaceAll(clear, ''),
        clears: (value, clears) => clears.split(',').reduce((acc, clear) => acc.replaceAll(clear, ''), value),
        fileType: (_, fileType, input) => {
            if (!input.files || input.files.length === 0) return

            const fileTypes = fileType.replaceAll(' ', '').split(',')

            for (const file of input.files) {
                if (!fileTypes.some(type => file.name.endsWith(type))) {
                    window.dispatchEvent(new CustomEvent('input-transform.error', {
                        detail: {
                            input,
                            file,
                            message: InputTransform.messages.fileType(fileType),
                        }
                    }));

                    input.dispatchEvent(new CustomEvent('input-transform.error', {
                        detail: {
                            file,
                            message: InputTransform.messages.fileType(fileType),
                        }
                    }));

                    input.value = '';
                    input.type = "text";
                    input.type = "file";

                    return;
                }
            }
        },
        maxImageWidth: (value, maxImageWidth, input) => {
            if (!input.files || input.files.length === 0) return;

            const currentFiles = Array.from(input.files);
            const newFiles = [];

            for (const file of input.files) {
                const img = new Image();
                const objectURL = URL.createObjectURL(file);

                img.onload = () => {
                    if (img.width > maxImageWidth) {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = maxImageWidth;
                        canvas.height = (img.height * maxImageWidth) / img.width;

                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        canvas.toBlob(blob => {
                            if (blob) {
                                const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });

                                newFiles.push(resizedFile);

                                const newDataTransfer = new DataTransfer();
                                newFiles.forEach(newFile => {
                                    newDataTransfer.items.add(newFile);
                                });

                                currentFiles.forEach(existingFile => {
                                    if (existingFile !== file) {
                                        newDataTransfer.items.add(existingFile);
                                    }
                                });

                                input.files = newDataTransfer.files;
                            }
                        }, 'image/jpeg');
                    } else {
                        newFiles.push(file);
                    }

                    URL.revokeObjectURL(objectURL);
                };

                img.onerror = () => {
                    console.error('Error loading image');
                };

                img.src = objectURL;
            }
        },

        maxImageHeight: (value, maxImageHeight, input) => {
            if (!input.files || input.files.length === 0) return;

            const currentFiles = Array.from(input.files);
            const newFiles = [];

            for (const file of input.files) {
                const img = new Image();
                const objectURL = URL.createObjectURL(file);

                img.onload = () => {
                    if (img.height > maxImageHeight) {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.height = maxImageHeight;
                        canvas.width = (img.width * maxImageHeight) / img.height;

                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        canvas.toBlob(blob => {
                            if (blob) {
                                const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });

                                newFiles.push(resizedFile);

                                const newDataTransfer = new DataTransfer();
                                newFiles.forEach(newFile => {
                                    newDataTransfer.items.add(newFile);
                                });

                                currentFiles.forEach(existingFile => {
                                    if (existingFile !== file) {
                                        newDataTransfer.items.add(existingFile);
                                    }
                                });

                                input.files = newDataTransfer.files;
                            }
                        }, 'image/jpeg');
                    } else {
                        newFiles.push(file);
                    }

                    URL.revokeObjectURL(objectURL);
                };

                img.onerror = () => {
                    console.error('Error loading image');
                };

                img.src = objectURL;
            }
        },
        maxImageSize: (_, maxImageSize, input) => {
            if (!input.files || input.files.length === 0) return

            for (const file of input.files) {
                const imageSize = file.size

                if (imageSize > maxImageSize) {
                    window.dispatchEvent(new CustomEvent('input-transform.error', { detail: {
                        input,
                        file,
                        imageSize,
                        message: InputTransform.messages.maxImageSize(maxImageSize),
                    } }));

                    input.dispatchEvent(new CustomEvent('input-transform.error', { detail: {
                        file,
                        imageSize,
                        message: InputTransform.messages.maxImageSize(maxImageSize),
                    }}))

                    input.value = '';
                    input.type = "text";
                    input.type = "file";

                    return
                }
            }
        },
        async imageBase64(_, __, input) {
            if (!input.files || input.files.length === 0) return;

            input.imagesBase64 = input.imagesBase64 || [];
            const newInput = InputTransform.getOrCreateHiddenInput(input);

            for (const file of input.files) {
                try {
                    const base64 = await InputTransform.fileToBase64(file);
                    input.imagesBase64.push(base64);
                    newInput.value = input.imagesBase64.join(',');
                } catch (error) {
                    console.error('Error: ', error);
                    InputTransform.dispatchError(input, file, error);
                }
            }
        },
        async imageBase64Webp(_, __, input) {
            if (!input.files || input.files.length === 0) return;

            input.imagesBase64 = input.imagesBase64 || [];
            const newInput = InputTransform.getOrCreateHiddenInput(input);

            for (const file of input.files) {
                try {
                    const webpBase64 = await InputTransform.convertImageToWebp(file);
                    input.imagesBase64.push(webpBase64);
                    newInput.value = input.imagesBase64.join(',');
                } catch (error) {
                    console.error('Error: ', error);
                    InputTransform.dispatchError(input, file, error);
                }
            }
        },
    },
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject('Error reading file');
            reader.readAsDataURL(file);
        });
    },
    convertImageToWebp(file) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                canvas.getContext('2d').drawImage(image, 0, 0);
                canvas.toBlob(blob => {
                    if (!blob) return reject('Error converting to WebP');
                    InputTransform.fileToBase64(new File([blob], `${file.name}.webp`, { type: 'image/webp' }))
                        .then(resolve)
                        .catch(reject);
                }, 'image/webp');
            };
            image.onerror = () => reject('Error loading image');
            image.src = URL.createObjectURL(file);
        });
    },
    getOrCreateHiddenInput: input => {
        if (input.hasAttribute('name')) {
            const newInput = document.createElement('input');
            newInput.type = 'hidden';
            newInput.name = input.name;

            input.dataset.inputTransformName = newInput.name;
            input.name = null;
            input.removeAttribute('name');

            input.after(newInput);
            return newInput;
        }

        return input.parentElement.querySelector(`[name="${input.dataset.inputTransformName}"]`);
    },
    dispatchError(input, file, message) {
        const errorEvent = new CustomEvent('input-transform.error', { detail: { input, file, message } });
        window.dispatchEvent(errorEvent);
        input.dispatchEvent(errorEvent);
    },
    methodToAttribute: method => `data-input-transform-${method.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`,
    init: (input, options) => {
        if (!input || !options || typeof options !== 'object' || input.InputTransformInit) return
        if (typeof input === 'string') input = document.querySelector(input)

        if (!Object.keys(options).length > 0) return;

        input.InputTransformInit = true
        input.InputTransformOptions = options

        window.dispatchEvent(new CustomEvent('input-transform.init', {
            detail: {
                input,
                options
            }
        }))

        input.dispatchEvent(new CustomEvent('input-transform.init', {
            detail: options
        }))


        input.addEventListener('input', () => {
            let newValue = input.value;

            Object.keys(input.InputTransformOptions).forEach(method => {
                const result = InputTransform.methods[method](newValue, input.InputTransformOptions[method], input);
                if (result !== null && result !== undefined) newValue = result;
            });

            input.value = newValue;

            window.dispatchEvent(new CustomEvent('input-transform.change'), {
                detail: { input }
            })

            input.dispatchEvent(new CustomEvent('input-transform.change'))
        })
    },
    initOne: input => {
        if (typeof input === 'string') input = document.querySelector(input)

        const methods = {}

        Object.keys(InputTransform.methods).forEach(method => {
            const dataset = `inputTransform${method[0].toUpperCase() + method.substring(1)}`

            if (typeof input.dataset[dataset] == 'string' && (InputTransform.methods[method].length > 1 || input.dataset[dataset] !== 'false')) methods[method] = input.dataset[dataset]
        })

        InputTransform.init(input, methods)
    },
    initAll: () => {
        const attributes = Object.keys(InputTransform.methods).map(InputTransform.methodToAttribute)
        const query = `input${attributes.map(a => `[${a}]`).join(',')}`

        document.querySelectorAll(query).forEach(input => {
            const methods = {}

            Object.keys(InputTransform.methods).forEach(method => {
                const dataset = `inputTransform${method[0].toUpperCase() + method.substring(1)}`

                if (typeof input.dataset[dataset] == 'string' && (InputTransform.methods[method].length > 1 || input.dataset[dataset] !== 'false')) methods[method] = input.dataset[dataset]
            })

            InputTransform.init(input, methods)
        })
    }
}