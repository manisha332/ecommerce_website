const BACKEND_URL = "http://localhost:5000";

// Run the fetch function as soon as the DOM content is completely loaded
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

// 1. GET Request: Fetch products from the backend and display them
async function fetchProducts() {
    try {
        const response = await fetch(`${BACKEND_URL}/products`);

        if (!response.ok) {
            throw new Error(`Network Error: ${response.status}`);
        }

        const data = await response.json();
        const products = data.products;

        const productGrid = document.getElementById("product-grid");

        if (!productGrid) {
            console.error("Product grid element not found.");
            return;
        }

        productGrid.innerHTML = "";

        // Image placeholder map based on product IDs
        const images = {
            1: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
            2: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
            default:
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
        };

        products.forEach((product) => {
            const productCard = document.createElement("div");
            productCard.className = "product-card";

            const imgSrc = images[product.id] || images.default;

            productCard.innerHTML = `
                <img src="${imgSrc}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price}</p>
                <button class="btn-primary" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            `;

            productGrid.appendChild(productCard);
        });

    } catch (error) {
        console.error("Error fetching products:", error);

        const productGrid = document.getElementById("product-grid");
        if (productGrid) {
            productGrid.innerHTML =
                '<p style="color:red;">Failed to load products from the server.</p>';
        }
    }
}

// 2. POST Request: Send selected product data to the cart API
async function addToCart(productId) {
    try {
        const email = localStorage.getItem("email");

        // Check if user is logged in
        if (!email) {
            alert("Please login first.");
            return;
        }

        const response = await fetch(`${BACKEND_URL}/addToCart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId: productId,
                email: email
            })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);

    } catch (error) {
        console.error("Error adding item to cart:", error);
        alert("Could not add product to cart. Please try again.");
    }
}