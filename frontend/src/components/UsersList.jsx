import { useEffect, useState } from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UserCog, Save, X, Edit3, Search, Eye, Plus, Minus } from "lucide-react";

const UsersList = () => {
	const [students, setStudents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [walletData, setWalletData] = useState(null);
	const [walletAction, setWalletAction] = useState(null);
	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");

	const fetchStudents = async () => {
		try {
			const params = searchTerm ? { search: searchTerm } : {};
			const res = await axios.get("/wallet/students", { params });
			setStudents(res.data.students || []);
		} catch {
			toast.error("Failed to load students");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const t = setTimeout(fetchStudents, 300);
		return () => clearTimeout(t);
	}, [searchTerm]);

	const openWallet = async (studentId) => {
		try {
			const res = await axios.get(`/wallet/${studentId}`);
			setWalletData(res.data);
			setSelectedStudent(studentId);
		} catch {
			toast.error("Failed to load wallet");
		}
	};

	const handleWalletAction = async () => {
		if (!amount || Number(amount) <= 0) {
			toast.error("Enter a valid amount");
			return;
		}
		try {
			const endpoint =
				walletAction === "topup"
					? `/wallet/${selectedStudent}/topup`
					: walletAction === "deduct"
					? `/wallet/${selectedStudent}/deduct`
					: `/wallet/${selectedStudent}/balance`;

			const method = walletAction === "set" ? "put" : "post";
			const payload =
				walletAction === "set"
					? { balance: Number(amount), reason }
					: { amount: Number(amount), reason };

			await axios[method](endpoint, payload);
			toast.success("Wallet updated");
			setWalletAction(null);
			setAmount("");
			setReason("");
			openWallet(selectedStudent);
			fetchStudents();
		} catch (error) {
			toast.error(error.response?.data?.message || "Wallet update failed");
		}
	};

	if (loading) return <p className='text-gray-400 text-center mt-10'>Loading students...</p>;

	return (
		<motion.div className='rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-md max-w-5xl mx-auto'>
			<div className='flex flex-col md:flex-row items-center justify-between mb-6 gap-4'>
				<div className='flex items-center'>
					<UserCog className='text-red-500 h-6 w-6 mr-2' />
					<h2 className='text-xl font-semibold text-red-400'>Student Wallets</h2>
				</div>
				<div className='relative w-full md:w-80'>
					<Search className='absolute left-3 top-2.5 text-gray-400 w-4 h-4' />
					<input
						type='text'
						placeholder='Search students...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='w-full bg-gray-900 text-white rounded-md pl-10 pr-3 py-2 border border-gray-700 focus:border-red-500 outline-none'
					/>
				</div>
			</div>

			<div className='space-y-3'>
				{students.map((student) => (
					<div key={student._id} className='flex justify-between items-center bg-gray-900/60 rounded-lg p-4 border border-gray-700'>
						<div>
							<p className='text-white font-medium'>{student.name}</p>
							<p className='text-gray-400 text-sm'>{student.email}</p>
							<p className={`text-xs mt-1 ${student.isActive ? "text-green-400" : "text-red-400"}`}>
								{student.isActive ? "Active" : "Disabled"}
							</p>
						</div>
						<div className='flex items-center gap-3'>
							<p className='text-green-400 font-bold'>₦{student.NFCunits?.toFixed(2)}</p>
							<button onClick={() => openWallet(student._id)} className='bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-white flex items-center gap-1 text-sm'>
								<Eye className='w-4 h-4' /> Manage
							</button>
						</div>
					</div>
				))}
				{students.length === 0 && <p className='text-center text-gray-500 italic'>No students found</p>}
			</div>

			<AnimatePresence>
				{selectedStudent && walletData && (
					<motion.div className='fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
						<motion.div className='bg-gray-900 rounded-xl p-6 border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto'>
							<div className='flex justify-between items-center mb-4'>
								<h3 className='text-lg font-semibold text-red-400'>
									{walletData.wallet.student.name}'s Wallet
								</h3>
								<button onClick={() => { setSelectedStudent(null); setWalletData(null); setWalletAction(null); }} className='text-gray-400 hover:text-red-400'>
									<X className='w-5 h-5' />
								</button>
							</div>

							<p className='text-3xl font-bold text-green-400 mb-4'>₦{walletData.wallet.balance.toFixed(2)}</p>

							<div className='flex gap-2 mb-4'>
								<button onClick={() => setWalletAction("topup")} className='flex items-center gap-1 bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded text-sm'>
									<Plus size={14} /> Top-up
								</button>
								<button onClick={() => setWalletAction("deduct")} className='flex items-center gap-1 bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded text-sm'>
									<Minus size={14} /> Deduct
								</button>
								<button onClick={() => setWalletAction("set")} className='flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-sm'>
									<Edit3 size={14} /> Set balance
								</button>
							</div>

							{walletAction && (
								<div className='bg-gray-800 rounded-lg p-4 mb-4 space-y-2'>
									<input type='number' min='0' step='0.01' placeholder='Amount' value={amount} onChange={(e) => setAmount(e.target.value)}
										className='w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm' />
									<input placeholder='Reason (optional)' value={reason} onChange={(e) => setReason(e.target.value)}
										className='w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm' />
									<button onClick={handleWalletAction} className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm flex items-center gap-1'>
										<Save size={14} /> Confirm
									</button>
								</div>
							)}

							<h4 className='text-sm font-semibold text-gray-300 mb-2'>Transaction History</h4>
							<div className='space-y-2 max-h-48 overflow-y-auto'>
								{walletData.transactions?.length === 0 ? (
									<p className='text-gray-500 text-sm'>No transactions</p>
								) : (
									walletData.transactions.map((tx) => (
										<div key={tx._id} className='text-sm bg-gray-800 rounded p-2 flex justify-between'>
											<div>
												<p className='text-white'>{tx.description}</p>
												<p className='text-gray-500 text-xs'>{new Date(tx.createdAt).toLocaleString()}</p>
											</div>
											<span className={tx.type === "topup" ? "text-green-400" : "text-red-400"}>
												{tx.type === "topup" ? "+" : "-"}₦{tx.amount.toFixed(2)}
											</span>
										</div>
									))
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default UsersList;
