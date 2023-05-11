const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
	app.use(
		createProxyMiddleware("/api", {
			target: `http://nestjs:${process.env.REACT_APP_NESTJS_PORT}`,
			pathRewrite: { "^/api": "" },
			changeOrigin: true,
		})
	);
	app.use(
		createProxyMiddleware('/socket.io', {
			target: `http://nestjs:${process.env.REACT_APP_NESTJS_PORT}`,
			changeOrigin: true,
			ws: true,
			logLevel: 'debug',
		})
	);
	// app.use(
	// 	createProxyMiddleware({
	// 		target: `ws://nestjs:${process.env.REACT_APP_NESTJS_PORT}`,
	// 		pathRewrite: { "^/ws": "" },
	// 		ws: true,
	// 		changeOrigin: true,
	// 	})
	// );
};
