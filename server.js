const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("./db");
const user = require("./user");
const product = require("./product");
const app = express();

connectDB()
app.use(cors());
app.use(express.json())


// response from server
app.get("/", (req,res)=>{
    res.send("Server Running");
});


// signup
app.post("/signup", async (req,res)=>{
    try {
        const {name, email, password, phone} = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const existingUser = await user.findOne({email});
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new user({
            name,
            email,
            password: hashedPassword,
            phone
        });

        await newUser.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// login
app.post("/login", async (req,res)=>{
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter email and password"
            });
        }

        const userFound = await user.findOne({email});
        if (!userFound) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const matched = await bcrypt.compare(password, userFound.password);
        if (!matched) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


// getting all products
app.get("/products", async (req, res)=>{
    try {
        const products = await product.find();
        res.status(200).json({
            success: true,
            products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// getting a specific product
app.get("/product/:id", async (req, res)=>{
    try {
        const productId = req.params.id;
        
        const productFound = await product.findOne({id: productId});
        if(!productFound) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product: productFound
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


// getting cart
app.get("/cart/:id", async (req, res)=>{
    try {
        const email = req.params.id;

        const userFound = await user.findOne({email})
        if(!userFound) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const cartDetails = [];
        for (const item of userFound.cart) {
            const productFound = await product.findOne({id: item.productId});
            if (productFound) {
                cartDetails.push({
                    product: productFound,
                    number: item.number
                });
            }
        }

        res.status(200).json({
            success: true,
            cart: cartDetails
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})

// adding specific product to cart
app.post("/addToCart", async (req, res)=>{
    try {
        const {productId, email} = req.body;

        const userFound = await user.findOne({email});
        const productFound = await product.findOne({id: productId});

        if(!productFound || !userFound) {
            return res.status(404).json({
                success: false,
                message: "Items not found"
            });
        }

        const productInCart = userFound.cart.find(
            item => item.productId === productId
        );
        if (productInCart) {
            productInCart.number += 1;
            await userFound.save();

            return res.status(200).json({
                success: true,
            message: "Product successfully added to cart"
            });
        }

        userFound.cart.push({productId: productId, number: 1})
        await userFound.save();

        res.status(200).json({
            success: true,
            message: "Product successfully added to cart"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})

// deleting a specific product from cart
app.post("/deleteFromCart", async (req, res)=>{
    try {
        const {productId, email} = req.body;

        const userFound = await user.findOne({email});
        const productFound = await product.findOne({id: productId});
        if (!userFound || !productFound) {
            return res.status(404).json({
                success: false,
                message: "Items not found"
            });
        }

        const productInCart = userFound.cart.find(
            item => item.productId === productId
        );
        if (!productInCart) {
            return res.status(404).json({
                success: false,
                message: "Items not found"
            });
        }
        
        if (productInCart.number > 1) {
            productInCart.number--;
        } else {
            userFound.cart = userFound.cart.filter(
                item => item.productId !== productId
            );
        }
        await userFound.save();
        
        res.status(200).json({
            success: true,
            message: "Product successfully removed from cart"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})

// product bought
app.post("/buyProduct", async (req, res)=>{
    try {
        const {productId, email} = req.body;

        const productFound = await product.findOne({id: productId});
        const userFound = await user.findOne({email});

        if (!productFound || !userFound) {
            return res.status(404).json({
                success: false,
                message: "Items not found"
            });
        }

        userFound.orders.push({productId:productId, purchasedAt: new Date()});
        
        const productInCart = userFound.cart.find(
            item => item.productId === productId
        );
        
        if (productInCart) {
            if (productInCart.number > 1) {
                productInCart.number--;
            } else {
                userFound.cart = userFound.cart.filter(
                    item => item.productId !== productId
                );
            }
        }
        await userFound.save();

        res.status(200).json({
            success: true,
            message: "Product purchased successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// getting order list
app.get("/orders/:id", async (req, res)=>{
    try {
        const email = req.params.id;

        const userFound = await user.findOne({email});
        if(!userFound) {
            return res.status(404).json({
                success: false,
                message: "Items not found"
            });
        }

        const orderDetails = [];
        for (const item of userFound.orders) {
            const productFound = await product.findOne({id: item.productId});
            if (productFound) {
                orderDetails.push({
                    product: productFound,
                    purchasedAt: item.purchasedAt
                });
            }
        }

        res.status(200).json({
            success: true,
            orders: orderDetails
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})


const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`);
});