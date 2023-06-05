import { Button, Input, Navbar } from '@material-tailwind/react';
import { Me } from './me';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export function Navigation() {
	return (
		<Navbar className="grid grid-cols-3 gap-4 p-2" style={{ gridTemplateColumns: '2fr 1fr 2fr' }} fullWidth={true}>
			<div className="col-start-1 col-span-1 flex justify-start items-center">
				<Input
					containerProps={{ className: 'min-w-[150px] max-w-[300px]' }}
					label="Search for users"
					icon={<MagnifyingGlassIcon strokeWidth={2} className="h-4 w-4" />}
				/>
			</div>
			<div className="col-start-2 col-span-1 flex justify-center items-center">
				<Button size="lg">Play</Button>
			</div>
			<div className="col-start-3 col-span-1 flex justify-end items-center">
				<Me />
			</div>
		</Navbar>
	);
}
