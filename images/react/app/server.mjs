import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';

const app = express();
const DIRNAME = path.resolve();
const PORT = process.env.PORT || 80;
const NESTJS_PORT = process.env.REACT_APP_NESTJS_PORT || 3000;

// Serve the static files of the React application
app.use(express.static('build'));

// Route API requests to the NestJS server using a proxy
app.use(
    createProxyMiddleware('/api', {
        target: `http://nestjs:${NESTJS_PORT}`,
        pathRewrite: { '^/api': '' },
        changeOrigin: true
    })
);
app.use(
    createProxyMiddleware('/socket.io', {
        target: `http://nestjs:${NESTJS_PORT}`,
        changeOrigin: true,
        ws: true,
    })
);

// Fallback route that sends index.html for any other route
app.get('*', (req, res) => {
	res.sendFile(path.join(DIRNAME, 'build', 'index.html'));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});