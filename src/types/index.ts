export type UserRole = 'super_admin' | 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  loyaltyPoints: number;
  createdAt: string;
  lastLoginAt?: string;
  status: 'active' | 'suspended';
  ordersCount?: number;
  totalSpent?: number;
}

export interface StoreSettings {
  shopName: string;
  shopNameKh: string;
  tagline: string;
  taglineKh: string;
  logo: string;
  heroBackground: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  addressKh: string;
  announcementText?: string;
  announcementTextKh?: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  openingHours?: string;
  taxRate?: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  action: string;
  actionKh: string;
  details: string;
  ipAddress: string;
  device: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export type DrinkSize = 'small' | 'regular' | 'large';
export type DrinkTemp = 'hot' | 'iced' | 'blended';
export type SweetnessLevel = '0%' | '25%' | '50%' | '75%' | '100%';
export type MilkOption = 'whole' | 'oat' | 'almond' | 'soy' | 'coconut';

export interface ProductCustomization {
  size: DrinkSize;
  temperature: DrinkTemp;
  sweetness: SweetnessLevel;
  milk: MilkOption;
  extraShots: number;
  syrups: string[];
  note?: string;
}

export type ProductCategory = 'espresso' | 'pour_over' | 'signature' | 'cold_brew' | 'bakery' | 'beans' | 'burger';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId?: string;
  performedBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameKh: string;
  category: ProductCategory;
  description: string;
  descriptionKh: string;
  basePrice: number;
  image: string;
  gallery?: string[];
  isPopular?: boolean;
  inStock: boolean;
  stockCount: number;
  origin?: string;
  altitude?: string;
  process?: string;
  roastLevel?: 'Light' | 'Medium' | 'Dark' | string;
  tastingNotes?: string[];
  calories?: number;
  caffeineMg?: number;
  brewingMethod?: string;
  ingredients?: string[];
  allergens?: string[];
  rating?: number;
  reviewsCount?: number;
}

export interface CartItem {
  id: string;
  product: Product;
  customization: ProductCustomization;
  quantity: number;
  itemTotal: number;
}

export type OrderStatus = 'pending' | 'brewing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'aba_khqr' | 'credit_card' | 'cash';
export type PaymentStatus = 'paid' | 'pending';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  labelKh: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineStep[];
}

export type TableSection = 'indoor_ac' | 'garden_terrace' | 'roastery_bar' | 'vip_lounge';
export type TableStatus = 'available' | 'reserved' | 'occupied';

export interface CafeTable {
  id: string;
  number: string;
  capacity: number;
  section: TableSection;
  status: TableStatus;
  currentOrderId?: string;
  reservedForTime?: string;
}

export interface TableReservation {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  timeSlot: string;
  guestCount: number;
  section: TableSection;
  tableNumber?: string;
  specialRequest?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  titleKh: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface StoreLocation {
  id: string;
  name: string;
  nameKh: string;
  address: string;
  addressKh: string;
  city: string;
  phone: string;
  hours: string;
  isFlagship?: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
}

export interface CustomerReview {
  id: string;
  userName: string;
  userRole?: string;
  rating: number;
  comment: string;
  commentKh?: string;
  productName: string;
  date: string;
  isApproved: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  titleKh: string;
  excerpt: string;
  excerptKh: string;
  category: string;
  readTime: string;
  publishedAt: string;
  image: string;
}

export interface WorkshopEvent {
  id: string;
  title: string;
  titleKh: string;
  date: string;
  time: string;
  location: string;
  locationKh: string;
  spotsLeft: number;
  price: number;
  instructor: string;
}
