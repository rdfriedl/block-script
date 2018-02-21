/**
 * reads a blob as text
 * @param {Blob} blob
 * @return {Promise<string>}
 */
export function readBlob(blob) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
		reader.readAsText(blob);
	});
}
