import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

const categories = ["Pastries", "Drinks", "Snacks"];

const CreateProductForm = () => {
	const [form, setForm] = useState({
		name: "",
		description: "",
		price: "",
		category: "",
		stock: "10",
		lowStockThreshold: "5",
	});
	const [imageFile, setImageFile] = useState(null);

	const { createProduct, loading } = useProductStore();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!imageFile) return;

		const formData = new FormData();
		formData.append("name", form.name);
		formData.append("description", form.description);
		formData.append("price", form.price);
		formData.append("category", form.category);
		formData.append("stock", form.stock);
		formData.append("lowStockThreshold", form.lowStockThreshold);
		formData.append("image", imageFile);

		await createProduct(formData);
		setForm({ name: "", description: "", price: "", category: "", stock: "10", lowStockThreshold: "5" });
		setImageFile(null);
	};

	return (
		<motion.div
			className='bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<h2 className='text-2xl font-semibold mb-6 text-red-300'>Create New Product</h2>

			<form onSubmit={handleSubmit} className='space-y-4'>
				{["name", "description", "price"].map((field) => (
					<div key={field}>
						<label className='block text-sm font-medium text-gray-300 capitalize'>{field}</label>
						{field === "description" ? (
							<textarea
								value={form.description}
								onChange={(e) => setForm({ ...form, description: e.target.value })}
								rows='3'
								className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-red-500'
								required
							/>
						) : (
							<input
								type={field === "price" ? "number" : "text"}
								value={form[field]}
								onChange={(e) => setForm({ ...form, [field]: e.target.value })}
								className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-red-500'
								required
							/>
						)}
					</div>
				))}

				<div>
					<label className='block text-sm font-medium text-gray-300'>Category</label>
					<select
						value={form.category}
						onChange={(e) => setForm({ ...form, category: e.target.value })}
						className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-red-500'
						required
					>
						<option value=''>Select a category</option>
						{categories.map((c) => (
							<option key={c} value={c}>{c}</option>
						))}
					</select>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div>
						<label className='block text-sm font-medium text-gray-300'>Initial Stock</label>
						<input
							type='number'
							min='0'
							value={form.stock}
							onChange={(e) => setForm({ ...form, stock: e.target.value })}
							className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white'
							required
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-300'>Low Stock Alert</label>
						<input
							type='number'
							min='0'
							value={form.lowStockThreshold}
							onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
							className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white'
							required
						/>
					</div>
				</div>

				<div className='mt-1 flex items-center'>
					<input
						type='file'
						id='image'
						className='sr-only'
						accept='image/*'
						onChange={(e) => setImageFile(e.target.files[0])}
					/>
					<label
						htmlFor='image'
						className='cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md text-sm text-gray-300 hover:bg-gray-600'
					>
						<Upload className='h-5 w-5 inline-block mr-2' />
						Upload Image (local)
					</label>
					{imageFile && <span className='ml-3 text-sm text-gray-400'>{imageFile.name}</span>}
				</div>

				<button
					type='submit'
					className='w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50'
					disabled={loading || !imageFile}
				>
					{loading ? <Loader className='h-5 w-5 animate-spin' /> : <><PlusCircle className='mr-2 h-5 w-5' />Create Product</>}
				</button>
			</form>
		</motion.div>
	);
};

export default CreateProductForm;
