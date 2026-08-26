use rusqlite::{params, Connection, Result};
use crate::models::*;
use chrono::Local;
use rand::Rng;

pub struct Database {
    pub conn_path: String,
}

impl Database {
    pub fn new(path: &str) -> Result<Self> {
        let db = Database {
            conn_path: path.to_string(),
        };
        db.init_schema()?;
        db.seed_data()?;
        Ok(db)
    }

    fn get_conn(&self) -> Result<Connection> {
        Connection::open(&self.conn_path)
    }

    fn init_schema(&self) -> Result<()> {
        let conn = self.get_conn()?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                price INTEGER NOT NULL,
                discount_price INTEGER,
                short_desc TEXT NOT NULL,
                full_desc TEXT NOT NULL,
                weight TEXT NOT NULL,
                stock INTEGER NOT NULL,
                rating REAL NOT NULL,
                reviews_count INTEGER NOT NULL,
                badges_json TEXT NOT NULL,
                icon_type TEXT NOT NULL,
                in_stock INTEGER NOT NULL,
                harvest_region TEXT NOT NULL,
                altitude TEXT NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tracking_code TEXT UNIQUE NOT NULL,
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                province TEXT NOT NULL,
                city TEXT NOT NULL,
                address TEXT NOT NULL,
                postal_code TEXT,
                note TEXT,
                items_json TEXT NOT NULL,
                total_amount INTEGER NOT NULL,
                status TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                created_at TEXT NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS tour_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                booking_code TEXT UNIQUE NOT NULL,
                tour_name TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                requested_date TEXT NOT NULL,
                guests_count INTEGER NOT NULL,
                experience_level TEXT NOT NULL,
                note TEXT,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                author_name TEXT NOT NULL,
                rating INTEGER NOT NULL,
                comment TEXT NOT NULL,
                verified_purchase INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )",
            [],
        )?;

        Ok(())
    }

    fn seed_data(&self) -> Result<()> {
        let conn = self.get_conn()?;
        let count: i64 = conn.query_row("SELECT COUNT(*) FROM products", [], |row| row.get(0))?;

        if count == 0 {
            let initial_products = vec![
                (
                    "عسل وحشی صخره‌های ساورز (خام و تصفیه‌نشده)",
                    "honey",
                    1480000,
                    Some(1350000),
                    "برداشت مستقیم از شکاف صخره‌های مرتفع ۳۰۰۰ متری با ساکارز زیر ۱.۱٪",
                    "عسل کاملاً طبیعی و بکر حاصل از شهد گل‌های وحشی زاگرس جنوبی، گون کوهی و آویشن صخره‌ای. این عسل حرارت ندیده و تمام آنزیم‌ها و بره‌موم طبیعی در آن حفظ شده است.",
                    "۱ کیلوگرم",
                    18,
                    4.95,
                    34,
                    r#"["ارگانیک ۱۰۰٪", "ساکارز ۱.۱٪", "برداشت وحشی"]"#,
                    "honey",
                    1,
                    "دیواره‌های شمالی کوه ساورز",
                    "۲۹۵۰ متر",
                ),
                (
                    "عسل گون و آویشن کوهستان طسوج",
                    "honey",
                    980000,
                    None,
                    "عسل تک‌گل معطر کوهپایه‌ای با خواص درمانی ویژه برای تقویت سیستم ایمنی",
                    "کندوهای مستقر در دره خنک و بکر طسوج در دامنه کوه ساورز. عطر سرمست‌کننده آویشن دنایی و گون زرد در بافت نرم این عسل کاملاً مشهود است.",
                    "۱ کیلوگرم",
                    25,
                    4.9,
                    28,
                    r#"["عسل کوهستان", "برگه آزمایشگاهی"]"#,
                    "honey",
                    1,
                    "تنگه طسوج، چرام",
                    "۲۲۰۰ متر",
                ),
                (
                    "گیاه کوهی چویل اصل ساورز (سورت دست‌چین)",
                    "herbs",
                    320000,
                    Some(285000),
                    "نماد عطر زاگرس، خشک‌شده در سایه مناسب معطر کردن کره، روغن و خوراک‌های سنتی",
                    "چویل یکی از معطرترین و مقدس‌ترین گیاهان بومی کهگیلویه است که در ارتفاعات برف‌گیر ساورز می‌روید. برای عطرآگین کردن روغن حیوانی، گوشت، برنج و چای سنتی استفاده می‌شود.",
                    "۲۰۰ گرم",
                    40,
                    4.98,
                    52,
                    r#"["دست‌چین ییلاقی", "خشک‌شده در سایه", "عطر پایدار"]"#,
                    "herbs",
                    1,
                    "ارتفاعات برف‌گیر ساورز",
                    "۳۱۰۰ متر",
                ),
                (
                    "بیلهر (کندل کوهی) خشک اعلای ساورز",
                    "herbs",
                    450000,
                    None,
                    "گیاه نادر و دارویی زاگرس با خواص آنتی‌اکسیدانی قوی و پاکسازی کبد",
                    "برداشت پایدار و کنترل‌شده از رویشگاه‌های صخره‌ای ساورز. مناسب برای تهیه بورانی، ترشی سنتی اعلا و مصارف دارویی طب کهن زاگرس.",
                    "۲۵۰ گرم",
                    15,
                    4.85,
                    19,
                    r#"["کمیاب", "سوپر اعلا", "برداشت کنترل‌شده"]"#,
                    "herbs",
                    1,
                    "صخره‌های شیب‌دار ساورز",
                    "۲۸۰۰ متر",
                ),
                (
                    "دمنوش آرامش‌بخش پونه و آویشن کوهی طسوج",
                    "herbs",
                    195000,
                    Some(170000),
                    "ترکیب ارگانیک پونه چشمه‌سار و آویشن دنایی، ضدعفونی‌کننده و آرام‌بخش تنفس",
                    "برگ‌های خشک‌شده پونه خودروی کنار چشمه‌های خنک طسوج همراه با گل‌های معطر آویشن کوهی ساورز. یک لیوان از این دمنوش عطر پاک کوهستان را به مشام می‌رساند.",
                    "۱۵۰ گرم",
                    50,
                    4.92,
                    41,
                    r#"["۱۰۰٪ ارگانیک", "ضد سرفه و سرماخوردگی"]"#,
                    "herbs",
                    1,
                    "حاشیه رودخانه و چشمه طسوج",
                    "۲۱۰۰ متر",
                ),
                (
                    "لیزک (بن‌سرخ) وحشی زاگرسی",
                    "herbs",
                    260000,
                    None,
                    "سبزی کوهی معطر خودرو ویژه پلوهای سنتی عشایری و آش لری",
                    "بن‌سرخ یا لیزک یکی از محبوب‌ترین گیاهان بهاره کوه ساورز است که به صورت بهداشتی خشک شده و در تمام فصول برای پخت پلو و غذاهای مقوی سنتی استفاده می‌شود.",
                    "۲۰۰ گرم",
                    30,
                    4.88,
                    23,
                    r#"["عطر طبیعی", "سبزی پلو سنتی"]"#,
                    "herbs",
                    1,
                    "دامنه‌های چمن‌زار ساورز",
                    "۲۶۰۰ متر",
                ),
                (
                    "موسیر کوهی وحشی (پلاک‌های درشت خشک)",
                    "herbs",
                    380000,
                    Some(340000),
                    "موسیر درشت، خوش‌طعم و بسیار تند با خواص ضدعفونی‌کننده قوی",
                    "موسیر طبیعی روییده در خاک بکر و غنی دامنه‌های دشت راق و ساورز. برش‌خورده و خشک‌شده با دستگاه‌های هوای پاک، بدون افزودنی.",
                    "۳۰۰ گرم",
                    22,
                    4.9,
                    16,
                    r#"["پلاک درشت", "طعم فوق‌العاده تند و خوش‌عطر"]"#,
                    "herbs",
                    1,
                    "فلات دشت راق",
                    "۲۵۵۰ متر",
                ),
                (
                    "روغن حیوانی اعلای عشایری سرفاریاب (چویل‌بو)",
                    "dairy",
                    1250000,
                    Some(1150000),
                    "روغن زرد اصیل عشایر لر فرآوری‌شده با چویل تازه و گیاهان کوهی ساورز",
                    "تهیه‌شده از شیر خالص گوسفندان و بزهای چرای آزاد در مراتع ییلاقی ساورز. عطر و طعم این روغن تکرارنشدنی است و سرشار از اسیدهای چرب مفید و انرژی‌بخش است.",
                    "۱ کیلوگرم (حلب سنتی)",
                    12,
                    4.97,
                    65,
                    r#"["دست‌پخت اصیل عشایری", "عطر چویل", "خالص ۱۰۰٪"]"#,
                    "food",
                    1,
                    "سیاه چادرهای ییلاق ساورز",
                    "۲۷۰۰ متر",
                ),
                (
                    "کشک خشک قالبی لری ساورز (کم‌نمک و پرچرب)",
                    "dairy",
                    290000,
                    None,
                    "کشک محلی دست‌ساز عشایری بدون نشاسته و افزودنی، سرشار از کلسیم طبیعی",
                    "فرآوری‌شده به شیوه سنتی در مشک پوستی و خشک‌شده زیر آفتاب زلال کوهستان ساورز. طعم لذیذ و ترش‌مزه با بافت ترد و غنی.",
                    "۵۰۰ گرم",
                    35,
                    4.89,
                    31,
                    r#"["منبع خالص کلسیم", "بدون افزودنی"]"#,
                    "food",
                    1,
                    "سرفاریاب و طسوج",
                    "۲۳۰۰ متر",
                ),
                (
                    "مغز گردوی کاغذی درختان کهنسال طسوج",
                    "nuts",
                    680000,
                    Some(620000),
                    "گردوی چرب، سفید و بسیار خوش‌طعم از درختان ۲۰۰ ساله آبخیز طسوج",
                    "گردوهای پربار باغ‌های تاریخی طسوج که با آب زلال چشمه‌های ساورز آبیاری می‌شوند. پوست نازک و مغز سفید و فوق‌العاده روغنی.",
                    "۱ کیلوگرم",
                    20,
                    4.94,
                    38,
                    r#"["سفید و روغنی", "باغات کهنسال طسوج"]"#,
                    "food",
                    1,
                    "باغات طسوج چرام",
                    "۲۱۰۰ متر",
                ),
                (
                    "جاجیم دست‌بافت پشم طبیعی عشایر ساورز",
                    "crafts",
                    2850000,
                    None,
                    "دست‌بافت اصیل با رنگرزی گیاهی سنتی (روناس، پوست گردو و پوست انار)",
                    "بافته شده توسط زنان هنرمند ایل در سیاه چادرهای دشت راق. طراحی اصیل زاگرسی با دوام دهه‌ها، مناسب دکوراسیون گرم، سنتی و کلاسیک.",
                    "ابعاد ۱۲۰ در ۱۸۰ سانتی‌متر",
                    5,
                    5.0,
                    12,
                    r#"["رنگرزی گیاهی", "پشم دست‌ریس", "اثر هنری اصیل"]"#,
                    "crafts",
                    1,
                    "ییلاقات دشت راق و ساورز",
                    "۲۵۰۰ متر",
                ),
                (
                    "کیسه چویل معطر دست‌دوز زاگرس (خوشبوکننده طبیعی)",
                    "crafts",
                    120000,
                    None,
                    "کیسه کتان دست‌دوز پرشده از چویل تازه خشک‌شده برای کمد لباس و اتومبیل",
                    "رایحه‌ای آرام‌بخش و کهن از کوهساران زاگرس که تا ماه‌ها بوی شگفت‌انگیز کوهستان را در فضای خانه، کمد و خودرو جاری می‌سازد.",
                    "۷۰ گرم",
                    60,
                    4.96,
                    44,
                    r#"["رایحه ۱۰۰٪ طبیعی", "دست‌دوز بومی"]"#,
                    "crafts",
                    1,
                    "کارگاه صنایع‌دستی چرام",
                    "۳۰۰۰ متر",
                ),
            ];

            for p in initial_products {
                conn.execute(
                    "INSERT INTO products (
                        title, category, price, discount_price, short_desc, full_desc,
                        weight, stock, rating, reviews_count, badges_json, icon_type,
                        in_stock, harvest_region, altitude
                    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
                    params![
                        p.0, p.1, p.2, p.3, p.4, p.5, p.6, p.7, p.8, p.9, p.10, p.11, p.12, p.13, p.14
                    ],
                )?;
            }
        }

        let rev_count: i64 = conn.query_row("SELECT COUNT(*) FROM reviews", [], |row| row.get(0))?;
        if rev_count == 0 {
            let sample_reviews = vec![
                (Some(1), "مهندس مسعود رادمنش", 5, "عسل وحشی ساورز فوق‌العاده بود. آزمایشگاه بردم ساکارزش ۱.۰۴ بود که در بازار واقعاً بی‌نظیره. عطر گون و آویشن کوهی کاملاً حس میشه.", 1, "۱۴۰۳/۰۲/۱۵"),
                (Some(3), "خانم دکتر شکیبا امیدی", 5, "گیاه چویل رو با روغن کرمانشاهی ترکیب کردم، عطرش کل خونه رو پر کرد. بسته‌بندی تمیز و خشک‌شدن در سایه کاملاً مشهوده.", 1, "۱۴۰۳/۰۳/۰۲"),
                (Some(8), "حاج رضا کرمی", 5, "روغن حیوانی سرفاریاب عطر طسوج قدیم رو میده. دست مریزاد به عشایر با صفای ساورز و سایت عالی شما.", 1, "۱۴۰۳/۰۴/۱۰"),
                (Some(10), "سهراب یوسفی", 5, "گردوی طسوج چربی بسیار بالایی داره و پوستش با دست می‌شکنه. ممنون از ارسال سریع و بسته‌بندی شیک.", 1, "۱۴۰۳/۰۴/۲۴"),
            ];

            for r in sample_reviews {
                conn.execute(
                    "INSERT INTO reviews (product_id, author_name, rating, comment, verified_purchase, created_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    params![r.0, r.1, r.2, r.3, r.4, r.5],
                )?;
            }
        }

        Ok(())
    }

    pub fn get_products(&self, category: Option<String>) -> Result<Vec<Product>> {
        let conn = self.get_conn()?;
        let query = match &category {
            Some(cat) if !cat.is_empty() && cat != "all" => {
                "SELECT id, title, category, price, discount_price, short_desc, full_desc, weight, stock, rating, reviews_count, badges_json, icon_type, in_stock, harvest_region, altitude FROM products WHERE category = ?1 ORDER BY id ASC"
            }
            _ => {
                "SELECT id, title, category, price, discount_price, short_desc, full_desc, weight, stock, rating, reviews_count, badges_json, icon_type, in_stock, harvest_region, altitude FROM products ORDER BY id ASC"
            }
        };

        let mut stmt = conn.prepare(query)?;
        let rows = if let Some(cat) = category {
            if !cat.is_empty() && cat != "all" {
                stmt.query_map(params![cat], |row| Self::row_to_product(row))?
            } else {
                stmt.query_map([], |row| Self::row_to_product(row))?
            }
        } else {
            stmt.query_map([], |row| Self::row_to_product(row))?
        };

        let mut products = Vec::new();
        for r in rows {
            products.push(r?);
        }
        Ok(products)
    }

    pub fn get_product_by_id(&self, id: i64) -> Result<Option<Product>> {
        let conn = self.get_conn()?;
        let mut stmt = conn.prepare(
            "SELECT id, title, category, price, discount_price, short_desc, full_desc, weight, stock, rating, reviews_count, badges_json, icon_type, in_stock, harvest_region, altitude FROM products WHERE id = ?1"
        )?;

        let mut rows = stmt.query_map(params![id], |row| Self::row_to_product(row))?;
        if let Some(res) = rows.next() {
            Ok(Some(res?))
        } else {
            Ok(None)
        }
    }

    fn row_to_product(row: &rusqlite::Row) -> rusqlite::Result<Product> {
        let badges_json: String = row.get(11)?;
        let badges: Vec<String> = serde_json::from_str(&badges_json).unwrap_or_default();
        let in_stock_int: i64 = row.get(13)?;

        Ok(Product {
            id: row.get(0)?,
            title: row.get(1)?,
            category: row.get(2)?,
            price: row.get(3)?,
            discount_price: row.get(4)?,
            short_desc: row.get(5)?,
            full_desc: row.get(6)?,
            weight: row.get(7)?,
            stock: row.get(8)?,
            rating: row.get(9)?,
            reviews_count: row.get(10)?,
            badges,
            icon_type: row.get(12)?,
            in_stock: in_stock_int == 1,
            harvest_region: row.get(14)?,
            altitude: row.get(15)?,
        })
    }

    pub fn create_order(&self, req: CreateOrderRequest) -> Result<String> {
        let conn = self.get_conn()?;
        let mut rng = rand::thread_rng();
        let random_num: u32 = rng.gen_range(100000..999999);
        let tracking_code = format!("SVRZ-{}", random_num);
        let now = Local::now().format("%Y/%m/%d - %H:%M").to_string();

        let mut total_amount: i64 = 0;
        for item in &req.items {
            total_amount += item.total;
        }

        let items_json = serde_json::to_string(&req.items).unwrap_or_else(|_| "[]".to_string());
        let postal = req.postal_code.unwrap_or_default();
        let note = req.note.unwrap_or_default();

        conn.execute(
            "INSERT INTO orders (
                tracking_code, customer_name, phone, province, city, address,
                postal_code, note, items_json, total_amount, status, payment_method, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![
                tracking_code,
                req.customer_name,
                req.phone,
                req.province,
                req.city,
                req.address,
                postal,
                note,
                items_json,
                total_amount,
                "ثبت شده و در حال آماده‌سازی ارسال",
                req.payment_method,
                now,
            ],
        )?;

        Ok(tracking_code)
    }

    pub fn get_order_by_code(&self, code: &str) -> Result<Option<Order>> {
        let conn = self.get_conn()?;
        let mut stmt = conn.prepare(
            "SELECT id, tracking_code, customer_name, phone, province, city, address, postal_code, note, items_json, total_amount, status, payment_method, created_at
             FROM orders WHERE tracking_code = ?1 OR phone = ?1 ORDER BY id DESC LIMIT 1"
        )?;

        let mut rows = stmt.query_map(params![code], |row| {
            Ok(Order {
                id: row.get(0)?,
                tracking_code: row.get(1)?,
                customer_name: row.get(2)?,
                phone: row.get(3)?,
                province: row.get(4)?,
                city: row.get(5)?,
                address: row.get(6)?,
                postal_code: row.get(7)?,
                note: row.get(8)?,
                items_json: row.get(9)?,
                total_amount: row.get(10)?,
                status: row.get(11)?,
                payment_method: row.get(12)?,
                created_at: row.get(13)?,
            })
        })?;

        if let Some(res) = rows.next() {
            Ok(Some(res?))
        } else {
            Ok(None)
        }
    }

    pub fn create_tour_booking(&self, req: TourBookingRequest) -> Result<String> {
        let conn = self.get_conn()?;
        let mut rng = rand::thread_rng();
        let random_num: u32 = rng.gen_range(10000..99999);
        let booking_code = format!("TOUR-{}", random_num);
        let now = Local::now().format("%Y/%m/%d - %H:%M").to_string();
        let note = req.note.unwrap_or_default();

        conn.execute(
            "INSERT INTO tour_bookings (
                booking_code, tour_name, customer_name, phone, requested_date,
                guests_count, experience_level, note, status, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                booking_code,
                req.tour_name,
                req.customer_name,
                req.phone,
                req.requested_date,
                req.guests_count,
                req.experience_level,
                note,
                "در انتظار تایید لیدر محلی",
                now,
            ],
        )?;

        Ok(booking_code)
    }

    pub fn get_reviews(&self) -> Result<Vec<Review>> {
        let conn = self.get_conn()?;
        let mut stmt = conn.prepare(
            "SELECT id, product_id, author_name, rating, comment, verified_purchase, created_at FROM reviews ORDER BY id DESC LIMIT 20"
        )?;

        let rows = stmt.query_map([], |row| {
            let ver_int: i64 = row.get(5)?;
            Ok(Review {
                id: row.get(0)?,
                product_id: row.get(1)?,
                author_name: row.get(2)?,
                rating: row.get(3)?,
                comment: row.get(4)?,
                verified_purchase: ver_int == 1,
                created_at: row.get(6)?,
            })
        })?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r?);
        }
        Ok(list)
    }

    pub fn add_review(&self, req: ReviewRequest) -> Result<()> {
        let conn = self.get_conn()?;
        let now = Local::now().format("%Y/%m/%d").to_string();
        conn.execute(
            "INSERT INTO reviews (product_id, author_name, rating, comment, verified_purchase, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![req.product_id, req.author_name, req.rating, req.comment, 1, now],
        )?;
        Ok(())
    }

    pub fn add_contact(&self, req: ContactRequest) -> Result<()> {
        let conn = self.get_conn()?;
        let now = Local::now().format("%Y/%m/%d - %H:%M").to_string();
        conn.execute(
            "INSERT INTO contact_messages (name, phone, subject, message, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![req.name, req.phone, req.subject, req.message, now],
        )?;
        Ok(())
    }

    pub fn get_admin_stats(&self) -> Result<AdminStats> {
        let conn = self.get_conn()?;
        let total_orders: i64 = conn.query_row("SELECT COUNT(*) FROM orders", [], |row| row.get(0))?;
        let total_revenue: i64 = conn.query_row("SELECT COALESCE(SUM(total_amount), 0) FROM orders", [], |row| row.get(0))?;
        let pending_orders: i64 = conn.query_row("SELECT COUNT(*) FROM orders WHERE status LIKE '%آماده‌سازی%'", [], |row| row.get(0))?;
        let total_tours: i64 = conn.query_row("SELECT COUNT(*) FROM tour_bookings", [], |row| row.get(0))?;
        let total_reviews: i64 = conn.query_row("SELECT COUNT(*) FROM reviews", [], |row| row.get(0))?;

        Ok(AdminStats {
            total_orders,
            total_revenue,
            pending_orders,
            total_tours,
            total_reviews,
        })
    }

    pub fn get_all_orders(&self) -> Result<Vec<Order>> {
        let conn = self.get_conn()?;
        let mut stmt = conn.prepare(
            "SELECT id, tracking_code, customer_name, phone, province, city, address, postal_code, note, items_json, total_amount, status, payment_method, created_at
             FROM orders ORDER BY id DESC LIMIT 50"
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(Order {
                id: row.get(0)?,
                tracking_code: row.get(1)?,
                customer_name: row.get(2)?,
                phone: row.get(3)?,
                province: row.get(4)?,
                city: row.get(5)?,
                address: row.get(6)?,
                postal_code: row.get(7)?,
                note: row.get(8)?,
                items_json: row.get(9)?,
                total_amount: row.get(10)?,
                status: row.get(11)?,
                payment_method: row.get(12)?,
                created_at: row.get(13)?,
            })
        })?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r?);
        }
        Ok(list)
    }

    pub fn get_all_tour_bookings(&self) -> Result<Vec<TourBooking>> {
        let conn = self.get_conn()?;
        let mut stmt = conn.prepare(
            "SELECT id, booking_code, tour_name, customer_name, phone, requested_date, guests_count, experience_level, note, status, created_at
             FROM tour_bookings ORDER BY id DESC LIMIT 50"
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(TourBooking {
                id: row.get(0)?,
                booking_code: row.get(1)?,
                tour_name: row.get(2)?,
                customer_name: row.get(3)?,
                phone: row.get(4)?,
                requested_date: row.get(5)?,
                guests_count: row.get(6)?,
                experience_level: row.get(7)?,
                note: row.get(8)?,
                status: row.get(9)?,
                created_at: row.get(10)?,
            })
        })?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r?);
        }
        Ok(list)
    }
}
