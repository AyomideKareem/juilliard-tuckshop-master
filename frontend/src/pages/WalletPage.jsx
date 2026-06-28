import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { Wallet, History, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const typeLabel = (type) => {
	const labels = { purchase: "Purchase", topup: "Top-up", deduction: "Deduction", refund: "Refund", adjustment: "Adjustment" };
	return labels[type] || type;
};

const isCredit = (type) => type === "topup" || type === "refund";

const WalletPage = () => {
	const { refreshProfile } = useUserStore();
	const [wallet, setWallet] = useState(null);
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadWallet = async () => {
		try {
			const res = await axios.get("/wallet/me");
			setWallet(res.data.wallet);
			setTransactions(res.data.transactions || []);
			await refreshProfile();
		} catch {
			/* handled by interceptor */
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadWallet();
	}, []);

	if (loading) return <p className='text-center text-gray-400 py-16'>Loading wallet...</p>;

	return (
		<div className='container mx-auto px-4 py-8 max-w-2xl'>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-gray-800 rounded-lg p-8 border border-gray-700'>
				<div className='flex items-center gap-3 mb-6'>
					<Wallet className='h-8 w-8 text-red-400' />
					<h1 className='text-2xl font-bold text-white'>My Wallet</h1>
				</div>

				<div className='bg-gray-900 rounded-lg p-6 mb-6 text-center'>
					<p className='text-gray-400 text-sm'>Current Balance</p>
					<p className='text-4xl font-bold text-green-400 mt-2'>₦{wallet?.balance?.toFixed(2) ?? "0.00"}</p>
					<p className='text-gray-500 text-sm mt-2'>
						{wallet?.name} · Card ending {wallet?.card ? wallet.card.slice(-4) : "----"}
					</p>
				</div>

				<Link to='/history' className='flex items-center gap-2 text-red-400 hover:text-red-300 text-sm mb-6'>
					<History size={16} /> View full purchase history
				</Link>

				<h2 className='text-lg font-semibold text-white mb-4'>Transaction History</h2>
				{transactions.length === 0 ? (
					<p className='text-gray-400 text-sm'>No transactions yet.</p>
				) : (
					<ul className='space-y-3'>
						{transactions.map((tx) => (
							<li key={tx._id} className='flex justify-between items-center bg-gray-900 rounded p-3 text-sm'>
								<div className='flex items-center gap-3'>
									{isCredit(tx.type) ? (
										<ArrowUpCircle className='h-5 w-5 text-green-400' />
									) : (
										<ArrowDownCircle className='h-5 w-5 text-red-400' />
									)}
									<div>
										<p className='text-white'>{tx.description || typeLabel(tx.type)}</p>
										<p className='text-gray-500 text-xs'>{new Date(tx.createdAt).toLocaleString()}</p>
										<p className='text-gray-600 text-xs'>Balance: ₦{tx.balanceAfter?.toFixed(2)}</p>
									</div>
								</div>
								<span className={`font-medium ${isCredit(tx.type) ? "text-green-400" : "text-red-400"}`}>
									{isCredit(tx.type) ? "+" : "-"}₦{tx.amount.toFixed(2)}
								</span>
							</li>
						))}
					</ul>
				)}
			</motion.div>
		</div>
	);
};

export default WalletPage;
