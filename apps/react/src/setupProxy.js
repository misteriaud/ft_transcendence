const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: `http://nestjs:${process.env.REACT_APP_NESTJS_PORT}`,
      pathRewrite: { "^/api": "" },
      changeOrigin: true,
    })
  );
};
