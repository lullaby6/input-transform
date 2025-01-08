const InputTransform = {
    messages: {
        maxImageSize: value => `The maximum image size is ${value} bytes`,
        fileType: value => `Only files with the following extensions are allowed: ${value}`,
    },
    methods: {
        regex: (value, {regex, replace = ''}) => value.replace(regex, replace),
        regexs: (value, regexs) => {
            regexs.forEach(({regex, replace = ''}) => value = value.replaceAll({regex}, replace))
            return value
        },
        minNumber: (value, minNumber) => value ? Math.max(minNumber, parseFloat(value.replaceAll(/\D+/g, ''))) : '',
        maxNumber: (value, maxNumber) => value ? Math.min(maxNumber, parseFloat(value.replaceAll(/\D+/g, ''))) : '',
        uppercase: value => value.toUpperCase(),
        lowercase: value => value.toLowerCase(),
        capitalize: value => value.charAt(0).toUpperCase() + value.slice(1),
        trim: value => value.trim(),
        clearSpaces: value => value.replaceAll(' ', ''),
        clearNumbers: value => value.replaceAll(/\d+/g, ''),
        onlyNumbers: value => value.replaceAll(/\D+/g, ''),
        clearSymbols: value => value.replaceAll(/[^a-zA-Z0-9]/g, ''),
        onlySymbols: value => value.replaceAll(/[a-zA-Z0-9]/g, ''),
        clearLetters: value => value.replaceAll(/[a-zA-Z]/g, ''),
        onlyLetters: value => value.replaceAll(/[^a-zA-Z]/g, ''),
        maxLength: (value, maxLength) => value.slice(0, maxLength),
        clear: (value, clear) => value.replaceAll(clear, ''),
        clears: (value, clears) => {
            clears.split(',').forEach(clear => value = value.replaceAll(clear, ''))
            return value
        },
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

                    input.value = null;
                    input.type = "text";
                    input.type = "file";

                    return;
                }
            }
        },
        maxImageWidth: (value, maxImageWidth, input) => {
            if (!input.files || input.files.length === 0) return
        },
        maxImageHeight: (value, maxImageHeight, input) => {
            if (!input.files || input.files.length === 0) return
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

                    input.value = null
                    input.type = "text";
                    input.type = "file";

                    return
                }
            }
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
        imageBase64: (_, __, input) => {
            if (!input.files || input.files.length === 0) return

            const imagesBase64 = []

            const newInput = InputTransform.getOrCreateHiddenInput(input)

            for (const file of input.files) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    imagesBase64.push(reader.result)

                    newInput.value = imagesBase64.join(',')
                };
                reader.onerror = error => {
                    console.log('Error: ', error);

                    window.dispatchEvent(new CustomEvent('input-transform.error', { detail: {
                        input,
                        file,
                        message: error
                    }}))
                }
            }
        },
        imageBase64Webp: (value, _, input) => {
            if (!input.files || input.files.length === 0) return

            const imagesBase64 = []

            const newInput = InputTransform.getOrCreateHiddenInput(input)

            for (const file of input.files) {
                const fileNameWihtoutExtension = file.name.split('.').slice(0, -1).join('.')

                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    canvas.getContext('2d').drawImage(image, 0, 0);
                    canvas.toBlob((blob) => {
                        const image = new File([blob], `${fileNameWihtoutExtension}.webp`, { type: blob.type });

                        const reader = new FileReader();
                        reader.readAsDataURL(image);
                        reader.onload = () => {
                            imagesBase64.push(reader.result)

                            newInput.value = imagesBase64.join(',')
                        };
                        reader.onerror = error => {
                            console.log('Error: ', error);

                            window.dispatchEvent(new CustomEvent('input-transform.error', { detail: {
                                input,
                                file,
                                message: error
                            }}))
                        }
                    }, 'image/webp');
                };

                image.src = URL.createObjectURL(file);
            }
        },
    },
    methodToAttribute: method => `data-input-transform-${method.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`,
    init: (input, options) => {
        if (!input || !options || typeof options !== 'object' || input.InputTransformInit) return
        if (typeof input === 'string') input = document.querySelector(input)

        input.InputTransformInit = true
        input.InputTransformOptions = options

        input.addEventListener('input', () => {
            let newValue = input.value;

            Object.keys(input.InputTransformOptions).forEach(method => {
                const result = InputTransform.methods[method](newValue, input.InputTransformOptions[method], input);
                if (result !== null && result !== undefined) newValue = result;
            });

            input.value = newValue;
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