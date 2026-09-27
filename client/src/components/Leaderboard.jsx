import { formatTime } from "../lib/formatTime.js";

export default function Leaderboard({ entries }) {
	return (
		<section
			className="panel leaderboard-panel"
			aria-labelledby="leaderboard-title">
			<div className="panel-heading leaderboard-heading">
				<div>
					<p className="section-kicker">Fastest fairgoers</p>
					<h2 id="leaderboard-title">Best times</h2>
				</div>
				<span className="leaderboard-star" aria-hidden="true">
					✳
				</span>
			</div>
			{entries.length > 0 ? (
				<ol className="leaderboard-list">
					{entries.slice(0, 5).map((entry, index) => (
						<li key={entry.id}>
							<span className="leader-rank">
								{String(index + 1).padStart(2, "0")}
							</span>
							<span className="leader-name">{entry.playerName}</span>
							<time>{formatTime(entry.elapsedSeconds)}</time>
						</li>
					))}
				</ol>
			) : (
				<p className="leaderboard-empty">
					No finishers yet. Make the first mark.
				</p>
			)}
		</section>
	);
}
