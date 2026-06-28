import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios";

const TransactionsTab = () => {
	const [transactions, setTransactions] = useState([]);
	const [orders, setOrders] = useState([]);
	const [view, setView] = useState("transactions");

	useEffect(() => {
		axios.get("/transactions").then((res) => setTransactions(res.data.transactions)).catch(() => {});
		axios.get("/transactions/orders").then((res) => setOrders(res.data.orders)).catch(() => {});
	}, []);

	return (
		<div className='max-w-5xl mx-auto'>
			<div className='flex gap-2 mb-4'>
				{["transactions", "orders"].map((v) => (
					<button key={v} onClick={() => setView(v)}
						className={`px-4 py-2 rounded text-sm capitalize ${view === v ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}>
						{v}
					</button>
				))}
			</div>

			{view === "transactions" ? (
				<motion.div className='bg-gray-800 rounded-lg overflow-x-auto' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
					<table className='min-w-full divide-y divide-gray-700 text-sm'>
						<thead className='bg-gray-700'>
							<tr>
								{["Student", "Type", "Amount", "Balance After", "Date"].map((h) => (
									<th key={h} className='px-4 py-3 text-left text-xs text-gray-300 uppercase'>{h}</th>
								))}
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-700'>
							{transactions.map((tx) => (
								<tr key={tx._id}>
									<td className='px-4 py-3 text-white'>{tx.user?.name ?? "—"}</td>
									<td className='px-4 py-3 text-gray-300 capitalize'>{tx.type}</td>
									<td className='px-4 py-3 text-red-400'>₦{tx.amount.toFixed(2)}</td>
									<td className='px-4 py-3 text-green-400'>₦{tx.balanceAfter?.toFixed(2)}</td>
									<td className='px-4 py-3 text-gray-400'>{new Date(tx.createdAt).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</motion.div>
			) : (
				<div className='space-y-3'>
					{orders.map((order) => (
						<div key={order._id} className='bg-gray-800 rounded-lg p-4 border border-gray-700'>
							<div className='flex justify-between text-sm mb-2'>
								<span className='text-white'>{order.user?.name}</span>
								<span className='text-red-400 font-bold'>₦{order.totalAmount.toFixed(2)}</span>
							</div>
							<p className='text-gray-500 text-xs'>{new Date(order.createdAt).toLocaleString()} · {order.status}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default TransactionsTab;
