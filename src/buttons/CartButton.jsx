'use client';
import { usePathname, useRouter } from 'next/navigation';
import { FaShoppingCart } from 'react-icons/fa';
const CartButton = ({ product }) => {
  const isLogin = false;
  const router = useRouter();
  const path = usePathname();
  const addToCart = () => {
    if (isLogin) alert(product._id);
    else {
      router.push(`/login?callbackUrl=${path}`);
    }
  };
  return (
    <div className="grid gap-2">
      <button
        onClick={addToCart}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-2 text-xs font-semibold text-white shadow-xs shadow-sky-600/30 hover:bg-sky-700 hover:shadow-sky-600/40 transition-all duration-200"
      >
        <FaShoppingCart className="text-xs" />
        <span>Add To Cart</span>
      </button>
    </div>
  );
};

export default CartButton;
