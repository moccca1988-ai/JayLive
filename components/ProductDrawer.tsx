'use client';

import { X, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  price: string;
  currencyCode: string;
  imageUrl: string;
}

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDrawer({ isOpen, onClose }: ProductDrawerProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && products.length === 0) {
      const fetchProducts = async () => {
        try {
          const res = await fetch('/api/products');
          if (!res.ok) throw new Error('Failed to fetch products');
          const data = await res.json();
          setProducts(data.products || []);
        } catch (err) {
          setError('No products available');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [isOpen, products.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-0 z-50 h-[80vh] bg-black/80 backdrop-blur-2xl border-t border-white/20 rounded-t-3xl flex flex-col pt-2"
        >
          {/* Drag Handle Area */}
          <div className="w-full flex justify-center pb-4 cursor-grab active:cursor-grabbing" onClick={onClose}>
            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-4 flex items-center justify-between border-b border-white/10 sticky top-0 bg-black/20 backdrop-blur-md z-10">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingBag size={20} />
              Shop the Look
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : error || products.length === 0 ? (
              <div className="flex justify-center items-center h-full text-white/50">
                {error || 'No products available'}
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-center hover:bg-white/10 transition-colors"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg truncate">{product.title}</h3>
                    <p className="text-white/70 mt-1">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: product.currencyCode || 'EUR' }).format(parseFloat(product.price))}
                    </p>
                    <a
                      href={`https://jayjaym.com/products/${product.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block w-full text-center bg-white text-black font-semibold py-2 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Jetzt kaufen
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
