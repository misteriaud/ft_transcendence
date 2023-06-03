/** @type {import('tailwindcss').Config} */

const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {}
	},
	plugins: [],
	safelist: [
		{
			pattern: /bg-*/,
			variants: ["lg", "hover", "focus", "lg:hover"]
		},
		{
			pattern: /self-*/,
			variants: ["lg", "hover", "focus", "lg:hover"]
		}
	]
});
