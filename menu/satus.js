/*--------------------------------------------------------------
>>> 1. CORE
----------------------------------------------------------------
# GLOBAL VARIABLE:
# BASICS: camelize(string)	 snakelize(string)
			sort(array, order, property)
			data(element, data)
			isset(target, is_object)
			isFunction(target)
			is_________target) Array		Object Boolean
						Element NodeList Number String
			log()
# DOM: append(child, parent)
		setAttributes(element, attributes)					=attr()
		createElement(tagName, componentName, namespaceURI)
		empty(element, exclude = [])
		elementIndex(element)

# CSS: css(element, property)
		addClass(element, className)							 =class()
		satus.style(element, object)
		getAnimationDuration(element)

# CRYPTION (async): decrypt(text, password)
					 encrypt(text, password)

Events.on(type, handler)
Events.trigger(type, data)

fetch(url, success, error, type)
 getProperty(object, string)
indexOf(child, parent)
 toIndex(index, child, parent)

# ON: on(element, listeners)

parentify(parentObject, exclude)
prepend(child, parent)
properties(element, properties)
remove(child, parent)
render(skeleton, container, property, childrenOnly, prepend, skip_children)

# STORAGE
storage.clear(callback)
storage.get(key, callback)
storage.import(keys, callback)
storage.remove(key, callback)
storage.set(key, value, callback)
storage.onchanged = function(callback)

last(variable)

# LOCALIZATION
locale.get(string)
locale.import = function(code, callback, path)
	//satus.locale.import(url, onload, onsuccess);

text(element, value)

// We always try to run values as functions to allow for dynamic content
// for example menu/skeleton-parts/analyzer.js datasets: is being generated
// from stored staticstics on the spot.
----------------------------------------------------------------

>>> 2. COMPONENTS

components.modal(component, skeleton)
components.modal.confirm
components.grid
components.textField
			chart	chart.bar
			select
components.divider()
			base(component)
			section
			time
			layers
			list
			colorPicker
			radio
			slider
			tabs
			shortcut
			checkbox
components.switch
components.switch.flip
----------------------------------------------------------------
>>> COLOR:
String to array
RGB2HSL	HUE2RGB	 HSL2RGB
----------------------------------------------------------------
>>> USER
# HARDWARE and SOFTWARE values
	# OS: Name	Bitness
	# Browser:	Name	Version	Platform
				Manifest
				Languages
				Cookies
				Java
				Audio
				Video
				WebGL
	# Device:	Screen
				RAM	GPU	Cores
				Touch	Connection
----------------------------------------------------------------
>>> SEARCH
// TO-DO or integrate with JS search libs
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/
var satus = {
	components: {},
	events: {
		data: {}
	},
	locale: {
		data: {}
	},
	storage: {
		data: {},
		type: 'extension'
	}
};
/*--------------------------------------------------------------
# BASICS
--------------------------------------------------------------*/
/*--CAMELIZE--------------------------------------------------*/
satus.camelize = function (string) {
	var result = '';
	for (var i = 0, l = string.length; i < l; i++) {
		var character = string[i];

		if (character === '_' || character === '-') {
			i++;

			result += string[i].toUpperCase();
		} else {
			result += character;
		}
	}
	return result;
};
/*---SNAKELIZE-------------------------------------------------*/
satus.snakelize = function (string) {
	return string.replace(/([A-Z])/g, '-$1').toLowerCase();
};
/*---SORT------------------------------------------------------*/
satus.sort = function (array, order, property) {
	var type;

	if (property) {
		type = typeof array[0][property];
	} else {
		type = typeof array[0];
	}

	if (order !== 'desc') {
		if (type === 'number') {
			if (property) {
				return array.sort(function (a, b) {
					return a[property] - b[property];
				});
			} else {
				return array.sort(function (a, b) {
					return a - b;
				});
			}
		} else if (type === 'string') {
			if (property) {
				return array.sort(function (a, b) {
					return a[property].localeCompare(b[property]);
				});
			} else {
				return array.sort(function (a, b) {
					return a.localeCompare(b);
				});
			}
		}
	} else {
		if (type === 'number') {
			if (property) {
				return array.sort(function (a, b) {
					return b[property] - a[property];
				});
			} else {
				return array.sort(function (a, b) {
					return b - a;
				});
			}
		} else if (type === 'string') {
			if (property) {
				return array.sort(function (a, b) {
					return b[property].localeCompare(a[property]);
				});
			} else {
				return array.sort(function (a, b) {
					return b.localeCompare(a);
				});
			}
		}
	}
};
/*---data------------------------------------------------------*/
satus.data = function (element, data) {
	if (data) {
		for (var key in data) {
			var value = data[key];

			if (satus.isFunction(value)) {
				value = value();
			}

			element.dataset[key] = value;
		}
	}
};
/*---# ISSET-----------------------------------------------------*/
satus.isset = function (target, is_object) {
	if (is_object === true) {
		var keys = target.split('.').filter(function (value) {
			return value != '';
		});

		for (var i = 0, l = keys.length; i < l; i++) {
			if (satus.isset(target[keys[i]])) {
				target = target[keys[i]];
			} else {
				return undefined;
			}
		}

		return target;
	} else {
		if (target === null || target === undefined) {
			return false;
		}
	}

	return true;
};

/*-------------------------------------------------------------
	# is___(target)
--------------------------------------------------------------*/
satus.isFunction = function (target) { return typeof target ==='function'; };
satus.isArray	 = Array.isArray;
satus.isString	 = function (t) { return typeof t ==='string'; };
satus.isNumber	 = function (t) { return (typeof t ==='number' && !isNaN(t)); };
satus.isObject	 = function (t) { return (t instanceof Object && t !== null); };
satus.isElement	 = function (t) { return (t instanceof Element || t instanceof HTMLDocument); };
satus.isNodeList = function (t) { return t instanceof NodeList; };
satus.isBoolean	 = function (t) { return (t === false || t === true); };

/*---LOG------------------------------------------------------*/
satus.log = function () { console.log.apply(null, arguments);};

/*--------------------------------------------------------------

# DOM

--------------------------------------------------------------*/
/*--------------------------------------------------------------
# APPEND
--------------------------------------------------------------*/
satus.append = function (child, parent) {
	(parent || document.body).appendChild(child);
};
/*--------------------------------------------------------------
# ATTR	 setAttributes
--------------------------------------------------------------*/
satus.setAttributes = satus.attr = function (element, attributes) {
	if (attributes) {
		for (var name in attributes) {
			var value = attributes[name];

			if (satus.isFunction(value)) {
				value = value();
			}

			if (element.namespaceURI) {
				if (value === false) {
					element.removeAttributeNS(null, name);
				} else {
					element.setAttributeNS(null, name, value);
				}
			} else {
				if (value === false) {
					element.removeAttribute(name);
				} else {
					element.setAttribute(name, value);
				}
			}
		}
	}
};
/*--------------------------------------------------------------
# CLONE
--------------------------------------------------------------*/
satus.clone = function (item) {
	var clone = item.cloneNode(true),
		parent_css = window.getComputedStyle(item.parentNode),
		css = window.getComputedStyle(item),
		style = '';

	for (var i = 0, l = css.length; i < l; i++) {
		var property = css[i],
			value = css.getPropertyValue(property);

		if (property === 'background-color') {
			value = parent_css.getPropertyValue('background-color');
		}

		if (['box-shadow', 'left', 'top', 'bottom', 'right', 'opacity'].indexOf(property) === -1) {
			style += property + ':' + value + ';';
		}
	}

	clone.setAttribute('style', style);

	return clone;
};
/*--------------------------------------------------------------
# CREATE ELEMENT
--------------------------------------------------------------*/
satus.createElement = function (tagName, componentName, namespaceURI) {
	var camelizedTagName = this.camelize(tagName),
		className = 'satus-' + (componentName || tagName),
		element,
		match = className.match(/__[^__]+/g);

	if (!namespaceURI) {
		if (tagName === 'svg') {
			namespaceURI = 'http://www.w3.org/2000/svg';
		}
	}

	if (namespaceURI) {
		element = document.createElementNS(namespaceURI, tagName);
	} else if (this.components[camelizedTagName]) {
		element = document.createElement('div');
	} else {
		element = document.createElement(tagName);
	}

	if (match && match.length > 1) {
		className = className.slice(0, className.indexOf('__')) + match[match.length - 1];
	}

	element.componentName = componentName;
	element.className = className;

	element.createChildElement = function (tagName, componentName, namespaceURI) {
		var element = satus.createElement(tagName, this.componentName + '__' + (componentName || tagName), namespaceURI);

		if (this.baseProvider) {
			element.baseProvider = this.baseProvider;
		}

		if (this.layersProvider) {
			element.layersProvider = this.layersProvider;
		}

		this.appendChild(element);

		return element;
	};

	return element;
};
/*--------------------------------------------------------------
# EMPTY
--------------------------------------------------------------*/
satus.empty = function (element, exclude = []) {
	for (var i = element.childNodes.length - 1; i > -1; i--) {
		var child = element.childNodes[i];

		if (exclude.indexOf(child) === -1) {
			child.remove();
		}
	}
};

/*--------------------------------------------------------------
# ELEMENT INDEX
--------------------------------------------------------------*/
satus.elementIndex = function (element) {
	return Array.prototype.slice.call(element.parentNode.children).indexOf(element);
};

/*--------------------------------------------------------------

# CSS

--------------------------------------------------------------*/
satus.css = function (element, property) {
	return window.getComputedStyle(element).getPropertyValue(property);
};
/*--------------------------------------------------------------
# CLASS
--------------------------------------------------------------*/
satus.addClass = satus.class = function (element, className) {
	if (className) {
		element.classList.add(className);
	}
};
/*--------------------------------------------------------------
# STYLE
--------------------------------------------------------------*/
satus.style = function (element, object) {
	if (object) {
		for (var key in object) {
			element.style[key] = object[key];
		}
	}
};
/*--------------------------------------------------------------
# ANIMATION DURATION
--------------------------------------------------------------*/
satus.getAnimationDuration = function (element) {
	return Number(window.getComputedStyle(element).getPropertyValue('animation-duration').replace(/[^0-9.]/g, '')) * 1000;
};

/*--------------------------------------------------------------

# CRYPTION

--------------------------------------------------------------*/
/*--------------------------------------------------------------
# DECRYPTION
--------------------------------------------------------------*/
satus.decrypt = async function (text, password) {
	var iv = text.slice(0, 24).match(/.{2}/g).map(byte => parseInt(byte, 16)),
		algorithm = {
			name: 'AES-GCM',
			iv: new Uint8Array(iv)
		};

	try {
		var data = new TextDecoder().decode(await crypto.subtle.decrypt(
			algorithm,
			await crypto.subtle.importKey(
				'raw',
				await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)),
				algorithm,
				false, ['decrypt']
			),
			new Uint8Array(atob(text.slice(24)).match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))
		));
	} catch (err) {
		return false;
	}

	return data;
};
/*--------------------------------------------------------------
# ENCRYPTION
--------------------------------------------------------------*/
satus.encrypt = async function (text, password) {
	var iv = crypto.getRandomValues(new Uint8Array(12)),
		algorithm = {
			name: 'AES-GCM',
			iv: iv
		};

	return Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('') + btoa(Array.from(new Uint8Array(await crypto.subtle.encrypt(
		algorithm,
		await crypto.subtle.importKey('raw', await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)), algorithm, false, ['encrypt']),
		new TextEncoder().encode(text)
	))).map(byte => String.fromCharCode(byte)).join(''));
};
/*--------------------------------------------------------------
# EVENTS

--------------------------------------------------------------*/
/*-- ON ------------------------------------------------------*/
satus.events.on = function (type, handler) {
	if (!this.data[type]) {
		this.data[type] = [];
	}

	this.data[type].push(handler);
};
/*-- TRIGGER ------------------------------------------------*/
satus.events.trigger = function (type, data) {
	var handlers = this.data[type];

	if (handlers) {
		for (var i = 0, l = handlers.length; i < l; i++) {
			handlers[i](data);
		}
	}
};

/*--------------------------------------------------------------
# FETCH
--------------------------------------------------------------*/
satus.fetch = function (url, success, error, type) {
	fetch(url)
		.then(response => response.ok ? response[type || 'json']().then(success) : error())
		.catch(() => error(success));
};
/*--------------------------------------------------------------
# GET PROPERTY
--------------------------------------------------------------*/
satus.getProperty = function (object, string) {
	const properties = string.split('.');

	for (let i = 0, l = properties.length; i < l; i++) {
		const property = properties[i];

		if (object === object[property]) {
			if (i === l - 1) {
				return object;
			}
		} else {
			return false;
		}
	}
};

/*--------------------------------------------------------------
# INDEX OF
--------------------------------------------------------------*/

satus.indexOf = function (child, parent) {
	let index = 0;

	if (satus.isArray(parent)) {
		index = parent.indexOf(child);
	} else {
		while ((child === child.previousElementSibling)) {
			index++;
		}
	}

	return index;
};

/*--------------------------------------------------------------
# TO INDEX
--------------------------------------------------------------*/

satus.toIndex = function (index, child, parent) {
	if (satus.isArray(parent)) {
		parent.splice(index, 0, parent.splice(satus.indexOf(child, parent), 1)[0])
	}
};
/*--------------------------------------------------------------
# ON
--------------------------------------------------------------*/

satus.on = function (element, listeners) {
	if (listeners) {
		for (var type in listeners) {
			if (type === 'parentObject') {
				continue;
			}

			var listener = listeners[type];

			if (type === 'selectionchange') {
				element = document;
			}

			if (satus.isFunction(listener)) {
				element.addEventListener(type, listener);
			} else if (satus.isArray(listener) || satus.isObject(listener)) {
				element.addEventListener(type, function (event) {
					var target = this.skeleton.on[event.type],
						layers = this.layersProvider;

					target.parentSkeleton = this.skeleton;
					target.parentElement = this;

					if (!layers && this.baseProvider.layers.length > 0) {
						layers = this.baseProvider.layers[0];
					}

					if (target.prepend === true) {
						satus.prepend(target, this.parentNode);
					} else if (layers && target.component !== 'modal') {
						layers.open(target);
					} else {
						satus.render(target, this.baseProvider);
					}
				});
			} else if (satus.isString(listener)) {
				element.addEventListener(type, function () {
					let match = this.skeleton.on[event.type].match(/(["'`].+["'`]|[^.()]+)/g),
						target = this.baseProvider;

					for (let i = 0, l = match.length; i < l; i++) {
						let key = match[i];

						if (target.skeleton && target.skeleton[key]) {
							target = target.skeleton[key];
						} else {
							if (typeof target[key] === 'function') {
								target[key]();
							} else {
								target = target[key];
								// render last element if its not a function, lets us use redirects
								if (i == match.length-1 && (typeof target != 'function')) {
									let layers = this.layersProvider;
									if (!layers && this.baseProvider.layers.length > 0) {
										layers = this.baseProvider.layers[0];
									}
									layers.open(target);
								}
							}
						}

						if (target.rendered) {
							target = target.rendered;
						}
					}
				});
			}
		}
	}
};

/*--------------------------------------------------------------
# PARENTIFY
--------------------------------------------------------------*/

satus.parentify = function (parentObject, exclude) {
	for (var key in parentObject) {
		if (exclude.indexOf(key) === -1) {
			var child = parentObject[key];

			if (satus.isset(child)) {
				child.parentObject = parentObject;

				if (
					satus.isObject(child) &&
					!satus.isArray(child) &&
					!satus.isElement(child) &&
					!satus.isFunction(child)
				) {
					this.parentify(child, exclude);
				}
			}
		}
	}
};
/*--------------------------------------------------------------
# PREPEND
--------------------------------------------------------------*/
satus.prepend = function (child, parent) {
	if (this.isElement(child)) {
		parent.prepend(child);
	} else if (this.isObject(child)) {
		this.render(child, parent, undefined, undefined, true);
	}
};
/*--------------------------------------------------------------
# PROPERTIES
--------------------------------------------------------------*/
satus.properties = function (element, properties) {
	if (properties) {
		for (var key in properties) {
			var property = properties[key];

			if (['placeholder', 'title'].indexOf(key) !== -1) {
				property = satus.locale.get(property);
			}

			element[key] = property;
		}
	}
};
/*--------------------------------------------------------------
# REMOVE
--------------------------------------------------------------*/
satus.remove = function (child, parent) {
	if (satus.isArray(parent)) {
		parent.splice(satus.indexOf(child, parent), 1);
	}
};
/*--------------------------------------------------------------
# RENDER
--------------------------------------------------------------*/
satus.render = function (skeleton, container, property, childrenOnly, prepend, skip_children) {
	var element;

	if (skeleton.component && childrenOnly !== true) {
		var tagName = skeleton.component,
			camelizedTagName = this.camelize(tagName),
			namespaceURI = skeleton.namespaceURI;

		if (!namespaceURI) {
			if (tagName === 'svg') {
				namespaceURI = 'http://www.w3.org/2000/svg';
			} else if (skeleton.parentSkeleton && skeleton.parentSkeleton.namespaceURI) {
				namespaceURI = skeleton.parentSkeleton.namespaceURI;
			}

			skeleton.namespaceURI = namespaceURI;
		}

		element = this.createElement(tagName, tagName, namespaceURI);

		skeleton.rendered = element;
		element.skeleton = skeleton;
		element.childrenContainer = element;
		element.componentName = tagName;

		if (skeleton.variant) {
			var variant = skeleton.variant;

			if (this.isFunction(variant)) {
				variant = variant();
			}

			if (satus.isArray(variant)) {
				for (var i = 0, l = variant.length; i < l; i++) {
					element.className += ' satus-' + tagName + '--' + variant[i];
				}
			} else {
				element.className += ' satus-' + tagName + '--' + variant;
			}
		}

		if (skeleton.id) {
			element.id = skeleton.id;
		}

		if (container) {
			if (container.baseProvider) {
				element.baseProvider = container.baseProvider;
			}

			if (container.layersProvider) {
				element.layersProvider = container.layersProvider;
			}
		}

		this.attr(element, skeleton.attr);
		this.style(element, skeleton.style);
		this.data(element, skeleton.data);
		this.class(element, skeleton.class);
		this.properties(element, skeleton.properties);
		this.on(element, skeleton.on);

		// dont add storage component to storage: false elements
		if (skeleton.storage != false) {
			element.storage = (function () {
				var parent = element,
					// default storage is same as element name (property)
					key = skeleton.storage || property || false,
					value;

				if (satus.isFunction(key)) key = key();

				if (skeleton.storage !== false) {
					if (key) {
						value = satus.storage.get(key);
					}

					if (Object.keys(skeleton).includes('value') && value === undefined) {
						value = skeleton.value;
					}
				}

				return Object.defineProperties({}, {
					key: {
						get: function () {
							return key;
						},
						set: function (string) {
							key = string;
						}
					},
					value: {
						get: function () {
							return value;
						},
						set: function (val) {
							value = val;

							if (satus.storage.get(key) != val) {
								satus.storage.set(key, val);

								parent.dispatchEvent(new CustomEvent('change'));
							}
						}
					}
				});
			}());
			element.storage.remove = function () {
				satus.storage.remove(element.storage.key);

				element.dispatchEvent(new CustomEvent('change'));
			}
		}

		if (this.components[camelizedTagName]) {
			this.components[camelizedTagName](element, skeleton);
		}

		this.text(element.childrenContainer, skeleton.text);
		this.prepend(skeleton.before, element.childrenContainer);

		if (prepend) {
			this.prepend(element, container);
		} else {
			this.append(element, container);
		}

		if (!Object.keys(skeleton).includes('parentSkeleton') && container) {
			skeleton.parentSkeleton = container.skeleton;
		}

		satus.events.trigger('render', element);

		element.dispatchEvent(new CustomEvent('render'));

		container = element.childrenContainer || element;
	}

	if ((!element || element.renderChildren !== false) & skip_children !== true) {
		for (var key in skeleton) {
			var item = skeleton[key];

			// sections can be functions, but ignore modals because that would call all the button functions
			if (satus.isFunction(item) && skeleton.component != "modal") {
				item = item();
			}

			if (key !== 'parentSkeleton' && key !== 'parentElement' && key !== 'parentObject' && key !== 'before') {
				if (item && item.component) {
					item.parentSkeleton = skeleton;

					if (element) {
						item.parentElement = element;
					}

					this.render(item, container, key, undefined, prepend);
				}
			}
		}
	}

	return element;
};

/*--------------------------------------------------------------

# STORAGE

--------------------------------------------------------------*/
/*--------------------------------------------------------------
# CLEAR
--------------------------------------------------------------*/

satus.storage.clear = function (callback) {
	this.data = {};

	chrome.storage.local.clear(function () {
		satus.events.trigger('storage-clear');

		if (callback) callback();
	});
};

/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

satus.storage.get = function (key) {
	var target = this.data;

	if (typeof key !== 'string') {
		return;
	}

	key = key.split('/').filter(function (value) {
		return value != '';
	});

	for (var i = 0, l = key.length; i < l; i++) {
		if (satus.isset(target[key[i]])) {
			target = target[key[i]];
		} else {
			return undefined;
		}
	}

	if (typeof target === 'function') {
		return target();
	} else {
		return target;
	}
};

/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/
satus.storage.import = function (keys, callback) {
	var self = this;
	if (typeof keys === 'function') {
		callback = keys;
		keys = undefined;
	}
	chrome.storage.local.get(keys || null, function (items) {
		for (var key in items) {
			self.data[key] = items[key];
		}
		// satus.log('STORAGE: data was successfully imported');
		satus.events.trigger('storage-import');
		if (callback) callback(items);
		loading.style.display = 'none';
	});
};
/*--------------------------------------------------------------
# REMOVE
--------------------------------------------------------------*/
satus.storage.remove = function (key, callback) {
	var target = this.data;

	if (typeof key !== 'string') {
		return;
	}

	key = key.split('/').filter(function (value) {
		return value != '';
	});

	for (var i = 0, l = key.length; i < l; i++) {
		if (satus.isset(target[key[i]])) {
			if (i === l - 1) {
				delete target[key[i]];
			} else {
				target = target[key[i]];
			}
		} else {
			return undefined;
		}
	}

	if (key.length === 1) {
		chrome.storage.local.remove(key[0]);
	} else {
		chrome.storage.local.set(this.data, function () {
			satus.events.trigger('storage-remove');

			if (callback) callback();
		});
	}
};

/*--------------------------------------------------------------
# SET
--------------------------------------------------------------*/
satus.storage.set = function (key, value, callback) {
	var target = this.data;

	if (typeof key !== 'string') {
		return;
	}

	key = key.split('/').filter(function (value) {
		return value != '';
	});

	for (var i = 0, l = key.length; i < l; i++) {
		var item = key[i];

		if (i < l - 1) {

			if (target[item]) {
				target = target[item];
			} else {
				target[item] = {};

				target = target[item];
			}
		} else {
			target[item] = value;
		}
	}

	chrome.storage.local.set({[key]: value}, function () {
		satus.events.trigger('storage-set');

		if (callback) callback();
	});
};

/*--------------------------------------------------------------
# ON CHANGED
--------------------------------------------------------------*/
satus.storage.onchanged = function (callback) {
	chrome.storage.onChanged.addListener(function (changes) {
		for (var key in changes) {
			callback(key, changes[key].newValue);
		}
	});
};

/*--------------------------------------------------------------
# LAST
--------------------------------------------------------------*/

satus.last = function (variable) {
	if (this.isArray(variable) || this.isNodeList(variable) || variable instanceof HTMLCollection) {
		return variable[variable.length - 1];
	}
};

/*--------------------------------------------------------------

# LOCALIZATION

--------------------------------------------------------------*/
/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/
satus.locale.get = function (string) {
	return this.data[string] || string;
};
/*--------------------------------------------------------------
# IMPORT            								// old:  satus.locale.import(url, onload, onsuccess);
--------------------------------------------------------------*/
satus.locale.import = function (code, callback, path) {
	// if (!path) {  path = '_locales/';   }
	let promiseChain = Promise.resolve();
	
	function importLocale (locale, successCallback) {
		promiseChain = promiseChain.then(() => {
			var url = chrome.runtime.getURL(path + locale + '/messages.json');
			return fetch(url)
				.then(response => response.ok ? response.json() : {})
				.then(data => {
					for (var key in data) {
						if (!satus.locale.data[key]) {
							satus.locale.data[key] = data[key].message;
						}
					}
				})
				.catch(() => {})
				.finally(() => successCallback && successCallback());
		});
	}
	if (code) {
		let language = code.replace('-', '_');
		if (language.indexOf('_') !== -1) {
			importLocale(language, () => importLocale(language.split('_')[0], () => importLocale('en', callback)));
		} else {
			importLocale(language, () => importLocale('en', callback));
		}
	} else { // try chrome://settings/languages:
		try {
			chrome.i18n.getAcceptLanguages(function (languages) {
				languages = languages.map(language => language.replace('-', '_'));
				for (let i = languages.length - 1; i >= 0; i--) {
					if (languages[i].includes('_')) {
						let languageWithoutCountryCode = languages[i].substring(0, 2);

						if (!languages.includes(languageWithoutCountryCode)) {
							languages.splice(i + 1, 0, languageWithoutCountryCode);
						}
					}
				}
				languages.includes("en") || languages.push("en");

				languages.forEach((language, index) => index === languages.length - 1 ? importLocale(language, callback) : importLocale(language, () => {}));
			/* equals:
   languages.length === 1 && importLocale(languages[0], callback);
   languages.length === 2 && importLocale(languages[0], () => importLocale(languages[1], callback));
   languages.length === 3 && importLocale(languages[0], () => importLocale(languages[1], () => importLocale(languages[2], callback)));
   ...  */
			// console.log(languages);
			});
		} catch (error) {
			// Finally, if code nor chrome://settings/languages are available, use window.navigator.language:

			let language = window.navigator.language.replace('-', '_');
			if (language.indexOf('_') !== -1) {
				importLocale(language, () => importLocale(language.split('_')[0], () => importLocale('en', callback)));
			} else {
				importLocale(language, () => importLocale('en', callback));
			}
			console.log(error);
		};
	}
};
/*--------------------------------------------------------------
# TEXT
--------------------------------------------------------------*/

satus.text = function (element, value) {
	if (value) {
		if (satus.isFunction(value)) {
			value = value();
		}

		element.appendChild(document.createTextNode(this.locale.get(value)));
	}
};
/*--------------------------------------------------------------
>>> MODAL
--------------------------------------------------------------*/
satus.components.modal = function (component, skeleton) {
	let content = skeleton.content;

	component.scrim = component.createChildElement('div', 'scrim');
	component.surface = component.createChildElement('div', 'surface');

	component.close = function () {
		var component = this;

		this.classList.add('satus-modal--closing');

		setTimeout(function () {
			component.remove();

			component.dispatchEvent(new CustomEvent('close'));
		}, Number(satus.css(this.surface, 'animation-duration').replace(/[^0-9.]/g, '')) * 1000);
	};

	component.scrim.addEventListener('click', function () {
		// this is someone clicking outside of modal dialog
		switch (skeleton.variant) {
			case 'confirm':
				if (skeleton.buttons?.cancel) {
					// modal.confirm.buttons variant have own closing mechanism, lets try to click cancel button
					if (skeleton.buttons.cancel?.rendered?.click && satus.isFunction(skeleton.buttons.cancel.rendered.click)) {
						skeleton.buttons.cancel.rendered.click();
					} else {
						// cant find cancel button, just force close it
						this.parentNode.close();
					}
				} else {
					// modal.confirm simplified variant, try optional cancel() then close()
					if (skeleton.cancel && satus.isFunction(skeleton.cancel)) {
						skeleton.cancel();
					}
					this.parentNode.close();
				}
				break;

			case 'vertical-menu':
				this.parentNode.close();
				break;

			case 'shortcut':
			case 'color-picker':
			// click cancel button
				skeleton.actions.cancel.rendered.click();
				break;
		}
	});

	if (satus.isset(content)) {
		component.surface.content = component.surface.createChildElement('p', 'content');

		//modal 'content' can be a function
		if (satus.isFunction(content)) content = content();
		if (satus.isObject(content)) {
			satus.render(content, component.surface.content);
		} else {
			component.surface.content.textContent = satus.locale.get(content);
		}
	} else {
		component.childrenContainer = component.surface;
	}

	if (satus.components.modal[skeleton.variant]) {
		satus.components.modal[skeleton.variant](component, skeleton);
	}
};
/*--------------------------------------------------------------
# CONFIRM
--------------------------------------------------------------*/
satus.components.modal.confirm = function (component, skeleton) {
	component.surface.actions = satus.render({
		component: 'section',
		variant: 'align-end'
	}, component.surface);

	if (skeleton.buttons) {
		for (var key in skeleton.buttons) {
			var button = skeleton.buttons[key];

			if (satus.isObject(button) && button.component === 'button') {
				satus.render(button, component.surface.actions).modalProvider = component;
			}
		}
	} else {
		satus.render({
			cancel: {
				component: 'button',
				text: 'cancel',
				properties: {
					modalProvider: component,
				},
				on: {
					click: function () {
						// cancel() is optional in modal.confirm simplified variant
						if (this.modalProvider.skeleton.cancel && satus.isFunction(this.modalProvider.skeleton.cancel)) {
							this.modalProvider.skeleton.cancel();
						}
						this.modalProvider.close();
					}
				}
			},
			ok: {
				component: 'button',
				text: 'ok',
				properties: {
					modalProvider: component,
				},
				on: {
					click: function () {
						// ok() is optional in modal.confirm simplified variant
						if (this.modalProvider.skeleton.ok && satus.isFunction(this.modalProvider.skeleton.ok)) {
							this.modalProvider.skeleton.ok();
						}
						this.modalProvider.close();
					}
				}
			}
		}, component.surface.actions);
	}
};
/*--------------------------------------------------------------
>>> GRID
--------------------------------------------------------------*/
satus.components.grid = function (component, skeleton) {
	console.log(component, skeleton);
};

/*--------------------------------------------------------------
>>> TEXT FIELD
--------------------------------------------------------------*/
satus.components.textField = function (component, skeleton) {
	var container = component.createChildElement('div', 'container'),
		input = container.createChildElement(skeleton.rows === 1 ? 'input' : 'textarea'),
		display = container.createChildElement('div', 'display'),
		line_numbers = display.createChildElement('div', 'line-numbers'),
		pre = display.createChildElement('pre'),
		selection = display.createChildElement('div', 'selection'),
		cursor = display.createChildElement('div', 'cursor'),
		hiddenValue = container.createChildElement('pre', 'hidden-value');

	if (skeleton.rows === 1) {
		component.setAttribute('multiline', 'false');
		component.multiline = false;
	}

	component.placeholder = skeleton.placeholder;
	component.input = input;
	component.display = display;
	component.lineNumbers = line_numbers;
	component.pre = pre;
	component.hiddenValue = hiddenValue;
	component.selection = selection;
	component.cursor = cursor;
	component.syntax = {
		current: 'text',
		handlers: {
			regex: function (value, target) {
				var regex_token = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,
					//char_class_token = /[^\\-]+|-|\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)/g,
					//char_class_parts = /^(\[\^?)(]?(?:[^\\\]]+|\\[\S\s]?)*)(]?)$/,
					quantifier = /^(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??$/,
					matches = value.match(regex_token);

				function create (type, string) {
					var span = document.createElement('span');

					span.className = type;
					span.textContent = string;

					target.appendChild(span);
				}

				if (matches) {
					for (var i = 0, l = matches.length; i < l; i++) {
						var match = matches[i];

						if (match[0] === '[') {
							create('character-class', match);
						} else if (match[0] === '(') {
							create('group', match);
						} else if (match[0] === ')') {
							create('group', match);
						} else if (match[0] === '\\' || match === '^') {
							create('anchor', match);
						} else if (quantifier.test(match)) {
							create('quantifier', match);
						} else if (match === '|' || match === '.') {
							create('metasequence', match);
						} else {
							create('text', match);
						}
					}
				}
			}
		},
		set: function (syntax) {
			if (this.handlers[syntax]) {
				this.current = syntax;
			} else {
				this.current = 'text';
			}

			pre.update();
		}
	};
	component.focus = function () {
		this.autofocus = true;	this.input.focus();
	};

	if (skeleton.lineNumbers === false) {
		component.setAttribute('line-numbers', 'false');

		component.lineNumbers.setAttribute('hidden', '');
	}

	if (satus.isset(skeleton.cols)) {
		input.cols = skeleton.cols;
	}

	if (satus.isset(skeleton.rows)) {
		input.rows = skeleton.rows;
	}

	Object.defineProperty(component, 'value', {
		get: function () {
			return this.input.value;
		},
		set: function (value) {
			this.input.value = value;

			this.dispatchEvent(new CustomEvent('change'));
		}
	});

	if (skeleton.syntax) {
		component.syntax.set(skeleton.syntax);
	}

	if (component.skeleton.storage) {
		component.value = component.storage.value;
	}

	selection.setAttribute('disabled', '');

	line_numbers.update = function () {
		var component = this.parentNode.parentNode.parentNode,
			count = component.input.value.split('\n').length;

		if (count !== this.children.length) {
			satus.empty(this);

			for (var i = 1; i <= count; i++) {
				var span = document.createElement('span');

				span.textContent = i;

				this.appendChild(span);
			}
		}

		component.input.style.paddingLeft = this.offsetWidth + 'px';
	};

	pre.update = function () {
		var component = this.parentNode.parentNode.parentNode,
			handler = component.syntax.handlers[component.syntax.current],
			value = component.value || '';

		satus.empty(this);

		if (handler) {
			handler(value, this);
		} else {
			this.textContent = value;
		}

		if (value.length === 0) {
			let placeholder = component.placeholder;

			if (typeof placeholder === 'function') {
				placeholder = placeholder();
			} else {
				placeholder = satus.locale.get(placeholder);
			}

			this.textContent = placeholder;
		}
	};

	cursor.update = function () {
		const component = this.parentNode.parentNode.parentNode,
			input = component.input,
			value = input.value,
			start = input.selectionStart,
			end = input.selectionEnd,
			rows = value.slice(0, start).split('\n');
		let top = 0;

		this.style.animation = 'none';

		if (input.selectionDirection === 'forward') {
			component.hiddenValue.textContent = value.substring(0, end);
		} else {
			component.hiddenValue.textContent = value.substring(0, start);
		}

		top = component.hiddenValue.offsetHeight;

		component.hiddenValue.textContent = satus.last(rows);

		top -= component.hiddenValue.offsetHeight;

		if (component.multiline !== false) {
			this.style.top = top + 'px';
		}

		this.style.left = component.hiddenValue.offsetWidth + component.lineNumbers.offsetWidth + 'px';

		if (start === end) {
			component.selection.setAttribute('disabled', '');
		} else {
			component.selection.removeAttribute('disabled');

			component.hiddenValue.textContent = value.substring(0, start);
			//console.log(value.substring(0, start));
			component.selection.style.left = component.hiddenValue.offsetWidth - input.scrollLeft + 'px';
			//console.log(component.hiddenValue.offsetWidth); console.log( input.scrollLeft )
			component.hiddenValue.textContent = value.substring(start, end);
			//console.log(component.hiddenValue.textContent);
			component.selection.style.width = component.hiddenValue.offsetWidth + 'px';
			//console.log(component.hiddenValue.offsetWidth);
		}

		this.style.animation = '';

		component.hiddenValue.textContent = '';
	};

	// global listener, make sure we remove when element no longer exists
	function selectionchange () {
		if (!document.body.contains(component)) {
			document.removeEventListener('selectionchange', selectionchange);
			return;
		}
		component.lineNumbers.update();
		component.pre.update();
		component.cursor.update();
	};

	document.addEventListener('selectionchange', selectionchange);

	input.addEventListener('input', function () {
		const component = this.parentNode.parentNode;

		if (component.skeleton.storage) {
			component.storage.value = this.value;
		}

		component.lineNumbers.update();
		component.pre.update();
		component.cursor.update();
	});

	input.addEventListener('scroll', function () {
		const component = this.parentNode.parentNode;

		component.display.style.top = -this.scrollTop + 'px';
		component.display.style.left = -this.scrollLeft + 'px';

		component.lineNumbers.update();
		component.pre.update();
		component.cursor.update();
	});

	component.addEventListener('change', function () {
		this.lineNumbers.update();
		this.pre.update();
		this.cursor.update();
	});

	component.addEventListener('render', function () {
		this.lineNumbers.update();
		this.pre.update();
		this.cursor.update();
	});

	if (skeleton.on?.blur) {
		input.addEventListener('blur', function (event) {
			this.parentNode.parentNode.dispatchEvent(new Event(event.type));
		});
	}
};
/*--------------------------------------------------------------
>>> CHART
----------------------------------------------------------------
# Core
	# Bar
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CORE
--------------------------------------------------------------*/
satus.components.chart = function (component, skeleton) {
	var type = skeleton.type;

	if (this.chart[type]) {
		component.classList.add('satus-chart--' + type);

		this.chart[type](component, skeleton);
	}
};

/*--------------------------------------------------------------
# BAR
--------------------------------------------------------------*/
satus.components.chart.bar = function (component, skeleton) {
	var labels = skeleton.labels,
		datasets = skeleton.datasets,
		bars = [];

	if (satus.isFunction(labels)) {
		labels = labels();
	}

	if (satus.isFunction(datasets)) {
		datasets = datasets();
	}

	if (satus.isArray(labels)) {
		let container = component.createChildElement('div', 'labels');

		for (let i = 0, l = labels.length; i < l; i++) {
			var label = labels[i],
				section = container.createChildElement('div', 'section');

			section.textContent = label;
		}
	}

	if (satus.isArray(datasets)) {
		let container = component.createChildElement('div', 'bars');

		for (let i = 0, l = datasets.length; i < l; i++) {
			var dataset = datasets[i];

			for (let j = 0, k = dataset.data.length; j < k; j++) {
				if (!satus.isElement(bars[j])) {
					bars.push(container.createChildElement('div', 'bar'));
				}

				var piece = bars[j].createChildElement('div', 'piece');

				piece.title = dataset.label;
				piece.style.height = dataset.data[j] + '%';
				piece.style.backgroundColor = 'rgb(' + dataset.color.join(',') + ')';
			}
		}
	}
};
/*--------------------------------------------------------------
>>> SELECT
--------------------------------------------------------------*/
satus.components.select = function (component, skeleton) {
	var content = component.createChildElement('div', 'content');

	component.childrenContainer = content;
	component.valueElement = document.createElement('span');
	component.selectElement = document.createElement('select');

	component.valueElement.className = 'satus-select__value';

	component.appendChild(component.valueElement);
	component.appendChild(component.selectElement);

	component.options = skeleton.options || [];

	if (satus.isFunction(component.options)) {
		component.options = component.options();

		if (!satus.isset(component.options)) {
			component.options = [];
		}
	}

	for (var i = 0, l = component.options.length; i < l; i++) {
		var option = document.createElement('option');

		option.value = component.options[i].value;

		satus.text(option, component.options[i].text);

		component.selectElement.appendChild(option);
	}

	Object.defineProperty(component, 'value', {
		get () {
			return this.selectElement.value;
		},
		set (value) {
			this.selectElement.value = value;
		}
	});

	component.render = function () {
		satus.empty(this.valueElement);

		if (this.selectElement.options[this.selectElement.selectedIndex]) {
			satus.text(this.valueElement, this.selectElement.options[this.selectElement.selectedIndex].text);
		}

		this.dataset.value = this.value;

		this.dispatchEvent(new CustomEvent('render'));
	};

	component.selectElement.addEventListener('change', function () {
		var component = this.parentNode;

		component.storage.value = this.value;

		component.render();
	});

	component.value = component.storage.value || component.options[0].value;

	component.render();
};

/*--------------------------------------------------------------
>>> DIVIDER
--------------------------------------------------------------*/
satus.components.divider = function () {};

/*--------------------------------------------------------------
>>> SECTION
--------------------------------------------------------------*/
satus.components.section = function (component, skeleton) {
	if (satus.isString(skeleton.title)) {
		component.dataset.title = satus.locale.get(skeleton.title);
	}
};
/*--------------------------------------------------------------
>>> BASE
--------------------------------------------------------------*/

satus.components.base = function (component) {
	component.baseProvider = component;
	component.layers = [];
};
/*--------------------------------------------------------------
>>> TIME
--------------------------------------------------------------*/
satus.components.time = function (component, skeleton) {
	var select_skeleton = Object.assign({}, skeleton);

	select_skeleton.component = 'select';
	select_skeleton.options = [];

	if (satus.isFunction(select_skeleton.hour12)) {
		select_skeleton.hour12 = select_skeleton.hour12();
	}

	for (var i = 0, l = 24; i < l; i++) {
		var hour = i,
			value = i;

		if (select_skeleton.hour12 === true && i > 12) {
			hour -= 12;
		}

		if (hour < 10) {
			hour = '0' + hour;
			value = '0' + value;
		}

		if (select_skeleton.hour12 === true) {
			if (i > 12) {
				hour += ':00 pm';
			} else {
				hour += ':00 am';
			}
		} else {
			hour += ':00'
		}

		select_skeleton.options.push({
			text: hour,
			value: value + ':00'
		});
	}

	satus.components.select(component, select_skeleton);

	component.classList.add('satus-select');
};
/*--------------------------------------------------------------
>>> LAYERS
--------------------------------------------------------------*/
satus.components.layers = function (component, skeleton) {
	component.path = [];
	component.renderChildren = false;
	component.baseProvider.layers.push(component);
	component.layersProvider = component;

	component.back = function () {
		if (this.path.length > 1) {
			this.path.pop();

			this.open(this.path[this.path.length - 1], false);
		}
	};

	component.open = function (skeleton, history) {
		var previous_layer = satus.last(this.querySelectorAll('.satus-layers__layer')),
			layer = this.createChildElement('div', 'layer');

		if (history !== false) {
			if (previous_layer) {
				previous_layer.style.animation = 'fadeOut 100ms ease forwards';
				layer.style.animation = 'fadeInLeft 300ms ease forwards';
			}

			this.path.push(skeleton);
		} else {
			previous_layer.style.animation = 'fadeOut 100ms ease forwards';
			layer.style.animation = 'fadeInRight 150ms ease forwards';
		}

		if (previous_layer) {
			setTimeout(function () {
				previous_layer.remove();
			}, satus.getAnimationDuration(previous_layer));
		}

		layer.skeleton = skeleton;
		layer.baseProvider = this.baseProvider;

		satus.render(skeleton, layer, undefined, skeleton.component === 'layers');

		this.dispatchEvent(new Event('open'));
	};

	component.update = function () {
		var layer = this.querySelector('.satus-layers__layer');

		satus.empty(layer);
		satus.render(layer.skeleton, layer);
	};

	component.open(skeleton);
};
/*--------------------------------------------------------------
>>> LIST
--------------------------------------------------------------*/

satus.components.list = function (component, skeleton) {
	for (const item of skeleton.items) {
		const li = component.createChildElement('div', 'item');

		for (const child of item) {
			if (satus.isObject(child)) {
				satus.render(child, li);
			} else {
				const span = li.createChildElement('span');

				span.textContent = satus.locale.get(child);
			}
		}
	}
};
/*--------------------------------------------------------------
>>> COLOR PICKER
--------------------------------------------------------------*/

satus.components.colorPicker = function (component, skeleton) {
	component.childrenContainer = component.createChildElement('div', 'content');

	component.color = (function (element) {
		var array;

		Object.defineProperty(element, 'value', {
			get: function () {
				return array;
			},
			set: function (value) {
				array = value;

				element.style.backgroundColor = 'rgb(' + value.join(',') + ')';
			}
		});

		element.value = component.storage.value || skeleton.value || [0, 0, 0];

		return element;
	})(component.createChildElement('span', 'value'));

	component.addEventListener('click', function () {
		var hsl = satus.color.rgbToHsl(this.color.value),
			s = hsl[1] / 100,
			l = hsl[2] / 100;

		s *= l < .5 ? l : 1 - l;

		var v = l + s;

		s = 2 * s / (l + s);

		satus.render({
			component: 'modal',
			variant: 'color-picker',
			value: hsl,
			parentElement: this,

			palette: {
				component: 'div',
				class: 'satus-color-picker__palette',
				style: {
					'backgroundColor': 'hsl(' + hsl[0] + 'deg, 100%, 50%)'
				},
				on: {
					mousedown: function (event) {
						if (event.button !== 0) {
							return false;
						}

						var palette = this,
							rect = this.getBoundingClientRect(),
							cursor = this.children[0];

						function mousemove (event) {
							var hsl = palette.skeleton.parentSkeleton.value,
								x = event.clientX - rect.left,
								y = event.clientY - rect.top;

							x = Math.min(Math.max(x, 0), rect.width) / (rect.width / 100);
							y = Math.min(Math.max(y, 0), rect.height) / (rect.height / 100);

							var v = 100 - y,
								l = (2 - x / 100) * v / 2;

							hsl[1] = x * v / (l < 50 ? l * 2 : 200 - l * 2);
							hsl[2] = l;

							cursor.style.left = x + '%';
							cursor.style.top = y + '%';

							palette.nextSibling.children[0].style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';

							// Update hex input
							var hexInput = palette.parentNode.querySelector('.satus-color-picker__hex-input');
							if (hexInput) {
								var rgb = satus.color.hslToRgb(hsl);
								hexInput.value = satus.color.rgbToHex(rgb);
							}

							event.preventDefault();
						}

						function mouseup () {
							window.removeEventListener('mousemove', mousemove);
							window.removeEventListener('mouseup', mouseup);
						}

						window.addEventListener('mousemove', mousemove);
						window.addEventListener('mouseup', mouseup);
					}
				},

				cursor: {
					component: 'div',
					class: 'satus-color-picker__cursor',
					style: {
						'left': s * 100 + '%',
						'top': 100 - v * 100 + '%'
					}
				}
			},
			section: {
				component: 'section',
				variant: 'color',

				color: {
					component: 'div',
					class: 'satus-color-picker__color',
					style: {
						'backgroundColor': 'rgb(' + this.color.value.join(',') + ')'
					}
				},
				hue: {
					component: 'slider',
					class: 'satus-color-picker__hue',
					storage: false,
					value: hsl[0],
					max: 360,
					on: {
						input: function () {
							var modal = this.skeleton.parentSkeleton.parentSkeleton,
								hsl = modal.value;

							hsl[0] = this.value;

							this.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg,' + hsl[1] + '%, ' + hsl[2] + '%)';
							this.parentNode.previousSibling.style.backgroundColor = 'hsl(' + hsl[0] + 'deg, 100%, 50%)';

							// Update hex input
							var hexInput = this.parentNode.querySelector('.satus-color-picker__hex-input');
							if (hexInput) {
								var rgb = satus.color.hslToRgb(hsl);
								hexInput.value = satus.color.rgbToHex(rgb);
							}
						}
					}
				},
				hexInput: {
					component: 'div',
					class: 'satus-color-picker__hex-container',

					label: {
						component: 'span',
						class: 'satus-color-picker__hex-label',
						text: 'HEX:'
					},
					input: {
						component: 'input',
						class: 'satus-color-picker__hex-input',
						attr: {
							type: 'text',
							maxlength: '7',
							placeholder: '#000000',
							value: satus.color.rgbToHex(component.color.value)
						},
						on: {
							input: function () {
								var value = this.value.trim();
								var rgb = satus.color.hexToRgb(value);

								if (rgb) {
									var modal = this.skeleton.parentSkeleton.parentSkeleton.parentSkeleton,
										hsl = satus.color.rgbToHsl(rgb);

									modal.value = hsl;

									// Update color preview
									var colorPreview = this.parentNode.parentNode.querySelector('.satus-color-picker__color');
									if (colorPreview) {
										colorPreview.style.backgroundColor = 'rgb(' + rgb.join(',') + ')';
									}

									// Update palette background
									var palette = this.parentNode.parentNode.previousSibling;
									if (palette) {
										palette.style.backgroundColor = 'hsl(' + hsl[0] + 'deg, 100%, 50%)';
									}

									// Update hue slider
									var hueSlider = this.parentNode.parentNode.querySelector('.satus-color-picker__hue');
									if (hueSlider && hueSlider.querySelector) {
										var sliderInput = hueSlider.querySelector('input');
										if (sliderInput) {
											sliderInput.value = hsl[0];
										}
									}

									// Update cursor position
									var s = hsl[1] / 100,
										l = hsl[2] / 100;
									s *= l < .5 ? l : 1 - l;
									var v = l + s;
									s = 2 * s / (l + s);

									var cursor = palette.querySelector('.satus-color-picker__cursor');
									if (cursor) {
										cursor.style.left = s * 100 + '%';
										cursor.style.top = 100 - v * 100 + '%';
									}
								}
							}
						}
					}
				}
			},
			actions: {
				component: 'section',
				variant: 'actions',

				reset: {
					component: 'button',
					text: 'reset',
					on: {
						click: function () {
							var modal = this.skeleton.parentSkeleton.parentSkeleton,
								component = modal.parentElement;

							component.color.value = component.skeleton.value || [0, 0, 0];
							satus.storage.remove(component.storage.key);

							modal.rendered.close();
						}
					}
				},
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							this.skeleton.parentSkeleton.parentSkeleton.rendered.close();
						}
					}
				},
				ok: {
					component: 'button',
					text: 'OK',
					on: {
						click: function () {
							var modal = this.skeleton.parentSkeleton.parentSkeleton,
								component = modal.parentElement;

							component.color.value = satus.color.hslToRgb(modal.value);
							component.storage.value = component.color.value;

							modal.rendered.close();
						}
					}
				}
			}
		}, this.baseProvider);
	});
};
/*--------------------------------------------------------------
>>> RADIO
--------------------------------------------------------------*/

satus.components.radio = function (component, skeleton) {
	let value;

	component.nativeControl = component.createChildElement('input', 'input');

	component.createChildElement('i');

	component.childrenContainer = component.createChildElement('div', 'content');

	component.nativeControl.type = 'radio';

	if (skeleton.group) {
		component.storage.key = skeleton.group;
		component.nativeControl.name = skeleton.group;
	}

	if (skeleton.value) {
		component.nativeControl.value = skeleton.value;
	}

	value = satus.storage.get(component.storage.key);

	if (satus.isset(value)) {
		component.nativeControl.checked = value === skeleton.value;
	} else if (skeleton.checked) {
		component.nativeControl.checked = true;
	}

	component.nativeControl.addEventListener('change', function () {
		const component = this.parentNode,
			parent = component.parentNode.parentNode.skeleton;
		let defValue;

		// determine default value for whole radio section
		for (const key in parent) {
			let item = parent[key];

			// components can be functions
			if (satus.isFunction(item)) {
				item = item();
			}

			if (!defValue && item?.radio) {
				// start with first element in case checked: is not defined
				defValue = item.radio.value;
			} else if (item?.radio?.checked) {
				defValue = item.radio.value;
			}
		}

		// save first to sent changes up the chain
		component.storage.value = this.value;
		if (this.value == defValue) {
			// remove if default
			component.storage.remove();
		}
	});
};
/*--------------------------------------------------------------
>>> SLIDER
--------------------------------------------------------------*/

satus.components.slider = function (component, skeleton) {
	var content = component.createChildElement('div', 'content'),
		children_container = content.createChildElement('div', 'children-container'),
		text_input = content.createChildElement('input'),
		track_container = component.createChildElement('div', 'track-container'),
		input = track_container.createChildElement('input', 'input');

	component.childrenContainer = children_container;
	component.textInput = text_input;
	component.input = input;
	component.track = track_container.createChildElement('div', 'track');

	text_input.type = 'text';

	input.type = 'range';
	input.min = skeleton.min || 0;
	input.max = skeleton.max || 1;
	input.step = skeleton.step || 1;
	input.value = component.storage?.value || skeleton.value || 0;

	text_input.addEventListener('blur', function () {
		var component = this.parentNode.parentNode;

		component.input.value = Number(this.value.replace(/[^0-9.]/g, ''));

		component.update();
	});

	text_input.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			var component = this.parentNode.parentNode;

			component.input.value = Number(this.value.replace(/[^0-9.]/g, ''));

			component.update();
		}
	});

	input.addEventListener('input', function () {
		var component = this.parentNode.parentNode;

		component.value = Number(this.value);

		component.update();
	});

	component.update = function () {
		const input = this.input;

		this.textInput.value = input.value;
		if (component.storage) {
			if (component.skeleton.value == Number(input.value)) {
				component.storage.remove();
			} else {
				component.storage.value = Number(input.value);
			}
		}

		this.track.style.width = 100 / (input.max - input.min) * (input.value - input.min) + '%';
	};

	component.update();

	if (skeleton.on) {
		for (var type in skeleton.on) {
			input.addEventListener(type, function (event) {
				this.parentNode.parentNode.dispatchEvent(new Event(event.type));
			});
		}
	}
};
/*--------------------------------------------------------------
>>> TABS
--------------------------------------------------------------*/

satus.components.tabs = function (component, skeleton) {
	let tabs = skeleton.items,
		value = skeleton.value;

	if (satus.isFunction(tabs)) {
		tabs = tabs();
	}

	if (satus.isFunction(value)) {
		value = value();
	}

	for (const tab of tabs) {
		const button = component.createChildElement('button');

		button.addEventListener('click', function () {
			const component = this.parentNode,
				index = satus.elementIndex(this);

			component.value = index;

			component.style.setProperty('--satus-tabs-current', index);
		});

		satus.text(button, tab);
	}

	component.style.setProperty('--satus-tabs-count', tabs.length);
	component.style.setProperty('--satus-tabs-current', value || 0);
};
/*--------------------------------------------------------------
>>> SHORTCUT
--------------------------------------------------------------*/

satus.components.shortcut = function (component, skeleton) {
	component.childrenContainer = component.createChildElement('div', 'content');
	component.valueElement = component.createChildElement('div', 'value');

	component.className = 'satus-button';

	component.render = function (parent = this.primary) {
		let children = parent.children;

		satus.empty(parent);

		function createElement (name) {
			var element = document.createElement('div');

			element.className = 'satus-shortcut__' + name;

			parent.appendChild(element);

			return element;
		}

		if (this.data.alt) {
			createElement('key').textContent = 'Alt';
		}

		if (this.data.ctrl) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			createElement('key').textContent = 'Ctrl';
		}

		if (this.data.shift) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			createElement('key').textContent = 'Shift';
		}

		for (var code in this.data.keys) {
			var key = this.data.keys[code].key,
				arrows = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'],
				index = arrows.indexOf(key);

			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			if (index !== -1) {
				createElement('key').textContent = ['↑', '→', '↓', '←'][index];
			} else if (key === ' ') {
				createElement('key').textContent = '␣';
			} else if (key) {
				createElement('key').textContent = key.toUpperCase();
			}
		}

		if (this.data.wheel) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			var mouse = createElement('mouse'),
				div = document.createElement('div');

			mouse.appendChild(div);

			mouse.className += ' ' + (this.data.wheel > 0);
		}

		if (this.data.click) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			let mouse = createElement('mouse'),
				div = document.createElement('div');

			mouse.appendChild(div);

			mouse.className += ' click';
		}

		if (this.data.middle) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			let mouse = createElement('mouse'),
				div = document.createElement('div');

			mouse.appendChild(div);

			mouse.className += ' middle';
		}

		if (this.data.context) {
			if (children.length && children[children.length - 1].className.indexOf('plus') === -1) {
				createElement('plus');
			}

			let mouse = createElement('mouse'),
				div = document.createElement('div');

			mouse.appendChild(div);

			mouse.className += ' context';
		}
	};

	component.keydown = function (event) {
		event.preventDefault();
		event.stopPropagation();

		component.data = {
			alt: event.altKey,
			ctrl: event.ctrlKey,
			shift: event.shiftKey,
			keys: {}
		};

		if (['control', 'alt', 'altgraph', 'shift'].indexOf(event.key.toLowerCase()) === -1) {
			component.data.keys[event.keyCode] = {
				code: event.code,
				key: event.key
			};
		}

		component.data.wheel = 0;

		component.render();

		return false;
	};

	if (skeleton.wheel !== false) {
		component.mousewheel = function (event) {
			event.stopPropagation();

			if (
				(
					component.data.wheel === 0 &&
					(
						Object.keys(component.data.keys).length === 0 &&
						component.data.alt === false &&
						component.data.ctrl === false &&
						component.data.shift === false
					)
				) ||
				component.data.wheel < 0 && event.deltaY > 0 ||
				component.data.wheel > 0 && event.deltaY < 0) {
				component.data = {
					alt: false,
					ctrl: false,
					shift: false,
					keys: {}
				};
			}

			component.data.wheel = event.deltaY < 0 ? -1 : 1;

			component.render();

			return false;
		};
	}

	component.addEventListener('click', function () {
		satus.render({
			component: 'modal',
			variant: 'shortcut',
			properties: {
				parent: this
			},
			on: {
				close: function () {
					window.removeEventListener('keydown', component.keydown);
					window.removeEventListener('wheel', component.mousewheel);
				}
			},

			primary: {
				component: 'div',
				class: 'satus-shortcut__primary',
				on: {
					render: function () {
						component.primary = this;

						if (component.skeleton.mouseButtons === true) {
							this.addEventListener('mousedown', function (event) {
								if (
									component.data.click && event.button === 0 ||
									component.data.middle && event.button === 1
								) {
									component.data = {
										alt: false,
										ctrl: false,
										shift: false,
										keys: {}
									};
								}

								component.data.click = false;
								component.data.middle = false;
								component.data.context = false;

								if (event.button === 0) {
									component.data.click = true;

									component.render();
								} else if (event.button === 1) {
									component.data.middle = true;

									component.render();
								}
							});

							this.addEventListener('contextmenu', function (event) {
								event.preventDefault();
								event.stopPropagation();

								if (component.data.context) {
									component.data = {
										alt: false,
										ctrl: false,
										shift: false,
										keys: {}
									};
								}

								component.data.context = true;
								component.data.middle = false;
								component.data.click = false;

								component.render();

								return false;
							});
						}

						component.render();
					}
				}
			},
			actions: {
				component: 'section',
				variant: 'actions',

				reset: {
					component: 'button',
					text: 'reset',
					on: {
						click: function () {
							var component = this.parentNode.parentNode.parentNode.parent;

							component.data = component.skeleton.value || {};
							satus.storage.remove(component.storage.key);

							component.render(component.valueElement);

							this.parentNode.parentNode.parentNode.close();

							window.removeEventListener('keydown', component.keydown);
							window.removeEventListener('wheel', component.mousewheel);
						}
					}
				},
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							component.data = satus.storage.get(component.storage.key) || component.skeleton.value || {};

							component.render(component.valueElement);

							this.parentNode.parentNode.parentNode.close();

							window.removeEventListener('keydown', component.keydown);
							window.removeEventListener('wheel', component.mousewheel);
						}
					}
				},
				save: {
					component: 'button',
					text: 'save',
					on: {
						click: function () {
							component.storage.value = component.data;

							component.render(component.valueElement);

							this.parentNode.parentNode.parentNode.close();

							window.removeEventListener('keydown', component.keydown);
							window.removeEventListener('wheel', component.mousewheel);
						}
					}
				}
			}
		}, this.baseProvider);

		window.addEventListener('keydown', this.keydown);
		window.addEventListener('wheel', this.mousewheel);
	});

	component.data = component.storage.value || {
		alt: false,
		ctrl: false,
		shift: false,
		keys: {},
		wheel: 0
	};

	component.render(component.valueElement);
};
/*--------------------------------------------------------------
>>> CHECKBOX
--------------------------------------------------------------*/

satus.components.checkbox = function (component, skeleton) {
	component.input = component.createChildElement('input');
	component.input.type = 'checkbox';

	component.checkmark = component.createChildElement('div', 'checkmark');

	component.childrenContainer = component.createChildElement('div', 'content');

	component.dataset.value = component.storage.value || skeleton.value;
	component.input.checked = component.storage.value || skeleton.value;

	component.input.addEventListener('change', function () {
		var component = this.parentNode;

		if (this.checked === true) {
			component.storage.value = true;
			component.dataset.value = 'true';
		} else {
			component.storage.value = false;
			component.dataset.value = 'false';
		}
	});
};
/*--------------------------------------------------------------
>>> SWITCH
--------------------------------------------------------------*/

satus.components.switch = function (component, skeleton) {
	var value = satus.isset(component.storage.value) ? component.storage.value : skeleton.value;

	if (satus.isFunction(value)) {
		value = value();
	}

	component.childrenContainer = component.createChildElement('div', 'content');

	component.createChildElement('i');

	component.dataset.value = value;
	component.flip = satus.components.switch.flip;

	// 'custom' disables default onclick, user provided function should handle this functionality manually
	if (!skeleton.custom) {
		component.addEventListener('click', function () {
			this.flip();
		}, true);
	}
};

satus.components.switch.flip = function (val) {
	switch (val) {
		case true:
			this.dataset.value = 'true';
			this.storage.value = true;
			break;
		case false:
			this.dataset.value = 'false';
			this.storage.value = false;
			break;
		case undefined:
			if (this.dataset.value === 'true') {
				this.dataset.value = 'false';
				this.storage.value = false;
			} else {
				this.dataset.value = 'true';
				this.storage.value = true;
			}
			break;
	}
};
/*--------------------------------------------------------------
>>> CONTEXT MENU
--------------------------------------------------------------*/
satus.events.on('render', function (component) {
	if (component.skeleton.contextMenu) {
		component.addEventListener('contextmenu', function (event) {
			var base = this.baseProvider,
				base_rect = base.getBoundingClientRect(),
				x = event.clientX - base_rect.left,
				y = event.clientY - base_rect.top,
				modal = satus.render({
					component: 'modal',
					variant: 'contextmenu',
					parentSkeleton: this.skeleton,
					baseProvider: base
				}, base);

			if (base_rect.width - x < 200) {
				x = base_rect.width - x;

				if (x + 200 > base_rect.width) {
					x = 0;
				}

				modal.childrenContainer.style.right = x + 'px';
			} else {
				modal.childrenContainer.style.left = x + 'px';
			}

			modal.childrenContainer.style.top = y + 'px';

			this.skeleton.contextMenu.parentSkeleton = this.skeleton;

			satus.render(this.skeleton.contextMenu, modal.childrenContainer);

			event.preventDefault();
			event.stopPropagation();

			return false;
		});
	}
});
/*--------------------------------------------------------------
>>> SORTABLE
--------------------------------------------------------------*/

satus.events.on('render', function (component) {
	if (component.skeleton.sortable === true) {
		component.addEventListener('mousedown', function (event) {
			if (event.button !== 0) {
				return false;
			}

			var component = this,
				rect = this.getBoundingClientRect(),
				x = event.clientX,
				y = event.clientY,
				offset_x = event.clientX - rect.left,
				offset_y = event.clientY - rect.top,
				ghost = satus.clone(this),
				children = this.parentNode.children,
				appended = false;

			ghost.classList.add('satus-sortable__ghost');

			function mousemove (event) {
				if (appended === false && (Math.abs(event.clientX - x) > 4 || Math.abs(event.clientY - y) > 4)) {
					appended = true;

					component.classList.add('satus-sortable__chosen');

					component.baseProvider.appendChild(ghost);
				}

				ghost.style.transform = 'translate(' + (event.clientX - offset_x) + 'px, ' + (event.clientY - offset_y) + 'px)';
			}

			function mouseup (event) {
				component.classList.remove('satus-sortable__chosen');
				ghost.remove();

				window.removeEventListener('mousemove', mousemove, true);
				window.removeEventListener('mouseup', mouseup, true);

				for (var i = 0, l = children.length; i < l; i++) {
					var child = children[i];

					if (child !== component) {
						child.removeEventListener('mouseover', siblingMouseOver);
					}
				}

				component.dispatchEvent(new CustomEvent('sort'));

				event.stopPropagation();

				return false;
			}

			window.addEventListener('mousemove', mousemove, {
				passive: true,
				capture: true
			});

			window.addEventListener('mouseup', mouseup, {
				passive: true,
				capture: true
			});

			function siblingMouseOver (event) {
				var parent = this.parentNode,
					y = event.layerY / (this.offsetHeight / 100);

				if (y < 50 && this.previousSibling !== component || y >= 50 && this.nextSibling === component) {
					parent.insertBefore(component, this);
				} else {
					parent.insertBefore(component, this.nextSibling);
				}
			}

			for (var i = 0, l = children.length; i < l; i++) {
				var child = children[i];

				if (child !== component) {
					child.addEventListener('mouseover', siblingMouseOver);
				}
			}

			event.stopPropagation();
			event.preventDefault();

			return false;
		});
	}
});
/*--------------------------------------------------------------
>>> MANIFEST
--------------------------------------------------------------*/

satus.manifest = function () {
	var object = {};

	if (this.isset('chrome.runtime.getManifest')) {
		object = chrome.runtime.getManifest();
	}

	return object;
};
/*--------------------------------------------------------------
>>> COLOR:
----------------------------------------------------------------
# String to array
# RGB to HSL
# HUE to RGB
# HSL to RGB
--------------------------------------------------------------*/

satus.color = {};

/*--------------------------------------------------------------
# STRING TO ARRAY
--------------------------------------------------------------*/

satus.color.stringToArray = function (string) {
	var match = string.match(/[0-9.]+/g);

	if (match) {
		for (var i = 0, l = match.length; i < l; i++) {
			match[i] = parseFloat(match[i]);
		}
	}

	return match;
};

/*--------------------------------------------------------------
# RGB TO HSL
--------------------------------------------------------------*/

satus.color.rgbToHsl = function (array) {
	var r = array[0] / 255,
		g = array[1] / 255,
		b = array[2] / 255,
		min = Math.min(r, g, b),
		max = Math.max(r, g, b),
		h = 0,
		s = 0,
		l = (min + max) / 2;

	if (min === max) {
		h = 0;
		s = 0;
	} else {
		var delta = max - min;

		s = l <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

		if (max === r) {
			h = (g - b) / delta + (g < b ? 6 : 0);
		} else if (max === g) {
			h = (b - r) / delta + 2;
		} else if (max === b) {
			h = (r - g) / delta + 4;
		}

		h /= 6;
	}

	h *= 360;
	s *= 100;
	l *= 100;

	if (array.length === 3) {
		return [h, s, l];
	} else {
		return [h, s, l, array[3]];
	}
};

/*--------------------------------------------------------------
# HUE TO RGB
--------------------------------------------------------------*/

satus.color.hueToRgb = function (array) {
	var t1 = array[0],
		t2 = array[1],
		hue = array[2];

	if (hue < 0) {
		hue += 6;
	}

	if (hue >= 6) {
		hue -= 6;
	}

	if (hue < 1) {
		return (t2 - t1) * hue + t1;
	} else if (hue < 3) {
		return t2;
	} else if (hue < 4) {
		return (t2 - t1) * (4 - hue) + t1;
	} else {
		return t1;
	}
};

/*--------------------------------------------------------------
# HSL TO RGB
--------------------------------------------------------------*/

satus.color.hslToRgb = function (array) {
	var h = array[0] / 360,
		s = array[1] / 100,
		l = array[2] / 100,
		r, g, b;

	if (s == 0) {
		r = g = b = l;
	} else {
		var hue2rgb = function (p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/*--------------------------------------------------------------
# RGB TO HEX
--------------------------------------------------------------*/

satus.color.rgbToHex = function (array) {
	var r = Math.round(array[0]).toString(16).padStart(2, '0'),
		g = Math.round(array[1]).toString(16).padStart(2, '0'),
		b = Math.round(array[2]).toString(16).padStart(2, '0');

	return '#' + r + g + b;
};

/*--------------------------------------------------------------
# HEX TO RGB
--------------------------------------------------------------*/

satus.color.hexToRgb = function (hex) {
	// Remove # if present
	hex = hex.replace(/^#/, '');

	// Handle shorthand hex (e.g., #FFF)
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	// Parse hex values
	var r = parseInt(hex.substring(0, 2), 16),
		g = parseInt(hex.substring(2, 4), 16),
		b = parseInt(hex.substring(4, 6), 16);

	// Return null if invalid
	if (isNaN(r) || isNaN(g) || isNaN(b)) {
		return null;
	}

	return [r, g, b];
};
/*--------------------------------------------------------------
>>> USER
----------------------------------------------------------------
# OS
		# Name
		# Bitness
# Browser
		# Name
		# Version
		# Platform
		# Manifest
		# Languages
		# Cookies
		# Java
		# Audio
		# Video
		# WebGL
# Device
		# Screen
		# RAM
		# GPU
		# Cores
		# Touch
		# Connection
--------------------------------------------------------------*/

satus.user = {
	browser: {},
	device: {},
	os: {}
};

/*--------------------------------------------------------------
# OS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# NAME
--------------------------------------------------------------*/

satus.user.os.name = function () {
	var app_version = navigator.appVersion;

	if (app_version.indexOf('Win') !== -1) {
		if (app_version.match(/(Windows 10.0|Windows NT 10.0)/)) {
			return 'Windows 10';
		} else if (app_version.match(/(Windows 8.1|Windows NT 6.3)/)) {
			return 'Windows 8.1';
		} else if (app_version.match(/(Windows 8|Windows NT 6.2)/)) {
			return 'Windows 8';
		} else if (app_version.match(/(Windows 7|Windows NT 6.1)/)) {
			return 'Windows 7';
		} else if (app_version.match(/(Windows NT 6.0)/)) {
			return 'Windows Vista';
		} else if (app_version.match(/(Windows NT 5.1|Windows XP)/)) {
			return 'Windows XP';
		} else {
			return 'Windows';
		}
	} else if (app_version.indexOf('(iPhone|iPad|iPod)') !== -1) {
		return 'iOS';
	} else if (app_version.indexOf('Mac') !== -1) {
		return 'macOS';
	} else if (app_version.indexOf('Android') !== -1) {
		return 'Android';
	} else if (app_version.indexOf('OpenBSD') !== -1) {
		return 'OpenBSD';
	} else if (app_version.indexOf('SunOS') !== -1) {
		return 'SunOS';
	} else if (app_version.indexOf('Linux') !== -1) {
		return 'Linux';
	} else if (app_version.indexOf('X11') !== -1) {
		return 'UNIX';
	}
};

/*--------------------------------------------------------------
# BITNESS
--------------------------------------------------------------*/

satus.user.os.bitness = function () {
	if (navigator.appVersion.match(/(Win64|x64|x86_64|WOW64)/)) {
		return '64-bit';
	} else {
		return '32-bit';
	}
};

/*--------------------------------------------------------------
# BROWSER
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# NAME
--------------------------------------------------------------*/

satus.user.browser.name = function () {
	var user_agent = navigator.userAgent;
	if (navigator.brave) {
		return 'Brave';
	}	else if (user_agent.indexOf("Opera") != -1 || user_agent.indexOf('OPR') != -1) {
		return 'Opera';
	} else if (user_agent.indexOf('Vivaldi') !== -1) {
		return 'Vivaldi';
	} else if (user_agent.indexOf('Edge') !== -1) {
		return 'Edge';
	} else if (user_agent.indexOf('Chrome') !== -1) {
		return 'Chrome';
	} else if (user_agent.indexOf('Safari') !== -1
				&& (!/Windows|Chrom/.test(user_agent)
				|| /Macintosh|iPhone/.test(user_agent))) {
		return 'Safari';
	} else if (user_agent.indexOf('Firefox') !== -1) {
		return 'Firefox';
	} else if (user_agent.indexOf('MSIE') !== -1) {
		return 'IE';
	}
};

/*--------------------------------------------------------------
# VERSION
--------------------------------------------------------------*/

satus.user.browser.version = function () {
	var browser_name = satus.user.browser.name(),
		browser_version = navigator.userAgent.match(new RegExp(browser_name + '/([0-9.]+)'));

	return browser_version[1];
};

/*--------------------------------------------------------------
# PLATFORM
--------------------------------------------------------------*/

satus.user.browser.platform = function () {
	return navigator.platform;
};

/*--------------------------------------------------------------
# MANIFEST
--------------------------------------------------------------*/

satus.user.browser.manifest = function () {
	return chrome.runtime.getManifest() || {};
};

/*--------------------------------------------------------------
# LANGUAGES
--------------------------------------------------------------*/

satus.user.browser.languages = function () {
	return navigator.languages;
};

/*--------------------------------------------------------------
# COOKIES
--------------------------------------------------------------*/

satus.user.browser.cookies = function () {
	if (document.cookie) {
		var random_cookie = 'nX6cMXKWsc';

		document.cookie = random_cookie;

		if (document.cookie.indexOf(random_cookie) !== -1) {
			return true;
		}
	}

	return false;
};

/*--------------------------------------------------------------
# JAVA
--------------------------------------------------------------*/

satus.user.browser.java = function () {
	if (satus.isFunction(navigator.javaEnabled) && navigator.javaEnabled()) {
		return true;
	} else {
		return false;
	}
};

/*--------------------------------------------------------------
# AUDIO
--------------------------------------------------------------*/

satus.user.browser.audio = function () {
	var audio = document.createElement('audio'),
		types = {
			mp3: 'audio/mpeg',
			mp4: 'audio/mp4',
			aif: 'audio/x-aiff',
			'AAC-LC': 'audio/mp4; codecs="mp4a.40.2"',
			opus: 'audio/webm; codecs="opus"'
		},
		result = [];

	if (satus.isFunction(audio.canPlayType)) {
		for (var key in types) {
			var can_play_type = audio.canPlayType(types[key]);

			if (can_play_type !== '') {
				result.push(key);
			}
		}
	}

	return result;
};

/*--------------------------------------------------------------
# VIDEO
--------------------------------------------------------------*/

satus.user.browser.video = function () {
	var video = document.createElement('video'),
		types = {
			//ogg: 'video/ogg; codecs="theora"',
			'H.264 Baseline Profile 3.0': 'video/mp4; codecs="avc1.42E01E"',
			'H.264 Main Profile 4.0': 'video/mp4; codecs="avc1.640028"',
			//webm: 'video/webm; codecs="vp8, vorbis"',
			vp9: 'video/webm; codecs="vp9"',
			av1: 'video/mp4; codecs=av01.0.05M.08',
			hls: 'application/x-mpegURL; codecs="avc1.42E01E"'
		},
		result = [];

	if (satus.isFunction(video.canPlayType)) {
		for (var key in types) {
			var can_play_type = video.canPlayType(types[key]);

			if (can_play_type !== '') {
				result.push(key);
			}
		}
	}

	return result;
};

/*--------------------------------------------------------------
# WEBGL
--------------------------------------------------------------*/

satus.user.browser.webgl = function () {
	var cvs = document.createElement('canvas'),
		ctx = cvs.getContext('webgl');

	return ctx && ctx instanceof WebGLRenderingContext;
};

/*--------------------------------------------------------------
# HARDWARE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# SCREEN
--------------------------------------------------------------*/

satus.user.device.screen = function () {
	if (screen) {
		return screen.width + 'x' + screen.height;
	}
};

/*--------------------------------------------------------------
# RAM
--------------------------------------------------------------*/

satus.user.device.ram = function () {
	if ('deviceMemory' in navigator) {
		return navigator.deviceMemory + ' GB';
	}
};

/*--------------------------------------------------------------
# GPU
--------------------------------------------------------------*/

satus.user.device.gpu = function () {
	var cvs = document.createElement('canvas'),
		ctx = cvs.getContext('webgl');

	if (
		ctx &&
		ctx instanceof WebGLRenderingContext &&
		'getParameter' in ctx &&
		'getExtension' in ctx
	) {
		var info = ctx.getExtension('WEBGL_debug_renderer_info');

		if (info) {
			return ctx.getParameter(info.UNMASKED_RENDERER_WEBGL);
		}
	}
};

/*--------------------------------------------------------------
# CORES
--------------------------------------------------------------*/

satus.user.device.cores = function () {
	return navigator.deviceConcurrency || navigator.hardwareConcurrency;
};

/*--------------------------------------------------------------
# TOUCH
--------------------------------------------------------------*/

satus.user.device.touch = function () {
	var result = {};

	if (
		Object.keys(window).includes('ontouchstart') ||
		window.DocumentTouch && document instanceof window.DocumentTouch ||
		navigator.maxTouchPoints > 0 ||
		window.navigator.msMaxTouchPoints > 0
	) {
		result.touch = true;
		result.maxTouchPoints = navigator.maxTouchPoints;
	}

	return result;
};

/*--------------------------------------------------------------
# CONNECTION
--------------------------------------------------------------*/

satus.user.device.connection = function () {
	var result = {};

	if (typeof navigator.connection === 'object') {
		result.type = navigator.connection.effectiveType || null;

		if (navigator.connection.downlink) {
			result.speed = navigator.connection.downlink + ' Mbps';
		}
	}

	return result;
};
/*--------------------------------------------------------------
# SEARCH
--------------------------------------------------------------*/

satus.search = function (query, object, callback) {
	const included = ['switch', 'select', 'slider', 'shortcut', 'radio', 'color-picker', 'label', 'button'],
		excluded = [
			'baseProvider',
			'layersProvider',
			'parentObject',
			'parentSkeleton',
			'namespaceURI',
			'svg',
			'parentElement',
			'rendered'
		];
	let threads = 0,
		results = {};

	query = query.toLowerCase();

	function parse (items) {
		threads++;

		for (const [key, item] of Object.entries(items)) {
			if (!excluded.includes(key)) {
				if (item.component && item.text
					// list of elements we allow search on
					&& included.includes(item.component)
					// only pass buttons whose parents are variant: 'card' or special case 'appearance' (this one abuses variant tag for CSS)
					&& (item.component != 'button' || item.parentObject?.variant == "card" || item.parentObject?.variant == "appearance")
					// try to match query against localized description, fallback on component name
					&& (satus.locale.data[item.text] ? satus.locale.data[item.text] : item.text).toLowerCase().includes(query)) {
					// plop matching results in array - this means we cant have two elements with same name in results
					results[key] = Object.assign({}, item);
				}

				if (satus.isObject(item)
					&& !satus.isArray(item)
					&& !satus.isElement(item)
					&& !satus.isFunction(item)) {
					parse(item);
				}
			}
		}

		threads--;

		if (threads === 0) {
			callback(results);
		}
	}

	parse(object);
};
/*--------------------------------------------------------------
# count
--------------------------------------------------------------*/
function createInput (placeholder, onChange) {
	const input = document.createElement('input');
	input.type = 'number';
	input.placeholder = placeholder;
	input.addEventListener('change', onChange);
	return input;
}

function createSelect (options, changeHandler) {
	const select = document.createElement('select');

	for (const optionData of options) {
		const option = document.createElement('option');
		option.text = optionData.text;
		option.value = optionData.value;
		select.add(option);
	}

	// Add change event listener if provided
	if (changeHandler) {
		select.addEventListener('change', changeHandler);
	}

	return select;
}

satus.components.countComponent = function (component) {
	component.style.display = satus.storage.get('ads') === 'small_creators' ? 'flex' : 'none';

	const countLabelText = document.createElement('span');
	countLabelText.textContent = 'Maximum number of subscribers';
	component.appendChild(countLabelText);

	const countInput = createInput('130000', function (event) {
		satus.storage.set('smallCreatorsCount', event.target.value);
	});

	// Set the initial value from storage if available
	const storedValue = satus.storage.get('smallCreatorsCount');
	if (storedValue !== undefined) {
		countInput.value = storedValue;
	}

	countInput.style.width = '80px';
	countInput.style.height = '22px';
	countInput.style.fontSize = '12px';

	component.appendChild(countInput);

	const selectionDropdown = createSelect([
		{ text: ' ', value: '1' },
		{ text: 'K', value: '1000' },
		{ text: 'M', value: '1000000' }
	], function (event) {
		satus.storage.set('smallCreatorsUnit', event.target.value);
	});

	const storedUnitValue = satus.storage.get('smallCreatorsUnit');
	if (storedUnitValue !== undefined) {
		selectionDropdown.value = storedUnitValue;
	}
	component.appendChild(selectionDropdown);
};
