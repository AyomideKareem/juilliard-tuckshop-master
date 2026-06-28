import { BarChart, PlusCircle, ShoppingBasket, Users, Package, ClipboardList, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import UsersList from "../components/UsersList";
import InventoryTab from "../components/InventoryTab";
import TransactionsTab from "../components/TransactionsTab";
import UserManagementTab from "../components/UserManagementTab";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore, isSuperAdmin } from "../stores/useUserStore";

const baseTabs = [
	{ id: "create", label: "Create Product", icon: PlusCircle },
	{ id: "products", label: "Products", icon: ShoppingBasket },
	{ id: "inventory", label: "Inventory", icon: Package },
	{ id: "transactions", label: "Transactions", icon: ClipboardList },
	{ id: "analytics", label: "Analytics", icon: BarChart },
	{ id: "wallets", label: "Student Wallets", icon: Users },
];

const AdminPage = () => {
	const [activeTab, setActiveTab] = useState("create");
	const { fetchAllProducts } = useProductStore();
	const { user } = useUserStore();

	const tabs = isSuperAdmin(user)
		? [...baseTabs, { id: "users", label: "User Management", icon: Shield }]
		: baseTabs;

	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);

	return (
		<div className='min-h-screen relative overflow-hidden'>
			<div className='relative z-10 container mx-auto px-4 py-16'>
				<motion.h1 className='text-4xl font-bold mb-2 text-red-400 text-center' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
					{isSuperAdmin(user) ? "Super Admin Dashboard" : "Admin Dashboard"}
				</motion.h1>
				<p className='text-center text-gray-400 mb-8'>School tuckshop management</p>

				<div className='flex justify-center mb-8 flex-wrap gap-2'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-4 py-2 rounded-md transition-colors ${
								activeTab === tab.id ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}
						>
							<tab.icon className='mr-2 h-5 w-5' />
							{tab.label}
						</button>
					))}
				</div>

				{activeTab === "create" && <CreateProductForm />}
				{activeTab === "products" && <ProductsList />}
				{activeTab === "inventory" && <InventoryTab />}
				{activeTab === "transactions" && <TransactionsTab />}
				{activeTab === "analytics" && <AnalyticsTab />}
				{activeTab === "wallets" && <UsersList />}
				{activeTab === "users" && isSuperAdmin(user) && <UserManagementTab />}
			</div>
		</div>
	);
};

export default AdminPage;
