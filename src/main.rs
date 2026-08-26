use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod db;
mod models;

use db::Database;
use models::*;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Database>,
}

#[derive(Deserialize)]
pub struct ProductQuery {
    pub category: Option<String>,
}

#[derive(Deserialize)]
pub struct AdminLoginRequest {
    pub password: String,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let db_path = "/var/www/saverz.shop/saverz.db";
    let db = Database::new(db_path).expect("Failed to initialize database");
    let state = AppState { db: Arc::new(db) };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let api_routes = Router::new()
        .route("/products", get(get_products))
        .route("/products/:id", get(get_product_by_id))
        .route("/orders", post(create_order))
        .route("/orders/:code", get(get_order_by_code))
        .route("/tours/book", post(book_tour))
        .route("/reviews", get(get_reviews).post(add_review))
        .route("/contact", post(add_contact))
        .route("/admin/login", post(admin_login))
        .route("/admin/stats", get(get_admin_stats))
        .route("/admin/orders", get(get_admin_orders))
        .route("/admin/tours", get(get_admin_tours));

    let static_service = ServeDir::new("/var/www/saverz.shop/static")
        .append_index_html_on_directories(true);

    let app = Router::new()
        .nest("/api", api_routes)
        .fallback_service(static_service)
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr = "0.0.0.0:3000";
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|e| panic!("Failed to bind to {}: {}", addr, e));

    tracing::info!("🏔️ Saverz Shop Server running on http://{}", addr);
    axum::serve(listener, app).await.unwrap();
}

async fn get_products(
    State(state): State<AppState>,
    Query(query): Query<ProductQuery>,
) -> impl IntoResponse {
    match state.db.get_products(query.category) {
        Ok(products) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "products": products }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn get_product_by_id(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> impl IntoResponse {
    match state.db.get_product_by_id(id) {
        Ok(Some(product)) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "product": product }))),
        Ok(None) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "success": false, "error": "Product not found" }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn create_order(
    State(state): State<AppState>,
    Json(req): Json<CreateOrderRequest>,
) -> impl IntoResponse {
    if req.items.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "success": false, "error": "سبد خرید خالی است" })));
    }
    if req.customer_name.trim().is_empty() || req.phone.trim().is_empty() || req.address.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "success": false, "error": "لطفاً تمامی فیلدهای الزامی را پر کنید" })));
    }

    match state.db.create_order(req) {
        Ok(tracking_code) => (StatusCode::OK, Json(serde_json::json!({
            "success": true,
            "message": "سفارش شما با موفقیت ثبت شد",
            "tracking_code": tracking_code
        }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn get_order_by_code(
    State(state): State<AppState>,
    Path(code): Path<String>,
) -> impl IntoResponse {
    match state.db.get_order_by_code(&code) {
        Ok(Some(order)) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "order": order }))),
        Ok(None) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "success": false, "error": "سفارشی با این مشخصات یافت نشد" }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn book_tour(
    State(state): State<AppState>,
    Json(req): Json<TourBookingRequest>,
) -> impl IntoResponse {
    if req.customer_name.trim().is_empty() || req.phone.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "success": false, "error": "نام و شماره همراه الزامی است" })));
    }

    match state.db.create_tour_booking(req) {
        Ok(booking_code) => (StatusCode::OK, Json(serde_json::json!({
            "success": true,
            "message": "درخواست رزرو تور با موفقیت ثبت شد و لیدر محلی به زودی با شما تماس خواهد گرفت.",
            "booking_code": booking_code
        }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn get_reviews(State(state): State<AppState>) -> impl IntoResponse {
    match state.db.get_reviews() {
        Ok(reviews) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "reviews": reviews }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn add_review(
    State(state): State<AppState>,
    Json(req): Json<ReviewRequest>,
) -> impl IntoResponse {
    if req.author_name.trim().is_empty() || req.comment.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "success": false, "error": "نام و متن نظر الزامی است" })));
    }

    match state.db.add_review(req) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "message": "نظر ارزشمند شما با موفقیت ثبت شد" }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn add_contact(
    State(state): State<AppState>,
    Json(req): Json<ContactRequest>,
) -> impl IntoResponse {
    if req.name.trim().is_empty() || req.phone.trim().is_empty() || req.message.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "success": false, "error": "تمامی فیلدها الزامی هستند" })));
    }

    match state.db.add_contact(req) {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "message": "پیام شما دریافت شد و تیم ساورز به زودی پاسخ خواهد داد." }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn admin_login(Json(req): Json<AdminLoginRequest>) -> impl IntoResponse {
    if req.password == "saverz2026" || req.password == "admin123" {
        (StatusCode::OK, Json(serde_json::json!({ "success": true, "token": "saverz_sec_token_998877" })))
    } else {
        (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "success": false, "error": "رمز عبور مدیریت نادرست است" })))
    }
}

async fn get_admin_stats(State(state): State<AppState>) -> impl IntoResponse {
    match state.db.get_admin_stats() {
        Ok(stats) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "stats": stats }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn get_admin_orders(State(state): State<AppState>) -> impl IntoResponse {
    match state.db.get_all_orders() {
        Ok(orders) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "orders": orders }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}

async fn get_admin_tours(State(state): State<AppState>) -> impl IntoResponse {
    match state.db.get_all_tour_bookings() {
        Ok(tours) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "tours": tours }))),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "success": false, "error": e.to_string() }))),
    }
}
