use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub id: i64,
    pub title: String,
    pub category: String,
    pub price: i64,
    pub discount_price: Option<i64>,
    pub short_desc: String,
    pub full_desc: String,
    pub weight: String,
    pub stock: i64,
    pub rating: f64,
    pub reviews_count: i64,
    pub badges: Vec<String>,
    pub icon_type: String,
    pub in_stock: bool,
    pub harvest_region: String,
    pub altitude: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderItem {
    pub product_id: i64,
    pub title: String,
    pub price: i64,
    pub quantity: i64,
    pub total: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub customer_name: String,
    pub phone: String,
    pub province: String,
    pub city: String,
    pub address: String,
    pub postal_code: Option<String>,
    pub note: Option<String>,
    pub items: Vec<OrderItem>,
    pub payment_method: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: i64,
    pub tracking_code: String,
    pub customer_name: String,
    pub phone: String,
    pub province: String,
    pub city: String,
    pub address: String,
    pub postal_code: String,
    pub note: String,
    pub items_json: String,
    pub total_amount: i64,
    pub status: String,
    pub payment_method: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TourBookingRequest {
    pub tour_name: String,
    pub customer_name: String,
    pub phone: String,
    pub requested_date: String,
    pub guests_count: i64,
    pub experience_level: String,
    pub note: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TourBooking {
    pub id: i64,
    pub booking_code: String,
    pub tour_name: String,
    pub customer_name: String,
    pub phone: String,
    pub requested_date: String,
    pub guests_count: i64,
    pub experience_level: String,
    pub note: String,
    pub status: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewRequest {
    pub product_id: Option<i64>,
    pub author_name: String,
    pub rating: i64,
    pub comment: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Review {
    pub id: i64,
    pub product_id: Option<i64>,
    pub author_name: String,
    pub rating: i64,
    pub comment: String,
    pub verified_purchase: bool,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactRequest {
    pub name: String,
    pub phone: String,
    pub subject: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactMessage {
    pub id: i64,
    pub name: String,
    pub phone: String,
    pub subject: String,
    pub message: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdminStats {
    pub total_orders: i64,
    pub total_revenue: i64,
    pub pending_orders: i64,
    pub total_tours: i64,
    pub total_reviews: i64,
}
