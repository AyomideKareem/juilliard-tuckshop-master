import { ShoppingCart, LogIn, LogOut, Lock, Wallet, History, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore, isStudent, isAdmin, isSuperAdmin } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const { cart } = useCartStore();

	return (
		<header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 border-b border-red-800'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex flex-wrap justify-between items-center'>
					<Link to='/' className='text-2xl font-bold text-red-400 flex items-center'>
						School Tuckshop
					</Link>

					<nav className='flex flex-wrap items-center gap-4'>
						<Link to='/' className='text-gray-300 hover:text-red-400 transition'>Home</Link>

						{isStudent(user) && (
							<>
								<Link to='/wallet' className='text-gray-300 hover:text-red-400 flex items-center gap-1'>
									<Wallet size={18} /> Wallet
								</Link>
								<Link to='/history' className='text-gray-300 hover:text-red-400 flex items-center gap-1'>
									<History size={18} /> History
								</Link>
								<Link to='/account' className='text-gray-300 hover:text-red-400 flex items-center gap-1'>
									<User size={18} /> Account
								</Link>
								<Link to='/cart' className='relative text-gray-300 hover:text-red-400'>
									<ShoppingCart size={20} />
									{cart.length > 0 && (
										<span className='absolute -top-2 -left-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs'>
											{cart.length}
										</span>
									)}
								</Link>
							</>
						)}

						{isAdmin(user) && (
							<Link to='/admin' className='bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-1'>
								<Lock size={16} />
								{isSuperAdmin(user) ? "Super Admin" : "Admin"}
							</Link>
						)}

						{user ? (
							<button onClick={logout} className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center'>
								<LogOut size={18} />
								<span className='hidden sm:inline ml-2'>Log Out</span>
							</button>
						) : (
							<Link to='/login' className='bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center'>
								<LogIn size={18} className='mr-2' /> Login
							</Link>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
