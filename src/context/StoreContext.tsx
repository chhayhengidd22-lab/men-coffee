import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  CafeTable,
  TableReservation,
  Coupon,
  CustomerReview,
  StoreLocation,
  ProductCustomization,
  OrderStatus,
  OrderType,
  PaymentMethod,
  StoreSettings,
  StockMovement,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  STORE_LOCATIONS,
  DEFAULT_STORE_SETTINGS,
  INITIAL_STOCK_MOVEMENTS,
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { makeLaravelResponse } from '../services/api';
import confetti from 'canvas-confetti';
import { db, collection, doc, setDoc, onSnapshot } from '../services/firebase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  tables: CafeTable[];
  reservations: TableReservation[];
  coupons: Coupon[];
  reviews: CustomerReview[];
  locations: StoreLocation[];
  favorites: string[];
  appliedCoupon: Coupon | null;
  toasts: Toast[];
  currentTrackingOrder: Order | null;
  storeSettings: StoreSettings;
  stockMovements: StockMovement[];
  language: 'kh' | 'en';
  setLanguage: (lang: 'kh' | 'en') => void;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => void;
  addToCart: (product: Product, customization: ProductCustomization, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  createOrder: (orderData: {
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    phone: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Promise<{ success: boolean; orderId?: string; message: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  reserveTable: (data: {
    date: string;
    timeSlot: string;
    guestCount: number;
    section: any;
    specialRequest?: string;
    customerPhone: string;
  }) => Promise<{ success: boolean; message: string }>;
  updateTableStatus: (tableId: string, status: any) => void;
  updateProductStock: (productId: string, inStock: boolean, stockCount?: number) => void;
  restockProduct: (productId: string, quantityToAdd: number, reason: string, performedBy?: string) => Promise<boolean>;
  addNewProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, data: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  updateReservationStatus: (reservationId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => void;
  deleteReservation: (reservationId: string) => void;
  toggleFavorite: (productId: string) => void;
  submitReview: (review: { rating: number; comment: string; productName: string }) => void;
  approveReview: (reviewId: string) => void;
  setCurrentTrackingOrder: (order: Order | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  addNewCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  toggleCouponActive: (couponId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const PRODUCTS_KEY = 'aura_cafe_products_v2';
const CART_KEY = 'aura_cafe_cart_v2';
const ORDERS_KEY = 'aura_cafe_orders_v2';
const TABLES_KEY = 'aura_cafe_tables_v2';
const RESERVATIONS_KEY = 'aura_cafe_reservations_v2';
const COUPONS_KEY = 'aura_cafe_coupons_v2';
const REVIEWS_KEY = 'aura_cafe_reviews_v2';
const FAVORITES_KEY = 'aura_cafe_favorites_v2';
const LANG_KEY = 'aura_cafe_language_v2';
const STORE_SETTINGS_KEY = 'aura_cafe_store_settings_v2';
const STOCK_MOVEMENTS_KEY = 'aura_cafe_stock_movements_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addActivityLog, updateUser } = useAuth();

  const [language, setLanguageState] = useState<'kh' | 'en'>(() => {
    return (localStorage.getItem(LANG_KEY) as 'kh' | 'en') || 'kh';
  });

  const setLanguage = (lang: 'kh' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem(STORE_SETTINGS_KEY);
      return stored ? { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(stored) } : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(storeSettings));
  }, [storeSettings]);

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    const updated = { ...storeSettings, ...newSettings };
    setStoreSettings(updated);
    try {
      setDoc(doc(db, 'storeSettings', 'main'), updated, { merge: true });
    } catch (err) {
      console.warn('Saved locally, Firestore sync error:', err);
    }
    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'STORE_SETTINGS_UPDATED',
      actionKh: 'បានកែប្រែការកំណត់ហាង (Brand Logo & Background)',
      details: `Admin updated store settings: ${Object.keys(newSettings).join(', ')}`,
      ipAddress: '103.216.51.88',
      device: 'Admin Console',
      status: 'info',
    });
    showToast(
      language === 'kh'
        ? 'បានរក្សាទុកការកំណត់ហាងដោយជោគជ័យនៅលើ Google Cloud!'
        : 'Store settings saved successfully to Google Cloud!',
      'success'
    );
  };

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Product[];
        // Merge in any newly introduced products (e.g. burgers, bakery) if they aren't in local storage yet
        const existingIds = new Set(parsed.map((p) => p.id));
        const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
        // Also update image/name for existing items if they had outdated images
        const updated = parsed.map((p) => {
          const fresh = INITIAL_PRODUCTS.find((init) => init.id === p.id);
          if (fresh) {
            return {
              ...p,
              image: fresh.image,
              nameKh: fresh.nameKh || p.nameKh,
              category: fresh.category || p.category,
            };
          }
          return p;
        });
        return [...updated, ...missing];
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const stored = localStorage.getItem(STOCK_MOVEMENTS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_STOCK_MOVEMENTS;
    } catch {
      return INITIAL_STOCK_MOVEMENTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STOCK_MOVEMENTS_KEY, JSON.stringify(stockMovements));
  }, [stockMovements]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [tables, setTables] = useState<CafeTable[]>(() => {
    try {
      const stored = localStorage.getItem(TABLES_KEY);
      return stored ? JSON.parse(stored) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [reservations, setReservations] = useState<TableReservation[]>(() => {
    try {
      const stored = localStorage.getItem(RESERVATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const stored = localStorage.getItem(COUPONS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_KEY);
      return stored ? JSON.parse(stored) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : ['prod-1', 'prod-2'];
    } catch {
      return ['prod-1', 'prod-2'];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentTrackingOrder, setCurrentTrackingOrder] = useState<Order | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Real-Time Google Cloud Firestore Synchronization (Cross-device PC & Mobile)
  useEffect(() => {
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;
    let unsubscribeTables: (() => void) | undefined;

    try {
      // 1. Sync Customer Orders & Invoices in real-time across devices
      const ordersCol = collection(db, 'orders');
      unsubscribeOrders = onSnapshot(
        ordersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteOrders: Order[] = [];
            snapshot.forEach((docSnap) => {
              remoteOrders.push(docSnap.data() as Order);
            });
            remoteOrders.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(remoteOrders);
          }
        },
        (error) => {
          console.warn('Firestore orders sync notice:', error.message);
        }
      );

      // 2. Sync Store Branding & Settings in real-time across devices
      const settingsDoc = doc(db, 'storeSettings', 'main');
      unsubscribeSettings = onSnapshot(
        settingsDoc,
        (docSnap) => {
          if (docSnap.exists()) {
            const remoteSettings = docSnap.data() as StoreSettings;
            setStoreSettings((prev) => ({ ...prev, ...remoteSettings }));
          }
        },
        (error) => {
          console.warn('Firestore settings sync notice:', error.message);
        }
      );

      // 3. Sync Tables in real-time across devices
      const tablesCol = collection(db, 'cafeTables');
      unsubscribeTables = onSnapshot(
        tablesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteTables: CafeTable[] = [];
            snapshot.forEach((docSnap) => {
              remoteTables.push(docSnap.data() as CafeTable);
            });
            setTables(remoteTables);
          }
        },
        (error) => {
          console.warn('Firestore tables sync notice:', error.message);
        }
      );
    } catch (err) {
      console.warn('Firestore real-time listener notice:', err);
    }

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeSettings) unsubscribeSettings();
      if (unsubscribeTables) unsubscribeTables();
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const calculateCustomizedItemPrice = (product: Product, custom: ProductCustomization): number => {
    let price = product.basePrice;
    if (custom.size === 'large') price += 0.80;
    if (custom.size === 'small') price -= 0.30;
    if (custom.milk === 'oat' || custom.milk === 'almond' || custom.milk === 'coconut') price += 0.60;
    if (custom.milk === 'soy') price += 0.50;
    price += (custom.extraShots || 0) * 0.80;
    return Math.max(1, price);
  };

  const addToCart = (product: Product, customization: ProductCustomization, quantity = 1) => {
    const unitPrice = calculateCustomizedItemPrice(product, customization);
    const itemTotal = unitPrice * quantity;

    const newItem: CartItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      product,
      customization,
      quantity,
      itemTotal,
    };

    setCart((prev) => [...prev, newItem]);
    showToast(
      language === 'kh'
        ? `បានដាក់ "${product.nameKh}" ចូលក្នុងកន្ត្រក`
        : `Added "${product.name}" to basket`,
      'success'
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const singleUnitPrice = item.itemTotal / item.quantity;
            return {
              ...item,
              quantity: newQty,
              itemTotal: Number((singleUnitPrice * newQty).toFixed(2)),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!found) {
      return {
        success: false,
        message: language === 'kh' ? 'លេខកូដមិនត្រឹមត្រូវ ឬផុតកំណត់' : 'Invalid or expired promo code',
      };
    }

    const subtotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);
    if (subtotal < found.minSpend) {
      return {
        success: false,
        message:
          language === 'kh'
            ? `ត្រូវការទិញយ៉ាងតិច $${found.minSpend.toFixed(2)} ដើម្បីប្រើកូដនេះ`
            : `Requires minimum order of $${found.minSpend.toFixed(2)}`,
      };
    }

    setAppliedCoupon(found);
    return {
      success: true,
      message: language === 'kh' ? `បានប្រើកូដ ${cleanCode} ជោគជ័យ!` : `Code ${cleanCode} applied!`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const createOrder = async (orderData: {
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    phone: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Promise<{ success: boolean; orderId?: string; message: string }> => {
    if (!user) {
      return {
        success: false,
        message:
          language === 'kh'
            ? 'សូមចូលគណនីជាមុនសិន មុននឹងបន្តការទិញ (Please login)'
            : 'Please log in to your account before checking out.',
      };
    }

    const customerPhone = (orderData.phone || user.phone || '').trim();
    if (!customerPhone) {
      return {
        success: false,
        message:
          language === 'kh'
            ? 'តម្រូវឱ្យមានលេខទូរស័ព្ទត្រឹមត្រូវដើម្បីទិញទំនិញ (Phone required)'
            : 'A valid phone number is required to complete purchase.',
      };
    }

    if (!user.email || !user.email.includes('@')) {
      return {
        success: false,
        message:
          language === 'kh'
            ? 'តម្រូវឱ្យមានអ៊ីមែលត្រឹមត្រូវដើម្បីទិញទំនិញ (Email required)'
            : 'A valid email is required to complete purchase.',
      };
    }

    if (cart.length === 0) {
      return {
        success: false,
        message: language === 'kh' ? 'កន្ត្រករបស់អ្នកទទេ' : 'Your cart is empty',
      };
    }

    const subtotal = cart.reduce((sum, i) => sum + i.itemTotal, 0);
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = (subtotal * appliedCoupon.discountValue) / 100;
      } else {
        discount = appliedCoupon.discountValue;
      }
      discount = Math.min(discount, subtotal);
    }

    // Delivery fee is always paid by the customer when ordering delivery
    const deliveryFee = orderData.orderType === 'delivery' ? (storeSettings.deliveryFee || 1.50) : 0;
    const total = Math.max(0, Number((subtotal - discount + deliveryFee).toFixed(2)));
    const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const nowIso = new Date().toISOString();
    const dateFormatted = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      userId: user.id,
      customerName: user.name,
      customerPhone: customerPhone,
      customerEmail: user.email,
      items: [...cart],
      subtotal,
      discount,
      deliveryFee,
      total,
      status: 'brewing',
      orderType: orderData.orderType,
      tableNumber: orderData.tableNumber,
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'cash' ? 'pending' : 'paid',
      couponCode: appliedCoupon?.code,
      notes: orderData.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [
        {
          status: 'pending',
          label: 'Order Placed & Queued',
          labelKh: 'បានទទួលការបញ្ជាទិញ',
          timestamp: timeStr,
          completed: true,
        },
        {
          status: 'brewing',
          label: 'Barista Crafting & Extracting',
          labelKh: 'Barista កំពុងឆុងយ៉ាងផ្ចិតផ្ចង់',
          timestamp: timeStr,
          completed: true,
        },
        {
          status: orderData.orderType === 'delivery' ? 'delivering' : 'ready',
          label: orderData.orderType === 'delivery' ? 'Rider on the Way' : 'Ready for Service',
          labelKh: orderData.orderType === 'delivery' ? 'អ្នកដឹកជញ្ជូនកំពុងធ្វើដំណើរ (ថ្លៃដឹកភ្ញៀវចេញ)' : 'រួចរាល់សម្រាប់ការបម្រើ',
          timestamp: '--:--',
          completed: false,
        },
        {
          status: 'completed',
          label: 'Enjoy Your Coffee',
          labelKh: 'បានបញ្ចប់ជោគជ័យ',
          timestamp: '--:--',
          completed: false,
        },
      ],
    };

    // If dine-in, mark table as occupied
    if (orderData.orderType === 'dine_in' && orderData.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.number === orderData.tableNumber
            ? { ...t, status: 'occupied', currentOrderId: orderNumber }
            : t
        )
      );
    }

    // Decrement stock in real-time and record individual stock movement entries with exact date
    const createdMovements: StockMovement[] = [];
    setProducts((prev) =>
      prev.map((p) => {
        const matching = cart.filter((c) => c.product.id === p.id);
        const totalQty = matching.reduce((sum, item) => sum + item.quantity, 0);
        if (totalQty > 0) {
          const newStock = Math.max(0, p.stockCount - totalQty);
          createdMovements.push({
            id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            productId: p.id,
            productName: p.nameKh ? `${p.name} (${p.nameKh})` : p.name,
            type: 'OUT',
            quantity: totalQty,
            previousStock: p.stockCount,
            newStock,
            reason: `កាត់ស្តុកដោយសារការកុម្ម៉ង់ទិញ #${orderNumber} (${orderData.orderType === 'delivery' ? 'ដឹកជញ្ជូន' : orderData.orderType === 'takeaway' ? 'ខ្ចប់' : 'ញ៉ាំនៅហាង'})`,
            referenceId: newOrder.id,
            performedBy: `${user.name} (Customer)`,
            createdAt: dateFormatted,
          });
          return {
            ...p,
            stockCount: newStock,
            inStock: newStock > 0,
          };
        }
        return p;
      })
    );

    if (createdMovements.length > 0) {
      setStockMovements((prev) => [...createdMovements, ...prev]);
    }

    // Add to orders and push to Google Cloud Firestore for real-time mobile & PC sync
    setOrders((prev) => [newOrder, ...prev]);
    try {
      setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (err) {
      console.warn('Saved locally, Firestore sync error:', err);
    }

    // Update user stats in admin system
    if (user) {
      updateUser(user.id, {
        ordersCount: (user.ordersCount || 0) + 1,
        totalSpent: Number(((user.totalSpent || 0) + total).toFixed(2)),
      });
    }

    // Record activity log for admin
    addActivityLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      action: 'ORDER_PLACED',
      actionKh: 'បានបង្កើតការបញ្ជាទិញថ្មី',
      details: `Created order #${orderNumber} (${orderData.orderType.toUpperCase()}) totaling $${total.toFixed(2)} via ${orderData.paymentMethod.toUpperCase()}.`,
      ipAddress: '103.216.51.88',
      device: 'Client Device',
      status: 'success',
    });

    makeLaravelResponse(
      { order: newOrder },
      '/api/v1/orders',
      'POST',
      `Order #${orderNumber} created successfully`,
      201
    );

    // Fire celebration confetti!
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d97706', '#b45309', '#f59e0b', '#78350f'],
      });
    } catch {}

    clearCart();
    setCurrentTrackingOrder(newOrder);

    return {
      success: true,
      orderId: newOrder.id,
      message:
        language === 'kh'
          ? `ការបញ្ជាទិញ #${orderNumber} ជោគជ័យ!`
          : `Order #${orderNumber} placed successfully!`,
    };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return false;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedTimeline = o.timeline.map((step) => {
            if (step.status === status) {
              return { ...step, completed: true, timestamp: timeStr };
            }
            return step;
          });
          return {
            ...o,
            status,
            updatedAt: new Date().toISOString(),
            timeline: updatedTimeline,
          };
        }
        return o;
      })
    );

    try {
      setDoc(
        doc(db, 'orders', target.id),
        {
          status,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore status sync error:', err);
    }

    // If order was completed and dine in, free up table
    if (status === 'completed' && target.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.number === target.tableNumber ? { ...t, status: 'available', currentOrderId: undefined } : t
        )
      );
    }

    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Staff',
      userEmail: user?.email || 'staff@auracafe.com',
      role: user?.role || 'staff',
      action: 'ORDER_STATUS_CHANGED',
      actionKh: 'បានផ្លាស់ប្តូរស្ថានភាពការបញ្ជាទិញ',
      details: `Order #${target.orderNumber} updated to status: ${status.toUpperCase()}`,
      ipAddress: '103.216.51.88',
      device: 'Admin Console',
      status: 'info',
    });

    makeLaravelResponse(
      { orderId, status },
      `/api/v1/orders/${orderId}/status`,
      'PATCH',
      'Order fulfillment stage updated',
      200
    );

    showToast(
      language === 'kh'
        ? `បានកែប្រែស្ថានភាព #${target.orderNumber} ទៅជា ${status}`
        : `Updated #${target.orderNumber} status to ${status}`,
      'info'
    );

    return true;
  };

  const reserveTable = async (data: {
    date: string;
    timeSlot: string;
    guestCount: number;
    section: any;
    specialRequest?: string;
    customerPhone: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return {
        success: false,
        message:
          language === 'kh'
            ? 'សូមចូលគណនីជាមុនសិន ដើម្បីធ្វើការកក់តុ'
            : 'Please log in to book a table.',
      };
    }

    const newRes: TableReservation = {
      id: 'res-' + Date.now(),
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: data.customerPhone,
      date: data.date,
      timeSlot: data.timeSlot,
      guestCount: data.guestCount,
      section: data.section,
      specialRequest: data.specialRequest,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setReservations((prev) => [newRes, ...prev]);

    addActivityLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      action: 'TABLE_RESERVED',
      actionKh: 'បានកក់តុថ្មី',
      details: `Table booked for ${data.guestCount} guests on ${data.date} at ${data.timeSlot} (${data.section}).`,
      ipAddress: '103.216.51.88',
      device: 'Client Device',
      status: 'success',
    });

    makeLaravelResponse(
      { reservation: newRes },
      '/api/v1/reservations',
      'POST',
      'Table reservation confirmed',
      201
    );

    showToast(
      language === 'kh' ? 'ការកក់តុទទួលបានជោគជ័យ!' : 'Table reservation confirmed!',
      'success'
    );

    return {
      success: true,
      message:
        language === 'kh'
          ? 'ការកក់តុរបស់អ្នកទទួលបានជោគជ័យ!'
          : 'Your table has been reserved. See you soon!',
    };
  };

  const updateTableStatus = (tableId: string, status: any) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
  };

  const updateProductStock = (productId: string, inStock: boolean, stockCount?: number) => {
    const target = products.find((p) => p.id === productId);
    const dateFormatted = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (target && stockCount !== undefined && stockCount !== target.stockCount) {
      const diff = stockCount - target.stockCount;
      const movement: StockMovement = {
        id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        productId: target.id,
        productName: target.nameKh ? `${target.name} (${target.nameKh})` : target.name,
        type: diff > 0 ? 'IN' : 'ADJUSTMENT',
        quantity: Math.abs(diff),
        previousStock: target.stockCount,
        newStock: stockCount,
        reason: diff > 0 ? 'ការបន្ថែមស្តុកដោយ Admin' : 'ការកែតម្រូវចំនួនស្តុក (Manual Adjustment)',
        referenceId: 'ADJ-' + Date.now().toString().slice(-6),
        performedBy: user?.name || 'Administrator',
        createdAt: dateFormatted,
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newCount = stockCount !== undefined ? stockCount : p.stockCount;
          return {
            ...p,
            inStock,
            stockCount: newCount,
          };
        }
        return p;
      })
    );

    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Staff',
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'INVENTORY_STOCK_UPDATED',
      actionKh: 'បានកែសម្រួលស្តុកទំនិញ',
      details: `Product ${productId} stock updated. inStock: ${inStock}, count: ${stockCount}`,
      ipAddress: '103.216.51.88',
      device: 'Admin Console',
      status: 'info',
    });
  };

  const restockProduct = async (
    productId: string,
    quantityToAdd: number,
    reason: string,
    performedBy?: string
  ): Promise<boolean> => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || quantityToAdd <= 0) return false;

    const previousStock = prod.stockCount;
    const newStock = previousStock + quantityToAdd;
    const actorName = performedBy || user?.name || 'Administrator';
    const dateFormatted = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const movement: StockMovement = {
      id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      productId: prod.id,
      productName: prod.nameKh ? `${prod.name} (${prod.nameKh})` : prod.name,
      type: 'IN',
      quantity: quantityToAdd,
      previousStock,
      newStock,
      reason: reason || 'ការនាំចូលស្តុកទំនិញថ្មី (Stock In)',
      referenceId: 'IN-' + Date.now().toString().slice(-6),
      performedBy: actorName,
      createdAt: dateFormatted,
    };

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stockCount: newStock, inStock: true } : p
      )
    );

    setStockMovements((prev) => [movement, ...prev]);

    addActivityLog({
      userId: user?.id || 'admin',
      userName: actorName,
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'STOCK_RESTOCKED',
      actionKh: 'បាននាំចូលស្តុកទំនិញថ្មី (Stock In)',
      details: `Restocked ${quantityToAdd} units for "${prod.name}" (Stock: ${previousStock} -> ${newStock}). Reason: ${reason}`,
      ipAddress: '103.216.51.88',
      device: 'Admin Console',
      status: 'success',
    });

    showToast(
      language === 'kh'
        ? `បាននាំចូលស្តុក +${quantityToAdd} សម្រាប់ "${prod.nameKh || prod.name}" ដោយជោគជ័យ!`
        : `Successfully restocked +${quantityToAdd} for "${prod.name}"!`,
      'success'
    );

    return true;
  };

  const addNewProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: 'prod-' + Date.now(),
    };
    setProducts((prev) => [newProd, ...prev]);

    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Admin',
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'PRODUCT_CREATED',
      actionKh: 'បានបន្ថែមមុខទំនិញថ្មី',
      details: `Added new artisanal offering: ${newProd.name} ($${newProd.basePrice})`,
      ipAddress: '103.216.51.88',
      device: 'Admin Console',
      status: 'success',
    });
  };

  const updateProduct = (productId: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...data } : p))
    );
    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'PRODUCT_UPDATED',
      actionKh: 'បានកែសម្រួលមុខទំនិញ',
      details: `Product updated: ${productId}`,
      ipAddress: '103.216.51.88',
      device: 'Admin Console',
      status: 'info',
    });
    showToast(language === 'kh' ? 'បានកែប្រែទំនិញជោគជ័យ!' : 'Product updated successfully!', 'success');
  };

  const deleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'PRODUCT_DELETED',
      actionKh: 'បានលុបទំនិញចេញពីម៉ឺនុយ',
      details: `Deleted product: ${target?.name || productId}`,
      ipAddress: '103.216.51.88',
      device: 'Admin Console',
      status: 'warning',
    });
    showToast(language === 'kh' ? 'បានលុបទំនិញចេញពីប្រព័ន្ធ!' : 'Product removed!', 'info');
  };

  const updateReservationStatus = (reservationId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
    );
    showToast(language === 'kh' ? `បានកែប្រែស្ថានភាពកក់តុជា ${status}` : `Reservation status: ${status}`, 'info');
  };

  const deleteReservation = (reservationId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    showToast(language === 'kh' ? 'បានលុបការកក់តុ' : 'Reservation deleted', 'info');
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const submitReview = (data: { rating: number; comment: string; productName: string }) => {
    const newRev: CustomerReview = {
      id: 'rev-' + Date.now(),
      userName: user?.name || 'Guest Connoisseur',
      rating: data.rating,
      comment: data.comment,
      productName: data.productName,
      date: new Date().toISOString().substring(0, 10),
      isApproved: true,
    };
    setReviews((prev) => [newRev, ...prev]);
    showToast(language === 'kh' ? 'សូមអរគុណសម្រាប់ការវាយតម្លៃ!' : 'Thank you for your review!');
  };

  const approveReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isApproved: true } : r))
    );
  };

  const addNewCoupon = (data: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newC: Coupon = {
      ...data,
      id: 'c-' + Date.now(),
      usedCount: 0,
    };
    setCoupons((prev) => [newC, ...prev]);
    showToast(language === 'kh' ? 'បានបន្ថែមប្រូម៉ូសិនថ្មី!' : 'Added promotion coupon!');
  };

  const toggleCouponActive = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        tables,
        reservations,
        coupons,
        reviews,
        locations: STORE_LOCATIONS,
        favorites,
        appliedCoupon,
        toasts,
        currentTrackingOrder,
        storeSettings,
        language,
        setLanguage,
        updateStoreSettings,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
        createOrder,
        updateOrderStatus,
        reserveTable,
        updateTableStatus,
        updateProductStock,
        restockProduct,
        stockMovements,
        addNewProduct,
        updateProduct,
        deleteProduct,
        updateReservationStatus,
        deleteReservation,
        toggleFavorite,
        submitReview,
        approveReview,
        setCurrentTrackingOrder,
        showToast,
        dismissToast,
        addNewCoupon,
        toggleCouponActive,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
