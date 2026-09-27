import { characterPortraits } from "../data/characterPortraits.js";

export default function CharacterPortrait({ character, found = false }) {
	return (
		<span className={`character-portrait${found ? " is-found" : ""}`}>
			<img alt="" src={characterPortraits[character.name]} />
			{found && (
				<span className="portrait-check" aria-label="Found">
					✓
				</span>
			)}
		</span>
	);
}
