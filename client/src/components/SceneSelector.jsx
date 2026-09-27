import { gameScenes } from "../data/gameScenes.js";

export default function SceneSelector({ disabled, onSelect, selectedSceneId }) {
	return (
		<div className="scene-selector" aria-label="Choose a search scene">
			{gameScenes.map((scene, index) => (
				<button
					aria-pressed={scene.id === selectedSceneId}
					className={`scene-option${scene.id === selectedSceneId ? " is-selected" : ""}`}
					disabled={disabled}
					key={scene.id}
					onClick={() => onSelect(scene.id)}
					type="button">
					<img alt="" src={scene.image} />
					<span className="scene-option-label">
						<span className="scene-option-number">0{index + 1}</span>
						{scene.name}
					</span>
				</button>
			))}
		</div>
	);
}
