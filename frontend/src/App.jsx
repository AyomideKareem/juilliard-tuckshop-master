import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore, isStudent, isAdmin } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import WalletPage from "./pages/WalletPage";
import StudentHistoryPage from "./pages/StudentHistoryPage";
import AccountPage from "./pages/AccountPage";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();
	const { getCartItems } = useCartStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (!user || !isStudent(user)) return;
		getCartItems();
	}, [getCartItems, user]);

	if (checkingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,0,0,0.3)_0%,rgba(139,0,0,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
				</div>
			</div>

			<div className='relative z-50 pt-20'>
				<Navbar />
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/signup' element={<Navigate to='/login' replace />} />
					<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
					<Route path='/admin' element={isAdmin(user) ? <AdminPage /> : <Navigate to='/login' />} />
					<Route path='/secret-dashboard' element={<Navigate to='/admin' replace />} />
					<Route path='/staff' element={<Navigate to='/admin' replace />} />
					<Route path='/category/:category' element={<CategoryPage />} />
					<Route path='/cart' element={isStudent(user) ? <CartPage /> : <Navigate to='/login' />} />
					<Route path='/wallet' element={isStudent(user) ? <WalletPage /> : <Navigate to='/login' />} />
					<Route path='/history' element={isStudent(user) ? <StudentHistoryPage /> : <Navigate to='/login' />} />
					<Route path='/account' element={isStudent(user) ? <AccountPage /> : <Navigate to='/login' />} />
				</Routes>
			</div>
			<Toaster />
		</div>
	);
}

export default App;
