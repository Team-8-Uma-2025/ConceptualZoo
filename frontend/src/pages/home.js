// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
	const featuredExhibits = [
		{ id: 1, title: 'Primate Paradise', image: 'https://images.unsplash.com/photo-1577052348055-000792164622?q=80&w=3271&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
		{ id: 2, title: 'Reptile House', image: 'https://images.unsplash.com/photo-1471005197911-88e9d4a7834d?q=80&w=3273&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
		{ id: 3, title: 'Big Cats', image: 'https://images.unsplash.com/photo-1452001603782-7d4e7d931173?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
	];

	const upcomingEvents = [
		{ id: 1, title: 'Night Safari', date: 'March 15, 2025', image: 'https://images.unsplash.com/photo-1521651201144-634f700b36ef?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
		{ id: 2, title: 'Feeding Time', date: 'March 18, 2025', image: 'https://images.unsplash.com/photo-1709082811831-55fa8ef48cce?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
		{ id: 3, title: 'Conservation Talk', date: 'March 22, 2025', image: 'https://images.unsplash.com/reserve/brBe5pGVSwGi0dC3192U_Sunset%20in%20Dunhuang.jpg?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
	];

	return (
		<div>
			{/* Responsive Hero Section */}
			<section className="relative h-[90vh] overflow-hidden">
				{/* Background image with overlay */}
				<img
					src="/background/tree_bg.png"
					alt="Jungle background"
					className="absolute inset-0 w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

				{/* Mobile layout - centered content */}
				<div className="md:hidden relative z-10 container mx-auto h-full flex flex-col justify-center items-center text-center px-4 pt-20">
					<p className="text-lg mb-4 font-['Lora'] italic text-white">Spotted in</p>
					<h1 className="text-5xl font-extrabold mb-6 font-['Roboto_Flex'] tracking-tight text-white">
						THE JUNGLE
					</h1>
					<p className="mb-8 text-white text-lg font-['Lora'] max-w-xs">
						Visit the tropics in Manhattan. Lemur, snakes, frogs
					</p>
					<Link
						to="/tickets"
						className="inline-block text-xl bg-transparent hover:bg-green-700 text-white font-bold py-3 px-8 border-2 border-white hover:border-transparent transition duration-300"
					>
						RESERVE TICKETS
					</Link>
					
					{/* Mobile monkey - smaller and positioned at bottom */}
					<div className="absolute -bottom-3 right-0 w-3/5 z-10">
						<img
							src="/background/monkey.png"
							alt="Monkey"
							className="w-full h-auto object-contain"
						/>
					</div>
				</div>

				{/* Desktop layout - slanted overlay and side content */}
				<div className="hidden md:block relative z-10 container mx-auto h-full md:flex items-center text-center pt-20 overflow-visible">
					{/* Slanted green overlay */}
					<div className="absolute inset-0">
						<div
							className="absolute left-[7%] top-0 h-full w-2/5 transform -skew-x-[-20deg]"
							style={{
								background: 'linear-gradient(to bottom, rgba(13, 34, 13, 0.8), rgba(55, 145, 55, 0.7))'
							}}
						></div>
					</div>

					{/* Content */}
					<div className="text-white w-1/2 pl-20 z-10">
						<p className="text-lg mb-8 font-['Lora'] italic">Spotted in</p>
						<h1 className="text-[9rem] font-extrabold mb-6 leading-tight font-['Roboto_Flex'] !leading-[0.8] tracking-tight">
							THE<br />JUNGLE
						</h1>
						<p className="mb-8 w-1/2 mx-auto text-xl font-['Lora']">
							Visit the tropics in Manhattan. Lemur, snakes, frogs
						</p>
						<Link
							to="/tickets"
							className="inline-block text-xl bg-transparent hover:bg-green-700 text-white font-bold py-3 px-8 border-2 border-white hover:border-transparent transition duration-300"
						>
							RESERVE TICKETS
						</Link>
					</div>

					{/* Desktop Monkey */}
					<div className="absolute right-0 bottom-0 z-20 h-4/5">
						<img
							src="/background/monkey.png"
							alt="Monkey"
							className="h-[110%] object-contain"
						/>
					</div>
				</div>
			</section>

			{/* Info Bar - Directly embedded */}
			<div className="bg-white shadow-md w-full">
				<div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
					<div className="flex items-center justify-center py-4 px-2 border-b sm:border-b md:border-b-0 md:border-r border-gray-200">
						<div className="flex items-center space-x-3">
							<div className="bg-green-700 bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
								<span>🕒</span>
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-900 font-['Mukta_Mahee']">Today's Hours</p>
								<p className="text-sm text-gray-700 font-['Mukta_Mahee']">9am - 5pm</p>
							</div>
						</div>
					</div>
					
					<div className="flex items-center justify-center py-4 px-2 border-b sm:border-b md:border-b-0 md:border-r border-gray-200">
						<Link to="/tickets" className="flex items-center space-x-3 hover:text-green-700 transition duration-300">
							<div className="bg-green-700 bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
								<span>🎟️</span>
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-900 font-['Mukta_Mahee']">Get Tickets</p>
							</div>
						</Link>
					</div>
					
					<div className="flex items-center justify-center py-4 px-2 border-b sm:border-b-0 sm:border-r md:border-r border-gray-200">
						<Link to="/zoo-map" className="flex items-center space-x-3 hover:text-green-700 transition duration-300">
							<div className="bg-green-700 bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
								<span>🗺️</span>
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-900 font-['Mukta_Mahee']">Zoo Map</p>
							</div>
						</Link>
					</div>
					
					<div className="flex items-center justify-center py-4 px-2">
						<Link to="/membership" className="flex items-center space-x-3 hover:text-green-700 transition duration-300">
							<div className="bg-green-700 bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
								<span>⭐</span>
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-900 font-['Mukta_Mahee']">Membership</p>
							</div>
						</Link>
					</div>
				</div>
			</div>

			{/* Featured Exhibits Section */}
			<section className="bg-[#1A1A1A] py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-4xl text-white font-bold mb-12 text-center font-['Roboto_Flex']">Featured Exhibits</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{featuredExhibits.map((exhibit) => (
							<div key={exhibit.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition duration-300 flex flex-col">
								<div className="h-80 overflow-hidden">
									<img
										src={exhibit.image}
										alt={exhibit.title}
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="p-4 flex-grow">
									<h3 className="text-xl text-white font-semibold mb-2 font-['Mukta_Mahee']">{exhibit.title}</h3>
									<Link
										to={`/exhibits/${exhibit.id}`}
										className="text-green-400 hover:text-green-300 inline-block mt-2 font-['Mukta_Mahee']"
									>
										Learn more →
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Salamander Image Section */}
			<section className="h-128 relative overflow-hidden">
				<img
					src="https://images.unsplash.com/photo-1568965081729-85dad42f18ef?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
					alt="Salamander"
					className="w-full h-full object-cover"
				/>
			</section>

			{/* Upcoming Events Section */}
			<section className="bg-[#1A1A1A] py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-4xl text-white font-bold mb-12 text-center font-['Roboto_Flex']">Upcoming Events</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{upcomingEvents.map((event) => (
							<div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
								<img
									src={event.image}
									alt={event.title}
									className="w-full h-48 sm:h-64 md:h-48 lg:h-64 object-cover"
								/>
								<div className="p-4">
									<h3 className="text-xl text-white font-semibold mb-1 font-['Mukta_Mahee']">{event.title}</h3>
									<p className="text-gray-400 text-sm mb-2 font-['Lora']">{event.date}</p>
									<Link
										to={`/events/${event.id}`}
										className="text-green-400 hover:text-green-300 inline-block mt-2 font-['Mukta_Mahee']"
									>
										Learn more →
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Jaguar Image Section */}
			<section className="h-96 relative overflow-hidden">
				<img
					src="https://images.unsplash.com/photo-1616128417743-c3a6992a65e7?q=80&w=3272&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
					alt="Jaguar"
					className="w-full h-full object-cover"
				/>
			</section>
		</div>
	);
};

export default Home;