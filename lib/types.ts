export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  size: string;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  images: string[];
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  research_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  video_url: string | null;
  category_id: string;
  category?: Category;
  price: number;
  original_price: number | null;
  badge: string | null;
  size: string;
  purity: string | null;
  images: string[];
  featured: boolean;
  active: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  weight_grams: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  avg_rating: number;
  review_count: number;
  variants?: ProductVariant[];
  tags?: ProductTag[];
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified_purchase: boolean;
  approved: boolean;
  created_at: string;
}

export interface RelatedProduct {
  id: string;
  product_id: string;
  related_product_id: string;
  sort_order: number;
}

export interface CoaDocument {
  id: string;
  product_id: string;
  product?: Product;
  purity_percentage: number;
  batch_number: string;
  pdf_url: string | null;
  test_date: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin" | "fulfillment";
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  province_state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  currency: string;
  shipping_name: string;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_city: string;
  shipping_province: string;
  shipping_postal: string;
  shipping_country: string;
  shipping_phone: string | null;
  tracking_number: string | null;
  shipping_label_url: string | null;
  shippo_shipment_id: string | null;
  shippo_rate_id: string | null;
  tracking_url_provider: string | null;
  carrier: string | null;
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  paypal_order_id: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_size: string | null;
  quantity: number;
  unit_price: number;
  purchase_type: "one-time" | "subscription";
}

export interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  price: number;
  size: string;
  image: string | null;
  quantity: number;
  purchaseType: "one-time" | "subscription";
}

export interface SiteSetting {
  key: string;
  value: unknown;
}
