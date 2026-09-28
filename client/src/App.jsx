import { useEffect, useState } from "react";
import CharacterPicker from "./components/CharacterPicker.jsx";
import CharacterPortrait from "./components/CharacterPortrait.jsx";
import GameBoard from "./components/GameBoard.jsx";
import GameHeader from "./components/GameHeader.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import SceneSelector from "./components/SceneSelector.jsx";
import { gameScenes } from "./data/gameScenes.js";
import { formatTime } from "./lib/formatTime.js";
import { requestJson } from "./lib/requestJson.js";

export default function App() {
	const [characters, setCharacters] = useState([]);
	const [session, setSession] = useState(null);
	const [foundIds, setFoundIds] = useState([]);
	const [leaderboard, setLeaderboard] = useState([]);
	const [playerName, setPlayerName] = useState("");
	const [scoreSaved, setScoreSaved] = useState(false);
	const [showNameModal, setShowNameModal] = useState(false);
	const [scoreError, setScoreError] = useState("");
	const [elapsed, setElapsed] = useState(0);
	const [selection, setSelection] = useState(null);
	const [misses, setMisses] = useState([]);
	const [notice, setNotice] = useState("");
	const [busy, setBusy] = useState(false);
	const [selectedSceneId, setSelectedSceneId] = useState(1);
	const selectedScene = gameScenes.find(
		(scene) => scene.id === selectedSceneId,
	);
	const complete =
		characters.length > 0 && foundIds.length === characters.length;

	useEffect(() => {
		requestJson("/api/game/leaderboard")
			.then((data) => setLeaderboard(data.entries))
			.catch(() =>
				setNotice("Leaderboard is unavailable until the game server is ready."),
			);
	}, []);

	useEffect(() => {
		if (!session || complete) return undefined;

		const updateClock = () => {
			setElapsed(
				Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000),
			);
		};

		updateClock();
		const intervalId = window.setInterval(updateClock, 1000);
		return () => window.clearInterval(intervalId);
	}, [session, complete]);

	useEffect(() => {
		if (!showNameModal) return undefined;

		function closeOnEscape(event) {
			if (event.key === "Escape") setShowNameModal(false);
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", closeOnEscape);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", closeOnEscape);
		};
	}, [showNameModal]);

	async function startGame() {
		setBusy(true);
		setNotice("");

		try {
			const data = await requestJson("/api/game/sessions", {
				method: "POST",
				body: JSON.stringify({ sceneId: selectedSceneId }),
			});
			setSession(data.session);
			setCharacters(data.session.characters);
			setFoundIds([]);
			setMisses([]);
			setElapsed(0);
			setSelection(null);
			setPlayerName("");
			setScoreSaved(false);
			setShowNameModal(false);
			setScoreError("");
		} catch (error) {
			setNotice(error.message);
		} finally {
			setBusy(false);
		}
	}

	async function submitGuess(characterId) {
		if (!selection || !session) return;
		setBusy(true);

		try {
			const data = await requestJson(
				`/api/game/sessions/${session.id}/guesses`,
				{
					method: "POST",
					body: JSON.stringify({ ...selection, characterId }),
				},
			);

			if (data.correct) {
				setFoundIds(data.foundCharacterIds);
				setNotice(`${data.character.name} found!`);
				if (data.completed) {
					setElapsed(data.elapsedSeconds);
					setShowNameModal(true);
				}
			} else {
				setMisses((previous) => [...previous.slice(-5), selection]);
				setNotice("Not quite. Keep looking.");
			}
		} catch (error) {
			setNotice(error.message);
		} finally {
			setSelection(null);
			setBusy(false);
		}
	}

	async function saveScore(event) {
		event.preventDefault();
		if (!session || !complete) return;
		setBusy(true);
		setScoreError("");

		try {
			await requestJson(`/api/game/sessions/${session.id}/score`, {
				method: "POST",
				body: JSON.stringify({ playerName }),
			});
			setScoreSaved(true);
			setShowNameModal(false);
			const latest = await requestJson("/api/game/leaderboard");
			setLeaderboard(latest.entries);
		} catch (error) {
			setScoreError(error.message);
		} finally {
			setBusy(false);
		}
	}

	function changeScene(sceneId) {
		if (sceneId === selectedSceneId) return;

		if (session) {
			requestJson(`/api/game/sessions/${session.id}/quit`, {
				method: "POST",
			}).catch((error) => {
				console.error("Unable to close abandoned game session", error);
			});
		}

		setSelectedSceneId(sceneId);
		setSession(null);
		setCharacters([]);
		setFoundIds([]);
		setMisses([]);
		setSelection(null);
		setElapsed(0);
		setNotice("");
		setPlayerName("");
		setScoreSaved(false);
		setShowNameModal(false);
		setScoreError("");
	}

	return (
		<main className="app-shell">
			<GameHeader />

			<section className="game-layout" aria-label="Where's Rick game">
				<div className="hunt-column">
					<div className="hunt-heading">
						<div>
							<p className="section-kicker">
								Scene 0{selectedSceneId} · {selectedScene.name}
							</p>
							<h2>{complete ? "Lovely spotting." : "A busy day out."}</h2>
						</div>
						<div
							className="timer"
							aria-label={`Elapsed time ${formatTime(elapsed)}`}>
							<span className="timer-label">TIME</span>
							<strong>{formatTime(elapsed)}</strong>
						</div>
					</div>

					<SceneSelector
						disabled={busy}
						onSelect={changeScene}
						selectedSceneId={selectedSceneId}
					/>

					<GameBoard
						active={Boolean(session) && !complete}
						scene={selectedScene}
						misses={misses}
						onChooseSpot={setSelection}
						selection={selection}>
						{selection && (
							<CharacterPicker
								characters={characters.filter(
									(character) => !foundIds.includes(character.id),
								)}
								busy={busy}
								onSelect={submitGuess}
								onDismiss={() => setSelection(null)}
								position={selection}
							/>
						)}
					</GameBoard>

					<div className="board-caption">
						<span>
							<i className="caption-dot" />
							{session ? "Hunt in progress" : "Ready when you are"}
						</span>
						<span>
							{foundIds.length}/
							{characters.length || selectedScene.characterCount} found
						</span>
					</div>
				</div>

				<aside className="side-column">
					<section
						className="panel search-panel"
						aria-labelledby="search-title">
						<div className="panel-heading">
							<div>
								<p className="section-kicker">Your search party</p>
								<h2 id="search-title">Find Rick</h2>
							</div>
							<span className="count-badge">
								{foundIds.length}/
								{characters.length || selectedScene.characterCount}
							</span>
						</div>

						{characters.length > 0 ? (
							<ul className="character-list">
								{characters.map((character) => {
									const found = foundIds.includes(character.id);
									return (
										<li
											className={`character-row${found ? " is-found" : ""}`}
											key={character.id}>
											<CharacterPortrait character={character} found={found} />
											<span className="character-name">{character.name}</span>
											<span className="character-state">
												{found ? "Found" : "Missing"}
											</span>
										</li>
									);
								})}
							</ul>
						) : (
							<button
								className="start-button start-only"
								disabled={busy}
								onClick={startGame}
								type="button">
								{busy ? "Starting…" : "Start hunt"}{" "}
								<span aria-hidden="true">↗</span>
							</button>
						)}

						<p className="game-notice" aria-live="polite">
							{complete
								? scoreSaved
									? `Time saved for ${playerName.trim()}. Nicely done!`
									: `Scene cleared in ${formatTime(elapsed)}. Add your name to save your time.`
								: notice ||
									(session
										? "Tap the picture to make a guess."
										: "Rick is somewhere in this scene.")}
						</p>

						{complete && !scoreSaved && (
							<button
								className="play-again save-time-trigger"
								onClick={() => {
									setScoreError("");
									setShowNameModal(true);
								}}
								type="button">
								Save your time <span aria-hidden="true">↗</span>
							</button>
						)}

						{complete && (
							<button
								className="play-again"
								onClick={() => {
									setSession(null);
									setCharacters([]);
									setFoundIds([]);
									setMisses([]);
									setSelection(null);
									setElapsed(0);
									setNotice("");
									setPlayerName("");
									setScoreSaved(false);
									setShowNameModal(false);
									setScoreError("");
								}}
								type="button">
								Play again <span aria-hidden="true">↗</span>
							</button>
						)}
					</section>

					<Leaderboard entries={leaderboard} />
					<p className="fair-note">Take your time. The search can wait.</p>
				</aside>
			</section>

			{complete && showNameModal && !scoreSaved && (
				<div
					className="name-modal-backdrop"
					onClick={(event) => {
						if (event.target === event.currentTarget) {
							setShowNameModal(false);
						}
					}}>
					<section
						aria-labelledby="name-modal-title"
						aria-modal="true"
						className="name-modal"
						role="dialog">
						<button
							aria-label="Close name dialog"
							className="name-modal-close"
							onClick={() => setShowNameModal(false)}
							type="button">
							×
						</button>
						<p className="section-kicker">
							Scene complete · {formatTime(elapsed)}
						</p>
						<h2 id="name-modal-title">Put your name on the board.</h2>
						<p className="name-modal-copy">
							You found everyone. Add your name to the fastest fairgoers.
						</p>
						<form className="name-modal-form" onSubmit={saveScore}>
							<label htmlFor="player-name">Your name</label>
							<input
								autoComplete="nickname"
								autoFocus
								id="player-name"
								maxLength={20}
								onChange={(event) => setPlayerName(event.target.value)}
								placeholder="Your name"
								required
								value={playerName}
							/>
							{scoreError && (
								<p className="name-modal-error" role="alert">
									{scoreError}
								</p>
							)}
							<button className="start-button" disabled={busy} type="submit">
								{busy ? "Saving…" : "Save time"}{" "}
								<span aria-hidden="true">↗</span>
							</button>
						</form>
					</section>
				</div>
			)}

			<footer className="page-footer">
				<span>WHERE&apos;S RICK?</span>
				<span>FIELD NOTES · THREE SCENES</span>
			</footer>
		</main>
	);
}
