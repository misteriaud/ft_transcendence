import React, { useState, Fragment } from 'react';
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Select, Option, Switch, Spinner } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useMe } from '../hooks/useUser';

function GameModeSwitch() {
	return (
		<div className="flex justify-center">
			<span className="mr-2">Normal </span>
			<Switch id="Mode" label="Hardcore" />
		</div>
	);
}

function SelectPlayer() {
	return (
		<div className="flex justify-center">
			<div className="w-72">
				<Select label="Player 2">
					<Option>Random</Option>
					<Option>Player 1</Option>
					<Option>Player 2</Option>
					<Option>Player 3</Option>
					<Option>Player 4</Option>
				</Select>
			</div>
		</div>
	);
}

export function GameButton() {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleOpen = () => {
		setOpen(!open);
	};

	const handleJoin = () => {
		setLoading(true);
		handleOpen();
	};

	return (
		<Fragment>
			<Button onClick={handleOpen} variant="gradient">
				{loading ? (
					<div className="flex items-center justify-center">
						<Spinner />
					</div>
				) : (
					'Play Game'
				)}
			</Button>
			<Dialog open={open} handler={handleOpen}>
				<div className="flex items-center justify-between">
					<DialogHeader>󠀠 </DialogHeader>
					<XMarkIcon className="mr-3 h-5 w-5" onClick={handleOpen} />
				</div>
				<DialogBody divider>
					<div className="grid gap-6">
						<GameModeSwitch />
						<SelectPlayer />
					</div>
				</DialogBody>
				<DialogFooter className="flex justify-center">
					<Button variant="gradient" color="green" onClick={handleJoin}>
						Play Game
					</Button>
				</DialogFooter>
			</Dialog>
		</Fragment>
	);
}
