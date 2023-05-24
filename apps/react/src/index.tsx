import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@material-tailwind/react';

import { router } from './Router';

const theme = {
	menu: {
		styles: {
			base: {
				menu: {
					bg: 'bg-white',
					p: 'px-1 py-0.5'
				},
				item: {
					initial: {
						display: 'block',
						width: 'w-full',
						p: 'px-1 py-0.5'
					},
					disabled: {
						opacity: 'opacity-50',
						cursor: 'cursor-not-allowed'
					}
				}
			}
		}
	}
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
	<React.StrictMode>
		<ThemeProvider value={theme}>
			<RouterProvider router={router} />
		</ThemeProvider>
	</React.StrictMode>
);
