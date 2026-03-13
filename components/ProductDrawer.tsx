'use client';

import { X, ShoppingBag } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDrawer({ isOpen, onClose }: ProductDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isOpen || initialized.current) return;

    const initShopify = () => {
      try {
        const client = (window as any).ShopifyBuy.buildClient({
          domain: 'k711ap-ru.myshopify.com',
          storefrontAccessToken: 'd723c4a0a944f835606d0a15fc314214',
        });

        (window as any).ShopifyBuy.UI.onReady(client).then((ui: any) => {
          if (!containerRef.current) return;

          ui.createComponent('collection', {
            id: '695006429529',
            node: containerRef.current,
            moneyFormat: '%E2%82%AC%7B%7Bamount_with_comma_separator%7D%7D',
            options: {
              "product": {
                "styles": {
                  "product": {
                    "@media (min-width: 601px)": {
                      "max-width": "calc(25% - 20px)",
                      "margin-left": "20px",
                      "margin-bottom": "50px",
                      "width": "calc(25% - 20px)"
                    },
                    "background-color": "rgba(255, 255, 255, 0.03)",
                    "border": "1px solid rgba(255, 255, 255, 0.08)",
                    "border-radius": "16px",
                    "padding": "16px",
                    "transition": "all 0.3s ease",
                    ":hover": {
                      "background-color": "rgba(255, 255, 255, 0.08)",
                      "border": "1px solid rgba(255, 255, 255, 0.15)",
                    },
                    "img": {
                      "height": "calc(100% - 15px)",
                      "position": "absolute",
                      "left": "0",
                      "right": "0",
                      "top": "0",
                      "border-radius": "8px"
                    },
                    "imgWrapper": {
                      "padding-top": "calc(75% + 15px)",
                      "position": "relative",
                      "height": "0"
                    }
                  },
                  "title": {
                    "color": "#ffffff",
                    "font-weight": "600",
                    "font-size": "15px",
                    "margin-top": "12px"
                  },
                  "price": {
                    "color": "rgba(255, 255, 255, 0.8)",
                    "font-size": "14px",
                    "font-weight": "500"
                  },
                  "button": {
                    "background": "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                    "color": "#ffffff",
                    "border-radius": "8px",
                    "font-weight": "600",
                    "padding": "10px 20px",
                    "transition": "opacity 0.2s ease",
                    ":hover": {
                      "background": "linear-gradient(135deg, #4338ca 0%, #1d4ed8 100%)",
                      "opacity": "0.9"
                    }
                  }
                },
                "buttonDestination": "checkout",
                "text": {
                  "button": "Buy now"
                }
              },
              "productSet": {
                "styles": {
                  "products": {
                    "@media (min-width: 601px)": {
                      "margin-left": "-20px"
                    }
                  }
                }
              },
              "modalProduct": {
                "contents": {
                  "img": false,
                  "imgWithCarousel": true,
                  "button": false,
                  "buttonWithQuantity": true
                },
                "styles": {
                  "product": {
                    "@media (min-width: 601px)": {
                      "max-width": "100%",
                      "margin-left": "0px",
                      "margin-bottom": "0px"
                    }
                  },
                  "title": {
                    "color": "#1a1a1a"
                  },
                  "price": {
                    "color": "#4a4a4a"
                  }
                },
                "text": {
                  "button": "Add to cart"
                }
              },
              "cart": {
                "text": {
                  "total": "Subtotal",
                  "button": "Checkout"
                }
              }
            }
          });
          
          setLoading(false);
          initialized.current = true;
        }).catch((err: any) => {
          console.error('Shopify UI Error:', err);
          setError(true);
          setLoading(false);
        });
      } catch (err) {
        console.error('Shopify Init Error:', err);
        setError(true);
        setLoading(false);
      }
    };

    const loadScript = () => {
      if ((window as any).ShopifyBuy && (window as any).ShopifyBuy.UI) {
        initShopify();
      } else {
        const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
        const existingScript = document.querySelector(`script[src="${scriptURL}"]`);

        if (existingScript) {
          existingScript.addEventListener('load', initShopify);
        } else {
          const script = document.createElement('script');
          script.async = true;
          script.src = scriptURL;
          script.onload = initShopify;
          script.onerror = () => {
            setError(true);
            setLoading(false);
          };
          document.head.appendChild(script);
        }
      }
    };

    loadScript();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-t-[28px] shadow-2xl flex flex-col pt-3"
        >
          {/* Drag Handle Area */}
          <div className="w-full flex justify-center pb-5 cursor-grab active:cursor-grabbing" onClick={onClose}>
            <div className="w-14 h-1.5 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-5 flex items-center justify-between border-b border-white/10 sticky top-0 z-10">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-white tracking-wide">
              <ShoppingBag size={20} className="text-white/80" />
              Shop the Look
            </h2>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 rounded-full hover:bg-white/15 transition-colors text-white/80 hover:text-white border border-white/5"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar relative">
            {loading && !error && (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white/60 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white/80"></div>
                <p className="text-sm font-medium tracking-wide">Produkte werden geladen ...</p>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white/50 gap-3">
                <ShoppingBag size={40} className="opacity-50" />
                <p className="text-base font-medium">Shop momentan nicht verfügbar</p>
              </div>
            )}

            <div 
              id="collection-component-1773375176268" 
              ref={containerRef}
              className={`w-full transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
            ></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
