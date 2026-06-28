import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, CreditCard, Mail, Lock, Loader } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
	const [mode, setMode] = useState("student");
	const [adminMethod, setAdminMethod] = useState("password");
	const [card, setCard] = useState("");
	const [adminCard, setAdminCard] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { loginStudent, loginAdmin, loginAdminWithCard, loading } = useUserStore();

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div className='sm:mx-auto sm:w-full sm:max-w-md' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-red-400'>School Tuckshop Login</h2>
				<p className='mt-2 text-center text-sm text-gray-400'>
					School-managed accounts only — contact administration for access
				</p>
			</motion.div>

			<motion.div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
				<div className='flex mb-4 rounded-lg overflow-hidden border border-gray-600'>
					<button
						type='button'
						onClick={() => setMode("student")}
						className={`flex-1 py-2 text-sm font-medium ${mode === "student" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300"}`}
					>
						Student (NFC)
					</button>
					<button
						type='button'
						onClick={() => setMode("admin")}
						className={`flex-1 py-2 text-sm font-medium ${mode === "admin" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300"}`}
					>
						Admin
					</button>
				</div>

				<div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					{mode === "student" ? (
						<form onSubmit={(e) => { e.preventDefault(); loginStudent(card); }} className='space-y-6'>
							<div>
								<label htmlFor='card' className='block text-sm font-medium text-gray-300'>NFC Card ID</label>
								<div className='mt-1 relative'>
									<CreditCard className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
									<input
										id='card'
										type='password'
										required
										value={card}
										onChange={(e) => setCard(e.target.value)}
										className='block w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-red-500'
										placeholder='Tap or enter NFC card ID'
										autoFocus
									/>
								</div>
							</div>
							<button type='submit' disabled={loading} className='w-full py-2 bg-red-600 hover:bg-red-700 rounded-md text-white disabled:opacity-50 flex justify-center items-center'>
								{loading ? <Loader className='h-5 w-5 animate-spin' /> : <><LogIn className='mr-2 h-5 w-5' />Login with NFC</>}
							</button>
						</form>
					) : (
						<div className='space-y-6'>
							<div className='grid grid-cols-2 rounded-md border border-gray-600 overflow-hidden'>
								<button
									type='button'
									onClick={() => setAdminMethod("password")}
									className={`py-2 text-sm ${adminMethod === "password" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
								>
									Password
								</button>
								<button
									type='button'
									onClick={() => setAdminMethod("card")}
									className={`py-2 text-sm ${adminMethod === "card" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
								>
									NFC Card
								</button>
							</div>

							{adminMethod === "password" ? (
								<form onSubmit={(e) => { e.preventDefault(); loginAdmin({ email, password }); }} className='space-y-6'>
									<div>
										<label htmlFor='email' className='block text-sm font-medium text-gray-300'>Email</label>
										<div className='mt-1 relative'>
											<Mail className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
											<input id='email' type='email' required value={email} onChange={(e) => setEmail(e.target.value)}
												className='block w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-red-500' />
										</div>
									</div>
									<div>
										<label htmlFor='password' className='block text-sm font-medium text-gray-300'>Password</label>
										<div className='mt-1 relative'>
											<Lock className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
											<input id='password' type='password' required value={password} onChange={(e) => setPassword(e.target.value)}
												className='block w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-red-500' />
										</div>
									</div>
									<button type='submit' disabled={loading} className='w-full py-2 bg-red-600 hover:bg-red-700 rounded-md text-white disabled:opacity-50 flex justify-center items-center'>
										{loading ? <Loader className='h-5 w-5 animate-spin' /> : <><LogIn className='mr-2 h-5 w-5' />Admin Login</>}
									</button>
								</form>
							) : (
								<form onSubmit={(e) => { e.preventDefault(); loginAdminWithCard(adminCard); }} className='space-y-6'>
									<div>
										<label htmlFor='adminCard' className='block text-sm font-medium text-gray-300'>Admin NFC Card ID</label>
										<div className='mt-1 relative'>
											<CreditCard className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
											<input
												id='adminCard'
												type='password'
												required
												value={adminCard}
												onChange={(e) => setAdminCard(e.target.value)}
												className='block w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-red-500'
												placeholder='Tap or enter admin NFC card'
											/>
										</div>
									</div>
									<button type='submit' disabled={loading} className='w-full py-2 bg-red-600 hover:bg-red-700 rounded-md text-white disabled:opacity-50 flex justify-center items-center'>
										{loading ? <Loader className='h-5 w-5 animate-spin' /> : <><LogIn className='mr-2 h-5 w-5' />Login with NFC</>}
									</button>
								</form>
							)}
						</div>
					)}
				</div>
			</motion.div>
		</div>
	);
};

export default LoginPage;
