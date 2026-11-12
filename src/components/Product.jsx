import React from 'react';
import { getProduct } from '@/actions/server/product';
import Container from '@/layout/Container';
import HomeProductsWithPagination from './HomeProductsWithPagination';

const Product = async () => {
  const products = await getProduct();

  return (
    <section className="py-12 md:py-16">
      <Container>
        <HomeProductsWithPagination products={products || []} />
      </Container>
    </section>
  );
};

export default Product;
