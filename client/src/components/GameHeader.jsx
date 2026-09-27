export default function GameHeader() {
	return (
		<header className="site-header">
			<a className="wordmark" href="/" aria-label="Where's Rick? home">
				<span className="wordmark-mark" aria-hidden="true">
					?
				</span>
				<span>
					Where&apos;s Rick<span className="wordmark-period">.</span>
				</span>
			</a>
			<div className="edition-label">
				<span className="live-dot" /> THREE SEARCH SCENES
			</div>
		</header>
	);
}
