import CharacterPortrait from "./CharacterPortrait.jsx";

export default function CharacterPicker({
	busy,
	characters,
	onDismiss,
	onSelect,
	position,
}) {
	const left = Math.min(76, Math.max(24, position.x * 100));
	const top = Math.min(77, Math.max(23, position.y * 100));

	return (
		<div
			className="character-picker"
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
			style={{ left: `${left}%`, top: `${top}%` }}>
			<div className="picker-heading">
				<span>Who did you spot?</span>
				<button
					aria-label="Close character picker"
					className="picker-close"
					onClick={onDismiss}
					type="button">
					×
				</button>
			</div>
			<div className="picker-options">
				{characters.map((character) => (
					<button
						disabled={busy}
						key={character.id}
						onClick={() => onSelect(character.id)}
						type="button">
						<CharacterPortrait character={character} />
						{character.name}
					</button>
				))}
			</div>
		</div>
	);
}
