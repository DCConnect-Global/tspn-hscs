// import React from "react";

function MyText({link, text}: {link: string; text: string}) {
	if (link !== "") {
		return (
			<div>
				<a href={link} target={"_blank"} rel="noreferrer">
					<p className="sub-text">{text}</p>
				</a>
			</div>
		);
	} else {
		return (
			<div>
				<p className="sub-text">{text}</p>
			</div>
		);
	}
}

export default MyText;
