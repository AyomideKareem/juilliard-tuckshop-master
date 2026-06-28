import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, CheckCircle, XCircle, MoveRight } from "lucide-react";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";

const NFCPayment = () => {
	const { total, clearCart, getCartItems } = useCartStore();
	const { user, checkAuth } = useUserStore();
	const [scannedCard, setScannedCard] = useState("");
	const [paymentStatus, setPaymentStatus] = useState(null);
	const [paymentMessage, setPaymentMessage] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [balance, setBalance] = useState(0);

	useEffect(() => {
		setBalance(user?.NFCunits || 0);
	}, [user]);

	const processCheckout = async () => {
		const card = scannedCard.trim();
		if (!card || isProcessing) return;

		setIsProcessing(true);
		setPaymentStatus(null);
		setPaymentMessage("");

		try {
			const res = await axios.post("/nfc/checkout", { card });

			if (res.data.success) {
				setPaymentStatus("success");
				setPaymentMessage(res.data.message || "Payment successful");
				setBalance(res.data.newBalance);
				clearCart();
				await checkAuth();
				await getCartItems();
			}
		} catch (error) {
			setPaymentStatus("failed");
			setPaymentMessage(error.response?.data?.message || "Payment failed");
		} finally {
			setIsProcessing(false);
		}
	};

	useEffect(() => {
		if (!scannedCard.trim()) return;
		const timeout = setTimeout(processCheckout, 600);
		return () => clearTimeout(timeout);
	}, [scannedCard]);

	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<p className='text-xl font-semibold text-red-400 text-center'>Pay with NFC Card</p>

			<div className='space-y-4 text-center'>
				<CreditCard className='mx-auto h-10 w-10 text-gray-400' />
				<p className='text-gray-300'>
					Total: <strong className='text-white'>₦{total.toFixed(2)}</strong>
				</p>
				<p className='text-gray-200'>
					Wallet Balance: <strong className='text-green-400'>₦{balance.toFixed(2)}</strong>
				</p>

				<input
					type='password'
					placeholder='Tap NFC card or enter card ID...'
					value={scannedCard}
					onChange={(e) => setScannedCard(e.target.value)}
					className='w-full rounded-md border border-gray-600 bg-gray-900 text-gray-200 px-3 py-2 text-sm focus:border-red-500 outline-none'
					autoFocus
					disabled={paymentStatus === "success"}
				/>

				<button
					onClick={processCheckout}
					disabled={isProcessing || paymentStatus === "success"}
					className='w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50'
				>
					{isProcessing ? "Processing..." : "Confirm NFC Payment"}
				</button>

				{paymentStatus === "success" && (
					<div className='mt-6 flex flex-col items-center'>
						<CheckCircle className='h-10 w-10 text-green-500' />
						<p className='text-green-500 font-semibold mt-2'>{paymentMessage}</p>
						<p className='text-gray-400'>Remaining: ₦{balance.toFixed(2)}</p>
						<Link to='/wallet' className='mt-4 text-red-400 underline text-sm'>View wallet</Link>
						<Link to='/' className='mt-2 flex items-center gap-2 text-sm text-red-400 underline'>
							Back to Shop <MoveRight size={16} />
						</Link>
					</div>
				)}

				{paymentStatus === "failed" && (
					<div className='mt-6 flex flex-col items-center'>
						<XCircle className='h-10 w-10 text-red-500' />
						<p className='text-red-500 font-semibold mt-2'>Payment Failed</p>
						<p className='text-gray-400 text-sm'>{paymentMessage}</p>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default NFCPayment;
