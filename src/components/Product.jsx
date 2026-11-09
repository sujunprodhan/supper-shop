import { getProduct } from '@/actions/server/product';
import ProductCard from '@/carddesign/ProductCard';
import Container from '@/layout/Container';


const Product = async () => {
  const products = await getProduct();

  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-6">
          All Products ({products?.length || 0})
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Product;
