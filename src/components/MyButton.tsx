// import React from "react";

function MyButton({ buttonLabel, fcn }: { buttonLabel: string; fcn: () => void }) {
	return (
		<div>
			<button onClick={fcn} className="cta-button">
				{buttonLabel}
			</button>
		</div>
	);
}
export default MyButton;
