const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require('google-auth-library');

const app = express();

const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');

// Configure CORS
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());
app.use(express.static('.'));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Nkunal4125@",
    database: "sign_up",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to database.");
});

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
    const userEmail = req.query.email;
    if (!userEmail) {
        return res.status(401).json({ error: 'User email is required' });
    }
    // In a real application, you would verify the user's session/token here
    next();
};

// Signup Route
app.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (results.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], (err) => {
            if (err) return res.status(500).json({ message: "Error registering user" });

            res.status(201).json({ message: "User registered successfully" });
        });
    });
});

// Login Route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({ message: "Login successful" });
    });
});

// Checkout Route with order_id grouping
app.post("/checkout", (req, res) => {
    const { email, total, cartItems } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    const insertOrderGroup = (callback) => {
        const sql = `INSERT INTO order_groups (user_email, total_price) VALUES (?, ?)`;
        db.query(sql, [email, total], (err, result) => {
            if (err) return callback(err);
            const orderId = result.insertId;
            callback(null, orderId);
        });
    };

    const insertItem = (item, orderId, callback) => {
        const itemTotal = item.price * item.quantity;

        const sql = `
            INSERT INTO orders 
            (order_id, user_email, product_name, quantity, size, sugar_tsp, milk_type, toppings, item_total_price) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql, [
            orderId,
            email || null,
            item.title || null,
            item.quantity || 1,
            item.size || "Default Size",
            item.sugar || "Default Sugar",
            item.milk || "Default Milk",
            item.toppings || "None",
            itemTotal || 0
        ], callback);
    };

    insertOrderGroup((err, orderId) => {
        if (err) {
            console.error("Error creating order group:", err);
            return res.status(500).json({ success: false, message: "Failed to create order" });
        }

        let errors = [];
        let completed = 0;

        cartItems.forEach((item) => {
            insertItem(item, orderId, (err) => {
                completed++;
                if (err) errors.push(err);

                if (completed === cartItems.length) {
                    if (errors.length > 0) {
                        console.error("Errors inserting items:", errors);
                        return res.status(500).json({ success: false, message: "Error storing items." });
                    } else {
                        return res.status(200).json({ success: true, message: "Order placed successfully!", orderId });
                    }
                }
            });
        });
    });
});

// API endpoint to get cart data
app.get('/api/cart', authenticateUser, (req, res) => {
    const userEmail = req.query.email;
    
    const sql = `
        SELECT 
            o.id,
            o.order_id,
            o.product_name as title,
            o.quantity,
            o.size,
            o.sugar_tsp as sugar,
            o.milk_type as milk,
            o.toppings,
            o.item_total_price as price
        FROM 
            orders o
        JOIN 
            order_groups og ON o.order_id = og.order_id
        WHERE 
            o.user_email = ?
        ORDER BY 
            og.order_time DESC
        LIMIT 1
    `;

    db.query(sql, [userEmail], (err, results) => {
        if (err) {
            console.error('Error fetching cart data:', err);
            return res.status(500).json({ error: 'Failed to fetch cart data' });
        }
        res.json(results);
    });
});

// API endpoint to get order history
app.get('/api/orders', authenticateUser, (req, res) => {
    const userEmail = req.query.email;
    
    const sql = `
        SELECT 
            og.order_id,
            og.order_time,
            og.total_price,
            GROUP_CONCAT(
                CONCAT(
                    o.product_name, ' (', o.quantity, 'x)',
                    IF(o.size != 'Default Size', CONCAT(' - Size: ', o.size), ''),
                    IF(o.sugar_tsp != 'Default Sugar', CONCAT(' - Sugar: ', o.sugar_tsp), ''),
                    IF(o.milk_type != 'Default Milk', CONCAT(' - Milk: ', o.milk_type), ''),
                    IF(o.toppings != 'None', CONCAT(' - Toppings: ', o.toppings), '')
                )
                SEPARATOR ' | '
            ) as items
        FROM 
            order_groups og
        JOIN 
            orders o ON og.order_id = o.order_id
        WHERE 
            og.user_email = ?
        GROUP BY 
            og.order_id
        ORDER BY 
            og.order_time DESC
    `;

    db.query(sql, [userEmail], (err, results) => {
        if (err) {
            console.error('Error fetching order history:', err);
            return res.status(500).json({ error: 'Failed to fetch order history' });
        }
        res.json(results);
    });
});

// API endpoint to add item to cart
app.post('/api/cart', (req, res) => {
    const { userEmail, item } = req.body;
    if (!userEmail || !item) {
        return res.status(400).json({ error: 'User email and item are required' });
    }
    
    // In a real application, you would save to your database here
    cartData.push(item);
    res.json({ message: 'Item added to cart', cart: cartData });
});

// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

app.get('/api/previous-orders', (req, res) => {
    const { email } = req.query;
    console.log("📩 Fetching orders for email:", email);

    const sql = `
        SELECT 
            og.order_id, 
            og.order_time,
            og.total_price,
            o.product_name,
            o.quantity, 
            o.size, 
            o.sugar_tsp, 
            o.milk_type, 
            o.toppings, 
            o.item_total_price
        FROM 
            order_groups og
        JOIN 
            orders o ON og.order_id = o.order_id
        WHERE 
            og.user_email = ?
        ORDER BY 
            og.order_id DESC
    `;

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("❌ Error fetching previous orders:", err);
            res.status(500).json({ error: "Failed to fetch previous orders" });
        } else {
            console.log("✅ Orders fetched:", results);
            res.json(results);
        }
    });
});