import React from "react";
import { Link } from "react-router-dom";

const CreditsView = () => (
	<div>
		<Link to="/" className="btn btn-md btn-info pull-left margin-10" style={{ position: "fixed", zIndex: 100 }}>
			<i className="fa fa-arrow-left" />
			<span> Back</span>
		</Link>

		<div className="col-md-8 col-md-offset-2 text-center" style={{ marginBottom: "10vh" }}>
			<div className="page-header">
				<h1>Block Script</h1>
			</div>
			<h4>
				Created by:{" "}
				<a href="https://rdfriedl.com/" target="_blank">
					rdfriedl
				</a>
			</h4>
			<div className="page-header">
				<h1>Sound</h1>
			</div>
			<div className="page-header">
				<h1>Textures</h1>
			</div>
			<h4>
				All block textures are from:{" "}
				<a href="http://dokucraft.co.uk/" target="_blank">
					Dokucraft
				</a>
			</h4>
			<div className="page-header text-center">
				<h1>Fonts</h1>
			</div>
			<h4>
				All fonts are from:{" "}
				<a href="http://www.iamcal.com/misc/fonts/" target="_blank">
					iamcal.com
				</a>
			</h4>
		</div>
	</div>
);

export default CreditsView;
