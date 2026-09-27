import test from "node:test";
import assert from "node:assert/strict";
import { isCharacterAtGuess } from "./guessValidation.js";

const target = { x: 0.5, y: 0.5 };

test("accepts a nearby click within the relative character hit area", () => {
	assert.equal(isCharacterAtGuess({ x: 0.52, y: 0.51 }, target), true);
});

test("accepts a relative click region around the target", () => {
	assert.equal(isCharacterAtGuess({ x: 0.65, y: 0.43 }, target), true);
});

test("rejects a click outside the relative hit area", () => {
	assert.equal(isCharacterAtGuess({ x: 0.67, y: 0.5 }, target), false);
});

test("accepts points inside and on the edges of a relative rectangle", () => {
	const rectangle = { xMin: 0.43, yMin: 0.28, xMax: 0.56, yMax: 0.42 };
	assert.equal(isCharacterAtGuess({ x: 0.5, y: 0.35 }, rectangle), true);
	assert.equal(isCharacterAtGuess({ x: 0.43, y: 0.42 }, rectangle), true);
});

test("rejects points outside a relative rectangle", () => {
	const rectangle = { xMin: 0.43, yMin: 0.28, xMax: 0.56, yMax: 0.42 };
	assert.equal(isCharacterAtGuess({ x: 0.561, y: 0.35 }, rectangle), false);
	assert.equal(isCharacterAtGuess({ x: 0.5, y: 0.421 }, rectangle), false);
});

test("accepts Scene 1 Morty clicks within the provided percentage bounds", () => {
	const morty = {
		xMin: 0.81,
		yMin: 0.395,
		xMax: 0.881,
		yMax: 0.532,
	};
	assert.equal(isCharacterAtGuess({ x: 0.8455, y: 0.4635 }, morty), true);
	assert.equal(isCharacterAtGuess({ x: 0.81, y: 0.395 }, morty), true);
	assert.equal(isCharacterAtGuess({ x: 0.881, y: 0.532 }, morty), true);
	assert.equal(isCharacterAtGuess({ x: 0.809, y: 0.4635 }, morty), false);
	assert.equal(isCharacterAtGuess({ x: 0.8455, y: 0.533 }, morty), false);
});

test("accepts Scene 1 Summer clicks within the provided percentage bounds", () => {
	const summer = {
		xMin: 0.489,
		yMin: 0.51,
		xMax: 0.56,
		yMax: 0.63,
	};
	assert.equal(isCharacterAtGuess({ x: 0.5245, y: 0.57 }, summer), true);
	assert.equal(isCharacterAtGuess({ x: 0.489, y: 0.51 }, summer), true);
	assert.equal(isCharacterAtGuess({ x: 0.56, y: 0.63 }, summer), true);
	assert.equal(isCharacterAtGuess({ x: 0.488, y: 0.57 }, summer), false);
	assert.equal(isCharacterAtGuess({ x: 0.5245, y: 0.631 }, summer), false);
});

test("accepts Scene 2 Morty clicks within the provided percentage bounds", () => {
	const morty = {
		xMin: 0.677,
		yMin: 0.36,
		xMax: 0.767,
		yMax: 0.413,
	};
	assert.equal(isCharacterAtGuess({ x: 0.722, y: 0.3865 }, morty), true);
	assert.equal(isCharacterAtGuess({ x: 0.677, y: 0.36 }, morty), true);
	assert.equal(isCharacterAtGuess({ x: 0.767, y: 0.413 }, morty), true);
	assert.equal(isCharacterAtGuess({ x: 0.676, y: 0.3865 }, morty), false);
	assert.equal(isCharacterAtGuess({ x: 0.722, y: 0.414 }, morty), false);
});

test("accepts Scene 3 Morty clicks within the provided percentage bounds", () => {
	const morty = {
		xMin: 0.452,
		yMin: 0.867,
		xMax: 0.477,
		yMax: 0.925,
	};
	assert.equal(isCharacterAtGuess({ x: 0.4645, y: 0.896 }, morty), true);
	assert.equal(isCharacterAtGuess({ x: 0.452, y: 0.867 }, morty), true);
	assert.equal(isCharacterAtGuess({ x: 0.477, y: 0.925 }, morty), true);
	assert.equal(isCharacterAtGuess({ x: 0.451, y: 0.896 }, morty), false);
	assert.equal(isCharacterAtGuess({ x: 0.4645, y: 0.926 }, morty), false);
});

test("accepts Scene 3 Summer clicks within the provided percentage bounds", () => {
	const summer = {
		xMin: 0.689,
		yMin: 0.558,
		xMax: 0.715,
		yMax: 0.638,
	};
	assert.equal(isCharacterAtGuess({ x: 0.702, y: 0.598 }, summer), true);
	assert.equal(isCharacterAtGuess({ x: 0.689, y: 0.558 }, summer), true);
	assert.equal(isCharacterAtGuess({ x: 0.715, y: 0.638 }, summer), true);
	assert.equal(isCharacterAtGuess({ x: 0.688, y: 0.598 }, summer), false);
	assert.equal(isCharacterAtGuess({ x: 0.702, y: 0.639 }, summer), false);
});
