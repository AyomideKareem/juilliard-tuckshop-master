import { useEffect, useState } from "react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";

const PaymentPage = () => {
  const { cart, clearCart } = useCartStore();
  const [nfcConnected, setNfcConnected] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failed' | null
  const [balance, setBalance] = useState(100); // Example starting NFC card balance
  const totalUnits = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Simulate connecting to an NFC card reader
  const handleScanNFC = () => {
    setNfcConnected(true);

    setTimeout(() => {
      if (balance >= totalUnits) {
        setBalance(balance - totalUnits);
        clearCart();
        setPaymentStatus("success");
      } else {
        setPaymentStatus("failed");
      }
    }, 2000); // simulate delay
  };

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <motion.div
            className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {cart.length === 0 ? (
              <EmptyPaymentUI />
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <CartItem key={item._id} item={item} currency="units" />
                ))}
              </div>
            )}
          </motion.div>

          {cart.length > 0 && (
            <motion.div
              className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <OrderSummary currency="units" />

              <div className="rounded-lg border p-6 shadow-md bg-white text-center">
                <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                <h3 className="text-lg font-semibold mb-2">Tap Your NFC Card to Pay</h3>
                <p className="text-gray-600 mb-4">
                  Total: <strong>{totalUnits} units</strong>
                </p>
                <button
                  onClick={handleScanNFC}
                  disabled={paymentStatus !== null}
                  className="rounded-md bg-green-500 px-6 py-2 text-white hover:bg-green-600 transition"
                >
                  {nfcConnected ? "Processing Payment..." : "Scan NFC Card"}
                </button>

                {paymentStatus === "success" && (
                  <motion.div
                    className="mt-6 flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="text-green-600 font-semibold mt-2">Payment Successful!</p>
                    <p className="text-gray-500">Remaining Balance: {balance} units</p>
                    <Link
                      to="/"
                      className="mt-4 rounded-md bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 transition"
                    >
                      Back to Shop
                    </Link>
                  </motion.div>
                )}

                {paymentStatus === "failed" && (
                  <motion.div
                    className="mt-6 flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <XCircle className="h-12 w-12 text-red-500" />
                    <p className="text-red-600 font-semibold mt-2">Insufficient Balance!</p>
                    <p className="text-gray-500">You need {totalUnits - balance} more units.</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

const EmptyPaymentUI = () => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <CreditCard className="h-24 w-24 text-gray-300" />
    <h3 className="text-2xl font-semibold ">No items to pay for</h3>
    <p className="text-gray-400">Add some snacks before making a payment.</p>
    <Link
      className="mt-4 rounded-md bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600"
      to="/"
    >
      Go Shopping
    </Link>
  </motion.div>
);
