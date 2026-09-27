export const GUESS_RADIUS = 0.16;

export function isCharacterAtGuess(guess, character) {
	if (
		Number.isFinite(character.xMin) &&
		Number.isFinite(character.yMin) &&
		Number.isFinite(character.xMax) &&
		Number.isFinite(character.yMax)
	) {
		return (
			guess.x >= character.xMin &&
			guess.x <= character.xMax &&
			guess.y >= character.yMin &&
			guess.y <= character.yMax
		);
	}

	return (
		Math.hypot(guess.x - character.x, guess.y - character.y) <= GUESS_RADIUS
	);
}
