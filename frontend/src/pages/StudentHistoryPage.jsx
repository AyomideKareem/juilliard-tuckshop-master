import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios";
import { getAssetUrl } from "../lib/api.js";

const StudentHistoryPage = () => {
	const [orders, setOrders] = useState([]);

	useEffect(() => {
		axios.get("/transactions/orders/mine").then((res) => setOrders(res.data.orders)).catch(() => {});
	}, []);

	return (
		<div className='container mx-auto px-4 py-8 max-w-3xl'>
			<motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-2xl font-bold text-red-400 mb-6'>
				Purchase History
			</motion.h1>

			{orders.length === 0 ? (
				<p className='text-gray-400'>No purchases yet.</p>
			) : (
				<div className='space-y-4'>
					{orders.map((order) => (
						<div key={order._id} className='bg-gray-800 rounded-lg p-4 border border-gray-700'>
							<div className='flex justify-between mb-3'>
								<span className='text-gray-400 text-sm'>{new Date(order.createdAt).toLocaleString()}</span>
								<span className='text-red-400 font-bold'>₦{order.totalAmount.toFixed(2)}</span>
							</div>
							<ul className='space-y-2'>
								{order.products.map((item, i) => (
									<li key={i} className='flex items-center gap-3 text-sm'>
										{item.product?.image && (
											<img src={getAssetUrl(item.product.image)} alt='' className='h-8 w-8 rounded object-cover' />
										)}
										<span className='text-white'>{item.product?.name ?? "Product"}</span>
										<span className='text-gray-400'>×{item.quantity}</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default StudentHistoryPage;
