import { useEffect, useState } from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
	UserPlus, Search, Edit3, Trash2, KeyRound, Power, X, Save, Copy,
} from "lucide-react";

const ROLES = [
	{ value: "student", label: "Student" },
	{ value: "admin", label: "Admin" },
];

const UserManagementTab = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [tempPassword, setTempPassword] = useState(null);
	const [form, setForm] = useState({
		name: "", email: "", role: "student", card: "", initialBalance: "0",
	});

	const fetchUsers = async () => {
		try {
			const params = {};
			if (search) params.search = search;
			if (roleFilter) params.role = roleFilter;
			if (statusFilter) params.status = statusFilter;
			const res = await axios.get("/users", { params });
			setUsers(res.data.users || []);
		} catch {
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchUsers(); }, [search, roleFilter, statusFilter]);

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("/users", {
				...form,
				initialBalance: Number(form.initialBalance) || 0,
			});
			setTempPassword(res.data.temporaryPassword);
			toast.success("Account created");
			setShowCreate(false);
			setForm({ name: "", email: "", role: "student", card: "", initialBalance: "0" });
			fetchUsers();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create account");
		}
	};

	const handleUpdate = async () => {
		try {
			await axios.put(`/users/${editingUser._id}`, editingUser);
			toast.success("Account updated");
			setEditingUser(null);
			fetchUsers();
		} catch (error) {
			toast.error(error.response?.data?.message || "Update failed");
		}
	};

	const handleToggleActive = async (userId) => {
		try {
			await axios.patch(`/users/${userId}/toggle-active`);
			toast.success("Account status updated");
			fetchUsers();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed");
		}
	};

	const handleResetPassword = async (userId) => {
		try {
			const res = await axios.post(`/users/${userId}/reset-password`);
			setTempPassword(res.data.temporaryPassword);
			toast.success("Password reset");
		} catch (error) {
			toast.error(error.response?.data?.message || "Reset failed");
		}
	};

	const handleDelete = async (userId) => {
		if (!confirm("Delete this account permanently?")) return;
		try {
			await axios.delete(`/users/${userId}`);
			toast.success("Account deleted");
			fetchUsers();
		} catch (error) {
			toast.error(error.response?.data?.message || "Delete failed");
		}
	};

	const copyPassword = () => {
		navigator.clipboard.writeText(tempPassword);
		toast.success("Password copied");
	};

	if (loading) return <p className='text-gray-400 text-center'>Loading users...</p>;

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			{tempPassword && (
				<div className='bg-green-900/40 border border-green-600 rounded-lg p-4 flex items-center justify-between'>
					<p className='text-green-300 text-sm'>
						Temporary password: <strong className='font-mono'>{tempPassword}</strong> — share securely with the user
					</p>
					<button onClick={copyPassword} className='text-green-400 hover:text-green-300'><Copy size={18} /></button>
					<button onClick={() => setTempPassword(null)} className='text-gray-400 ml-2'><X size={18} /></button>
				</div>
			)}

			<div className='flex flex-wrap gap-3 justify-between items-center'>
				<button onClick={() => setShowCreate(true)} className='flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white text-sm'>
					<UserPlus size={16} /> Create Account
				</button>
				<div className='flex flex-wrap gap-2'>
					<div className='relative'>
						<Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
						<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search...'
							className='pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white text-sm' />
					</div>
					<select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className='bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white text-sm'>
						<option value=''>All roles</option>
						<option value='student'>Student</option>
						<option value='admin'>Admin</option>
						<option value='super_admin'>Super Admin</option>
					</select>
					<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white text-sm'>
						<option value=''>All status</option>
						<option value='active'>Active</option>
						<option value='disabled'>Disabled</option>
					</select>
				</div>
			</div>

			{showCreate && (
				<motion.form onSubmit={handleCreate} className='bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4'>
					<h3 className='text-lg font-semibold text-red-400'>Create New Account</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<input required placeholder='Full name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
							className='bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white' />
						<input required type='email' placeholder='Email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
							className='bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white' />
						<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
							className='bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white'>
							{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
						</select>
						{["student", "admin"].includes(form.role) && (
							<>
								<input required={form.role === "student"} placeholder={form.role === "admin" ? "Admin NFC Card ID (optional)" : "NFC Card ID"} value={form.card} onChange={(e) => setForm({ ...form, card: e.target.value })}
									className='bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white' />
							</>
						)}
						{form.role === "student" && (
							<>
								<input type='number' min='0' placeholder='Initial balance' value={form.initialBalance}
									onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
									className='bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white' />
							</>
						)}
					</div>
					<p className='text-xs text-gray-500'>A temporary password will be generated automatically.</p>
					<div className='flex gap-2'>
						<button type='submit' className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white text-sm'>Create</button>
						<button type='button' onClick={() => setShowCreate(false)} className='bg-gray-700 px-4 py-2 rounded-md text-white text-sm'>Cancel</button>
					</div>
				</motion.form>
			)}

			<div className='space-y-3'>
				{users.map((user) => (
					<div key={user._id} className='bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-wrap justify-between items-center gap-3'>
						{editingUser?._id === user._id ? (
							<div className='flex flex-wrap gap-2 flex-1'>
								<input value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
									className='bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm' />
								<input value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
									className='bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm' />
								{["student", "admin"].includes(user.role) && (
									<input value={editingUser.card || ""} onChange={(e) => setEditingUser({ ...editingUser, card: e.target.value })}
										className='bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm' placeholder='NFC card' />
								)}
								<button onClick={handleUpdate} className='text-green-400'><Save size={18} /></button>
								<button onClick={() => setEditingUser(null)} className='text-red-400'><X size={18} /></button>
							</div>
						) : (
							<>
								<div>
									<p className='text-white font-medium'>{user.name}</p>
									<p className='text-gray-400 text-sm'>{user.email}</p>
									<p className='text-gray-500 text-xs capitalize'>
										{user.role.replace("_", " ")} · {user.isActive ? "Active" : "Disabled"}
										{user.role === "student" && ` · ₦${user.NFCunits?.toFixed(2)}`}
										{user.card && ` · Card ${user.card.slice(-4)}`}
									</p>
								</div>
								{user.role !== "super_admin" && (
									<div className='flex gap-2'>
										<button onClick={() => setEditingUser({ ...user })} className='p-2 bg-gray-700 rounded hover:bg-gray-600' title='Edit'><Edit3 size={16} /></button>
										<button onClick={() => handleResetPassword(user._id)} className='p-2 bg-gray-700 rounded hover:bg-gray-600' title='Reset password'><KeyRound size={16} /></button>
										<button onClick={() => handleToggleActive(user._id)} className='p-2 bg-gray-700 rounded hover:bg-gray-600' title='Toggle active'><Power size={16} /></button>
										<button onClick={() => handleDelete(user._id)} className='p-2 bg-red-900 rounded hover:bg-red-800' title='Delete'><Trash2 size={16} /></button>
									</div>
								)}
							</>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default UserManagementTab;
