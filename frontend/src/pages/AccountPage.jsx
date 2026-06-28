import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { User, CreditCard, Mail } from "lucide-react";

const AccountPage = () => {
	const { user } = useUserStore();

	return (
		<div className='container mx-auto px-4 py-8 max-w-lg'>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-gray-800 rounded-lg p-8 border border-gray-700'>
				<div className='flex items-center gap-3 mb-6'>
					<User className='h-8 w-8 text-red-400' />
					<h1 className='text-2xl font-bold text-white'>My Account</h1>
				</div>

				<dl className='space-y-4'>
					<div className='flex items-center gap-3 bg-gray-900 rounded-lg p-4'>
						<User className='h-5 w-5 text-gray-400' />
						<div>
							<dt className='text-xs text-gray-500'>Full Name</dt>
							<dd className='text-white'>{user?.name}</dd>
						</div>
					</div>
					<div className='flex items-center gap-3 bg-gray-900 rounded-lg p-4'>
						<Mail className='h-5 w-5 text-gray-400' />
						<div>
							<dt className='text-xs text-gray-500'>Email</dt>
							<dd className='text-white'>{user?.email}</dd>
						</div>
					</div>
					<div className='flex items-center gap-3 bg-gray-900 rounded-lg p-4'>
						<CreditCard className='h-5 w-5 text-gray-400' />
						<div>
							<dt className='text-xs text-gray-500'>NFC Card</dt>
							<dd className='text-white'>{user?.card ? `••••${user.card.slice(-4)}` : "Not set"}</dd>
						</div>
					</div>
					<div className='flex items-center gap-3 bg-gray-900 rounded-lg p-4'>
						<div>
							<dt className='text-xs text-gray-500'>Wallet Balance</dt>
							<dd className='text-green-400 text-xl font-bold'>₦{user?.NFCunits?.toFixed(2) ?? "0.00"}</dd>
						</div>
					</div>
					<div className='flex items-center gap-3 bg-gray-900 rounded-lg p-4'>
						<div>
							<dt className='text-xs text-gray-500'>Account Status</dt>
							<dd className={user?.isActive ? "text-green-400" : "text-red-400"}>
								{user?.isActive ? "Active" : "Disabled"}
							</dd>
						</div>
					</div>
				</dl>

				<p className='mt-6 text-sm text-gray-500 text-center'>
					Account changes must be made by school administration.
				</p>
			</motion.div>
		</div>
	);
};

export default AccountPage;
