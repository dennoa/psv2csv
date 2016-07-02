'use strict';

const Transform = require('stream').Transform;

function escapeDoubleQuotes(chunk) {
	return chunk.replace(/"/g, '""');
}

function replacePipes(chunk) {
	return chunk.replace(/\|/g, '","');
}

function replaceLineFeeds(chunk) {
	return chunk.replace(/\r?\n/g, '"\n"');
}

function transformChunk(chunk) {
	return replaceLineFeeds(replacePipes(escapeDoubleQuotes(chunk)));
}

function addDoubleQuoteToStart(chunk) {
	return '"' + chunk;
}

function endsWithDoubleQuote(chunk) {
	return chunk.substring(chunk.length - 1) === '"';
}

function removeLastChar(chunk) {
	return chunk.substring(0, chunk.length - 1);
}

function psv2csv(options) {
	let opts = options || {};
	let transformHeader = opts.transformHeader;
	let startWithDoubleQuote = true;

	function transformHeaderChunk(chunk) {
		if (transformHeader) {
			let headerEnd = chunk.indexOf('\n');
			if (headerEnd >= 0) {
				let transformationFn = transformHeader;
				transformHeader = null;
				return transformationFn(chunk.substring(0, headerEnd)) + chunk.substring(headerEnd);
			}
			return transformHeader(chunk);
		}
		return chunk;
	}

	const transformer = new Transform({
		decodeStrings: false,

		transform(chunk, encoding, callback) {
			let transformed = transformChunk(transformHeaderChunk(chunk));
			if (startWithDoubleQuote) {
				transformed = addDoubleQuoteToStart(transformed);
				startWithDoubleQuote = false;
			}
			if (endsWithDoubleQuote(transformed)) {
				transformed = removeLastChar(transformed);
				startWithDoubleQuote = true;
			}
			callback(null, transformed);
		}
	});

	return transformer;
}

module.exports = psv2csv;