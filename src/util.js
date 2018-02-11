URL.parseSearch = function(url) {
	url = url || location.href;
	URL.parseSearch.cache = URL.parseSearch.cache || {};
	if (!URL.parseSearch.cache[url]) {
		const search = url.indexOf("?") !== -1 ? url.substr(url.indexOf("?") + 1, url.length + 1) : "";
		const queries = search
			.replace(/^\?/, "")
			.replace(/\+/g, " ")
			.split("&");
		URL.parseSearch.cache[url] = {};
		for (let i = 0; i < queries.length; i++) {
			const split = queries[i].split("=");
			if (split[0] !== "") URL.parseSearch.cache[url][split[0]] = split[1].length ? window.unescape(split[1]) : true;
		}
	}
	return URL.parseSearch.cache[url];
};

// JSON utils
JSON.fromBlob = function(blob) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.onload = () => {
			// if parsing fails it will throw
			try {
				let json = JSON.parse(reader.result);
				resolve(json);
			} catch (e) {
				reject(e);
			}
		};
		reader.onerror = reject;
		reader.readAsText(blob);
	});
};

Function.debounce = function(func, time) {
	let timeout;
	return function(...args) {
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			func(...args);
		}, time);
	};
};
