export default function GameBoard({
	active,
	children,
	misses,
	onChooseSpot,
	scene,
	selection,
}) {
	function handleBoardClick(event) {
		if (!active || event.target.closest(".character-picker")) return;

		const bounds = event.currentTarget.getBoundingClientRect();
		onChooseSpot({
			x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
			y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
		});
	}

	function handleKeyDown(event) {
		if (!active || (event.key !== "Enter" && event.key !== " ")) return;
		event.preventDefault();
		onChooseSpot({ x: 0.5, y: 0.5 });
	}

	return (
		<div className={`board-frame${active ? " is-active" : ""}`}>
			<div
				aria-label={`${scene.name}. Select a spot to search for Rick.`}
				className="board-stage"
				onClick={handleBoardClick}
				onKeyDown={handleKeyDown}
				role="application"
				style={{ width: "100%", aspectRatio: scene.aspectRatio }}
				tabIndex={active ? 0 : -1}>
				<img
					alt={`${scene.name}, a crowded Where's Rick search scene`}
					draggable="false"
					src={scene.image}
				/>
				{misses.map((miss, index) => (
					<span
						aria-hidden="true"
						className="miss-marker"
						key={`${miss.x}-${miss.y}-${index}`}
						style={{ left: `${miss.x * 100}%`, top: `${miss.y * 100}%` }}
					/>
				))}
				{selection && (
					<span
						aria-hidden="true"
						className="selection-marker"
						style={{
							left: `${selection.x * 100}%`,
							top: `${selection.y * 100}%`,
						}}
					/>
				)}
				{children}
				{!active && (
					<div className="board-veil">
						<span>Start the hunt to search this scene</span>
					</div>
				)}
			</div>
		</div>
	);
}
