import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios";
import { useProductStore } from "../stores/useProductStore";
import { AlertTriangle } from "lucide-react";
import { getAssetUrl } from "../lib/api.js";

const InventoryTab = () => {
	const [alerts, setAlerts] = useState([]);
	const { products, fetchAllProducts, updateProductStock } = useProductStore();
	const [editing, setEditing] = useState({});

	useEffect(() => {
		fetchAllProducts();
		axios.get("/inventory/alerts").then((res) => setAlerts(res.data.products)).catch(() => {});
	}, [fetchAllProducts]);

	const handleSave = async (productId) => {
		await updateProductStock(productId, editing[productId]);
		setEditing((prev) => {
			const next = { ...prev };
			delete next[productId];
			return next;
		});
	};

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			{alerts.length > 0 && (
				<div className='bg-yellow-900/40 border border-yellow-600 rounded-lg p-4 flex items-start gap-3'>
					<AlertTriangle className='h-5 w-5 text-yellow-400 shrink-0 mt-0.5' />
					<div>
						<p className='text-yellow-300 font-medium'>{alerts.length} product(s) low on stock</p>
						<p className='text-yellow-200/70 text-sm'>{alerts.map((p) => p.name).join(", ")}</p>
					</div>
				</div>
			)}

			<motion.div className='bg-gray-800 rounded-lg overflow-x-auto' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
				<table className='min-w-full divide-y divide-gray-700'>
					<thead className='bg-gray-700'>
						<tr>
							{["Product", "Stock", "Low Alert", "Update"].map((h) => (
								<th key={h} className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase'>{h}</th>
							))}
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-700'>
						{products.map((p) => (
							<tr key={p._id} className='hover:bg-gray-700/50'>
								<td className='px-6 py-4 flex items-center gap-3'>
									<img src={getAssetUrl(p.image)} alt='' className='h-8 w-8 rounded object-cover' />
									<span className='text-white text-sm'>{p.name}</span>
								</td>
								<td className='px-6 py-4'>
									<input
										type='number'
										min='0'
										value={editing[p._id]?.stock ?? p.stock ?? 0}
										onChange={(e) => setEditing({ ...editing, [p._id]: { ...editing[p._id], stock: e.target.value } })}
										className='w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm'
									/>
								</td>
								<td className='px-6 py-4'>
									<input
										type='number'
										min='0'
										value={editing[p._id]?.lowStockThreshold ?? p.lowStockThreshold ?? 5}
										onChange={(e) => setEditing({ ...editing, [p._id]: { ...editing[p._id], lowStockThreshold: e.target.value } })}
										className='w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm'
									/>
								</td>
								<td className='px-6 py-4'>
									{editing[p._id] && (
										<button onClick={() => handleSave(p._id)} className='text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white'>
											Save
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</motion.div>
		</div>
	);
};

export default InventoryTab;
