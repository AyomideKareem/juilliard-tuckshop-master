import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied } = useCartStore();

	const savings = subtotal - total;
	const formattedSubtotal = `₦${subtotal.toFixed(2)}`;
	const formattedTotal = `₦${total.toFixed(2)}`;
	const formattedSavings = `₦${savings.toFixed(2)}`;

	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<p className='text-xl font-semibold text-red-400'>Order summary</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Subtotal</dt>
						<dd className='text-base font-medium text-white'>{formattedSubtotal}</dd>
					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Savings</dt>
							<dd className='text-base font-medium text-red-400'>-{formattedSavings}</dd>
						</dl>
					)}

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
							<dd className='text-base font-medium text-red-400'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}

					<dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-red-400'>{formattedTotal}</dd>
					</dl>
				</div>

				<p className='text-sm text-gray-400 text-center'>
					Pay with your NFC card using the panel on the right.
				</p>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link to='/' className='inline-flex items-center gap-2 text-sm font-medium text-red-400 underline hover:text-red-300 hover:no-underline'>
						Continue Shopping
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};

export default OrderSummary;
