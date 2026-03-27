import dynamic from 'next/dynamic';
const OrderDetailClient = dynamic(() => import('./OrderDetailClient'), { ssr: false });
export function generateStaticParams() { return []; }
export const dynamicParams = false;
export default function Page() { return <OrderDetailClient />; }
