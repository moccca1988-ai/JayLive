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
    if (!isOpen) {
      initialized.current = false;
      return;
    }

    if (initialized.current) return;

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
                    "background-color": "#1A1A1A",
                    "border": "1px solid #333333",
                    "border-radius": "20px",
                    "padding": "16px",
                    "transition": "all 0.3s ease",
                    "box-shadow": "0 2px 8px rgba(0,0,0,0.02)",
                    ":hover": {
                      "background-color": "#222222",
                      "border": "1px solid #444444",
                      "box-shadow": "0 4px 12px rgba(0,0,0,0.04)",
                    },
                    "img": {
                      "height": "calc(100% - 15px)",
                      "position": "absolute",
                      "left": "0",
                      "right": "0",
                      "top": "0",
                      "border-radius": "12px"
                    },
                    "imgWrapper": {
                      "padding-top": "calc(75% + 15px)",
                      "position": "relative",
                      "height": "0"
                    }
                  },
                  "title": {
                    "color": "#FFFFFF",
                    "font-weight": "600",
                    "font-size": "15px",
                    "margin-top": "12px"
                  },
                  "price": {
                    "color": "#A3A3A3",
                    "font-size": "14px",
                    "font-weight": "500"
                  },
                  "button": {
                    "background": "#FFFFFF",
                    "color": "#000000",
                    "border-radius": "100px",
                    "font-weight": "600",
                    "padding": "12px 24px",
                    "transition": "all 0.2s ease",
                    ":hover": {
                      "background": "#E5E5E5",
                      "transform": "scale(0.98)"
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
                    "color": "#FFFFFF"
                  },
                  "price": {
                    "color": "#A3A3A3"
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
          className="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-[#141414] rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] flex flex-col pt-3 border-t border-white/10"
        >
          {/* Drag Handle Area */}
          <div className="w-full flex justify-center pb-5 cursor-grab active:cursor-grabbing" onClick={onClose}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-5 flex items-center justify-between border-b border-white/10 sticky top-0 z-10 bg-[#141414]/80 backdrop-blur-xl">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-white tracking-tight">
              <ShoppingBag size={20} className="text-white" />
              Shop the Look
            </h2>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar relative bg-[#0A0A0A]">
            {loading && !error && (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white/50 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
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
