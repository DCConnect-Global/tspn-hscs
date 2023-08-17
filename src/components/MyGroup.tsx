// import React from "react";
import MyButton from "./MyButton";
import MyText from "./MyText";

function MyGroup({ buttonLabel, fcn, link, text }: { buttonLabel: string; fcn: () => void; link: string; text: string}) {

	return (
		<div>
			<MyText text={text} link={link} />
			<MyButton fcn={fcn} buttonLabel={buttonLabel} />
		</div>
	);
}

export default MyGroup;
