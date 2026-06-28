import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { getAssetUrl } from "../lib/api.js";

const ProductCard = ({ product }) => {
	const { user } = useUserStore();
	const { addToCart } = useCartStore();

	const outOfStock = product.stock !== undefined && product.stock <= 0;

	const handleAddToCart = () => {
		if (!user) {
			toast.error("Please login to add to cart", { id: "login" });
		} else if (outOfStock) {
			toast.error("This item is out of stock");
		} else {
			addToCart(product);
		}
	};

	return (
		<div className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg'>
			<div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
				<img className='object-cover w-full' src={getAssetUrl(product.image)} alt={product.name} />
				<div className='absolute inset-0 bg-black bg-opacity-20' />
				{outOfStock && (
					<span className='absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded'>Out of stock</span>
				)}
			</div>

			<div className='mt-4 px-5 pb-5'>
				<h5 className='text-xl font-semibold tracking-tight text-white'>{product.name}</h5>
				<div className='mt-2 mb-5 flex items-center justify-between'>
					<p>
						<span className='text-3xl font-bold text-red-400'>₦{product.price.toFixed(2)}</span>
					</p>
					{product.stock !== undefined && (
						<span className={`text-sm ${product.stock <= 5 ? "text-yellow-400" : "text-gray-400"}`}>
							{product.stock} left
						</span>
					)}
				</div>
				<button
					className='flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed w-full'
					onClick={handleAddToCart}
					disabled={outOfStock}
				>
					<ShoppingCart size={22} className='mr-2' />
					{outOfStock ? "Out of stock" : "Add to cart"}
				</button>
			</div>
		</div>
	);
};

export default ProductCard;
