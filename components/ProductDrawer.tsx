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
                    "background-color": "rgba(255, 255, 255, 0.03)",
                    "border": "1px solid rgba(255, 255, 255, 0.05)",
                    "border-radius": "24px",
                    "padding": "20px",
                    "transition": "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "box-shadow": "0 8px 32px rgba(0,0,0,0.2)",
                    ":hover": {
                      "background-color": "rgba(255, 255, 255, 0.06)",
                      "border": "1px solid rgba(255, 255, 255, 0.1)",
                      "transform": "translateY(-4px)",
                      "box-shadow": "0 12px 40px rgba(0,0,0,0.3)",
                    },
                    "img": {
                      "height": "calc(100% - 15px)",
                      "position": "absolute",
                      "left": "0",
                      "right": "0",
                      "top": "0",
                      "border-radius": "18px"
                    },
                    "imgWrapper": {
                      "padding-top": "calc(75% + 15px)",
                      "position": "relative",
                      "height": "0"
                    }
                  },
                  "title": {
                    "color": "#FFFFFF",
                    "font-weight": "900",
                    "font-size": "16px",
                    "margin-top": "16px",
                    "letter-spacing": "-0.02em"
                  },
                  "price": {
                    "color": "rgba(255, 255, 255, 0.4)",
                    "font-size": "14px",
                    "font-weight": "900",
                    "letter-spacing": "0.05em",
                    "text-transform": "uppercase"
                  },
                  "button": {
                    "background": "linear-gradient(135deg, #7C6CFF 0%, #5EEAD4 100%)",
                    "color": "#FFFFFF",
                    "border-radius": "14px",
                    "font-weight": "900",
                    "padding": "14px 28px",
                    "text-transform": "uppercase",
                    "letter-spacing": "0.1em",
                    "font-size": "11px",
                    "transition": "all 0.3s ease",
                    ":hover": {
                      "background": "linear-gradient(135deg, #8D7FFF 0%, #6FFBE5 100%)",
                      "transform": "scale(0.98)",
                      "box-shadow": "0 0 20px rgba(124, 108, 255, 0.3)"
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
          className="fixed inset-x-0 bottom-0 z-50 h-[85vh] glass-card rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.6)] flex flex-col pt-4 border-t border-white/10 overflow-hidden"
        >
          {/* Drag Handle Area */}
          <div className="w-full flex justify-center pb-6 cursor-grab active:cursor-grabbing" onClick={onClose}>
            <div className="w-16 h-1.5 bg-white/10 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-8 pb-6 flex items-center justify-between border-b border-white/5 sticky top-0 z-10 bg-transparent backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5EEAD4]/10 rounded-xl flex items-center justify-center border border-[#5EEAD4]/20">
                <ShoppingBag size={20} className="text-[#5EEAD4]" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Shop the Look
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all text-white/40 hover:text-white active:scale-90"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar relative bg-transparent">
            {loading && !error && (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white/50 gap-5">
                <div className="w-12 h-12 border-4 border-white/5 border-t-[#5EEAD4] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Loading Collection...</p>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white/50 gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                  <ShoppingBag size={32} className="text-white/20" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Shop currently unavailable</p>
              </div>
            )}

            <div 
              id="collection-component-1773375176268" 
              ref={containerRef}
              className={`w-full transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
            ></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
