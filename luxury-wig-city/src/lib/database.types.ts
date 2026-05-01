/**
 * Luxury Wig City — Database Types
 * Hand-written to match the Supabase schema.
 * Regenerate with `supabase gen types typescript --project-id <id>` if you make changes.
 */

export type UserRole = 'customer' | 'vendor' | 'admin'

export type ProductCategory =
  | 'Bone Straight'
  | 'Bouncy Hair'
  | 'Pixie Curl'
  | 'Closure Wigs'
  | 'Frontal Wigs'
  | 'Braided Wigs'
  | 'Colored Wigs'
  | 'Short Wigs'
  | 'Custom Wigs'

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type VendorPlan = 'free' | 'pro'
export type ProductStatus = 'active' | 'draft' | 'suspended'
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'admin_confirmed'
  | 'packed'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type WearFrequency = 'daily' | 'few_times_week' | 'weekly' | 'occasionally'
export type ConditionStatus = 'good' | 'needs_attention' | 'time_to_replace'
export type IPViolationStatus = 'pending' | 'under_review' | 'escalated' | 'resolved' | 'dismissed'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface VendorProfile {
  id: string
  user_id: string
  store_name: string
  store_tagline: string | null
  store_category: ProductCategory | 'Mixed' | null
  business_email: string | null
  business_address: string | null
  phone: string | null
  description: string | null
  banner_image: string | null
  profile_image: string | null
  cac_certificate_url: string | null
  government_id_url: string | null
  instagram: string | null
  other_socials: string | null
  status: VendorStatus
  rejection_reason: string | null
  is_verified: boolean
  rating: number
  review_count: number
  total_sales: number
  total_revenue: number
  plan: VendorPlan
  pro_started_date: string | null
  pro_expires_date: string | null
  created_at: string
  updated_at: string
}

export type ProductTexture = 'Straight' | 'Wavy' | 'Curly' | 'Kinky'
export type ProductBadge   = 'Bestseller' | 'New' | 'Limited' | "Editor's Pick"

export interface Product {
  id: string
  vendor_id: string | null
  name: string
  description: string | null
  price: number
  discount_price: number | null
  category: ProductCategory
  lengths: string[]
  cap_sizes: string[]
  colors: string[]
  images: string[]
  video_url: string | null
  stock: number
  delivery_time: string | null
  rating: number
  review_count: number
  search_count: number
  status: ProductStatus
  is_featured: boolean
  is_platform_product: boolean
  vendor_name: string | null
  // Filterable scalars (migration 0005)
  texture: ProductTexture | null
  length_inches: number | null
  density: number | null
  lace_type: string | null
  primary_color: string | null
  hair_type: string | null
  badge: ProductBadge | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  customer_id: string
  product_id: string
  quantity: number
  length: string | null
  cap_size: string | null
  color: string | null
  price: number
  product_name: string | null
  product_image: string | null
  vendor_id: string | null
  vendor_name: string | null
  created_at: string
  updated_at: string
}

export interface WishlistItem {
  id: string
  customer_id: string
  product_id: string
  product_name: string | null
  product_image: string | null
  product_price: number | null
  created_at: string
}

export interface OrderLineItem {
  product_id: string
  product_name: string
  price: number
  quantity: number
  length?: string
  cap_size?: string
  color?: string
  image_url?: string
}

export interface OrderTrackingUpdate {
  status: OrderStatus
  timestamp: string
  note?: string
}

export interface Order {
  id: string
  customer_id: string
  customer_name: string | null
  customer_email: string | null
  vendor_id: string | null
  vendor_name: string | null
  items: OrderLineItem[]
  total_amount: number
  shipping_address: string | null
  shipping_city: string | null
  shipping_state: string | null
  phone: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  payment_reference: string | null
  flutterwave_tx_id: string | null
  is_platform_order: boolean
  tracking_updates: OrderTrackingUpdate[]
  delivery_confirmed: boolean
  vendor_paid: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  product_id: string
  vendor_id: string | null
  customer_id: string
  customer_name: string | null
  rating: number
  comment: string | null
  images: string[]
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  conversation_id: string
  sender_name: string | null
  content: string
  is_read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  user_email: string | null
  title: string
  message: string
  type: string | null
  link: string | null
  role_target: UserRole | null
  is_read: boolean
  created_at: string
}

export interface Announcement {
  id: string
  text: string
  link_text: string | null
  link_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

export interface FlashSale {
  id: string
  product_id: string
  product_name: string | null
  original_price: number | null
  sale_price: number
  discount_percent: number | null
  end_time: string
  is_active: boolean
  created_at: string
}

export interface IPViolation {
  id: string
  reporter_email: string
  reporter_name: string | null
  ip_owner: string | null
  violation_type: string | null
  infringing_url: string | null
  description: string
  status: IPViolationStatus
  admin_notes: string | null
  admin_response: string | null
  escalation_notes: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
}

export interface CustomWigRequest {
  id: string
  customer_id: string
  customer_name: string | null
  occasion: string | null
  texture: string | null
  length: string | null
  color: string | null
  budget: string | null
  wig_type: string | null
  recommended_vendors: Array<{ vendor_id: string; store_name: string; profile_image?: string }>
  ai_summary: string | null
  created_at: string
}

export interface UserWig {
  id: string
  user_id: string
  wig_id: string | null
  wig_name: string | null
  wig_type: string | null
  wig_image: string | null
  purchase_date: string | null
  wear_frequency: WearFrequency
  last_washed: string | null
  last_conditioned: string | null
  last_installed: string | null
  condition_status: ConditionStatus
  condition_score: number | null
  last_condition_check: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CommunityPost {
  id: string
  user_id: string
  user_name: string | null
  photo_url: string
  caption: string | null
  wig_id: string | null
  wig_name: string | null
  vendor_id: string | null
  wig_category: string | null
  likes_count: number
  comments_count: number
  created_at: string
}

/**
 * Supabase Database type, used to instantiate a typed client.
 */
export interface Database {
  public: {
    Tables: {
      profiles:              { Row: Profile;           Insert: Partial<Profile>           & { id: string };                                                  Update: Partial<Profile>;          Relationships: [] }
      vendor_profiles:       { Row: VendorProfile;     Insert: Partial<VendorProfile>     & { user_id: string; store_name: string };                          Update: Partial<VendorProfile>;    Relationships: [] }
      products:              { Row: Product;           Insert: Partial<Product>           & { name: string; price: number; category: ProductCategory };       Update: Partial<Product>;          Relationships: [] }
      cart_items:            { Row: CartItem;          Insert: Partial<CartItem>          & { customer_id: string; product_id: string; price: number };       Update: Partial<CartItem>;         Relationships: [] }
      wishlist_items:        { Row: WishlistItem;      Insert: Partial<WishlistItem>      & { customer_id: string; product_id: string };                      Update: Partial<WishlistItem>;     Relationships: [] }
      orders:                { Row: Order;             Insert: Partial<Order>             & { customer_id: string; total_amount: number };                    Update: Partial<Order>;            Relationships: [] }
      reviews:               { Row: Review;            Insert: Partial<Review>            & { product_id: string; customer_id: string; rating: number };      Update: Partial<Review>;           Relationships: [] }
      messages:              { Row: Message;           Insert: Partial<Message>           & { sender_id: string; receiver_id: string; content: string; conversation_id: string }; Update: Partial<Message>; Relationships: [] }
      notifications:         { Row: Notification;      Insert: Partial<Notification>      & { user_id: string; title: string; message: string };              Update: Partial<Notification>;     Relationships: [] }
      announcements:         { Row: Announcement;      Insert: Partial<Announcement>      & { text: string };                                                 Update: Partial<Announcement>;     Relationships: [] }
      flash_sales:           { Row: FlashSale;         Insert: Partial<FlashSale>         & { product_id: string; sale_price: number; end_time: string };     Update: Partial<FlashSale>;        Relationships: [] }
      ip_violations:         { Row: IPViolation;       Insert: Partial<IPViolation>       & { reporter_email: string; description: string };                  Update: Partial<IPViolation>;      Relationships: [] }
      custom_wig_requests:   { Row: CustomWigRequest;  Insert: Partial<CustomWigRequest>  & { customer_id: string };                                          Update: Partial<CustomWigRequest>; Relationships: [] }
      user_wigs:             { Row: UserWig;           Insert: Partial<UserWig>           & { user_id: string };                                              Update: Partial<UserWig>;          Relationships: [] }
      community_posts:       { Row: CommunityPost;     Insert: Partial<CommunityPost>     & { user_id: string; photo_url: string };                           Update: Partial<CommunityPost>;    Relationships: [] }
    }
    Views: Record<never, never>
    Functions: {
      is_admin:                  { Args: Record<string, never>; Returns: boolean }
      current_vendor_profile_id: { Args: Record<string, never>; Returns: string | null }
    }
    Enums:          Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
