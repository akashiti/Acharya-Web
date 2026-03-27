import ProductDetailClient from './ProductDetailClient';
export function generateStaticParams() { return []; }
export const dynamicParams = false;
export default function Page() { return <ProductDetailClient />; }
