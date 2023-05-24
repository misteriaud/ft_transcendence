import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
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
