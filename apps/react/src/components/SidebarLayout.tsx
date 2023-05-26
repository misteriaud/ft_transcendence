import pongLogo from '../images/pongLogo.png';
import { Card } from '@material-tailwind/react';
import { Link, Outlet } from 'react-router-dom';
import { ReactNode } from 'react';

function SidebarButton({ content, pathDrawn, page }: { content: string; pathDrawn: string; page: string }) {
	return (
		<li>
			<Link to={page}>
				<button className="flex items-center w-full px-10 py-2 mb-2 bg-gray-100 border-2 border-sky-700 rounded text-sky-700 font-bold uppercase group/button hover:bg-gray-300 hover:text-white hover:border-white active:bg-cyan-700">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						className="w-6 h-6 stroke-sky-700 group-hover/button:stroke-white"
					>
						<path strokeLinecap="round" strokeLinejoin="round" d={pathDrawn} />
					</svg>
					<div className="ml-2">{content}</div>
				</button>
			</Link>
		</li>
	);
}

function Sidebar() {
	return (
		<Card className="flex flex-col items-center justify-center bg-slate-400 h-max rounded-lg shadow-xl shadow-blue-gray-900/5">
			<div className="mt-4 text-center text-4xl ">
				<strong className="text-sky-700">PONG</strong>
				<br />
				<span className="text-slate-600">Master</span>
			</div>
			<img className="p-2" src={pongLogo} alt="pong-logo" />
			<ul className="p-3 flex flex-col">
				<SidebarButton
					content="Profile"
					pathDrawn="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
					page="/dashboard/users/:username"
				/>
				<SidebarButton
					content="Social"
					pathDrawn="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
					page="/dashboard/pong"
				/>
				<SidebarButton
					content="Settings"
					pathDrawn="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002"
					page="/dashboard/settings"
				/>
			</ul>
		</Card>
	);
}

function CustomFrame({ outlet, backgroundColor, classNameDetails }: { outlet: ReactNode; backgroundColor: string; classNameDetails: string }) {
	return (
		<Card className={`${classNameDetails} rounded-xl bg-gray-800 border-8 border-gray-800`}>
			<Card className="h-full w-full bg-gray-800 border-8 border-gray-800">
				<Card className="h-full w-full bg-gray-800 border-8 border-gray-800">
					<Card className="h-full w-full bg-gray-600 border-8 border-gray-600">
						<Card className="h-full w-full bg-gray-400 border-8 border-gray-400">
							<Card className={`p-6 h-full w-full ${backgroundColor} border-8 border-gray-200`}>{outlet}</Card>
						</Card>
					</Card>
				</Card>
			</Card>
		</Card>
	);
}

export function SidebarLayout({ outlet }: { outlet: ReactNode }) {
	return (
		<div className="flex">
			<Card className="w-1/4 min-w-min mb-3 mr-3 ml-3 bg-gray-100 max-w-[12rem]">
				<Sidebar />
			</Card>
			<CustomFrame outlet={outlet} classNameDetails="h-[90vh] w-full mb-3 mr-3 shadow-xl shadow-blue-gray-900/5" backgroundColor="bg-blue-100" />
		</div>
	);
}
