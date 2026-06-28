import { BarChart, ClipboardList, Package, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios";
import TransactionsTab from "../components/TransactionsTab";
import InventoryTab from "../components/InventoryTab";
import { AlertTriangle } from "lucide-react";

const tabs = [
	{ id: "orders", label: "Orders & Transactions", icon: ClipboardList },
	{ id: "inventory", label: "Inventory", icon: Package },
];

const StaffPage = () => {
	const [activeTab, setActiveTab] = useState("orders");
	const [lowStockCount, setLowStockCount] = useState(0);

	useEffect(() => {
		axios.get("/inventory/alerts").then((res) => setLowStockCount(res.data.count)).catch(() => {});
	}, []);

	return (
		<div className='min-h-screen relative overflow-hidden'>
			<div className='relative z-10 container mx-auto px-4 py-16'>
				<motion.h1 className='text-4xl font-bold mb-2 text-red-400 text-center' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
					Staff Dashboard
				</motion.h1>
				<p className='text-center text-gray-400 mb-8'>Verify transactions and monitor inventory</p>

				{lowStockCount > 0 && (
					<div className='max-w-3xl mx-auto mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 flex items-center gap-2 text-yellow-300 text-sm'>
						<AlertTriangle size={16} />
						{lowStockCount} product(s) need restocking
					</div>
				)}

				<div className='flex justify-center mb-8 flex-wrap'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors ${
								activeTab === tab.id ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							<tab.icon className='mr-2 h-5 w-5' />
							{tab.label}
						</button>
					))}
				</div>

				{activeTab === "orders" && <TransactionsTab />}
				{activeTab === "inventory" && <InventoryTab />}
			</div>
		</div>
	);
};

export default StaffPage;
