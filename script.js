
document.addEventListener("DOMContentLoaded", () => {
    // --- GENERAL ---
    updateCartIcon();

    // --- PRODUCT DETAIL PAGE ---
    if (document.querySelector('.add-to-cart-btn')) {
        document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            // In a real app, get product details dynamically
            const product = {
                id: 'prod1',
                name: document.querySelector('.product-title').textContent,
                price: parseFloat(document.querySelector('.product-price').textContent.replace('$', '')),
                image: document.getElementById('mainProductImage').src
            };
            const quantity = parseInt(document.getElementById('quantity').value);
            addToCart(product, quantity);
            alert(`${quantity} x ${product.name} added to cart!`);
        });
    }

    // --- CART PAGE ---
    if (document.querySelector('.cart-items')) {
        renderCartPage();
    }

    // --- CHECKOUT PAGE ---
    if (document.querySelector('.order-summary')) {
        renderCheckoutSummary();
    }

});

// --- CART FUNCTIONS ---

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
}

function addToCart(product, quantity) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }
    saveCart(cart);
}

function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
        if (quantity > 0) {
            item.quantity = quantity;
        } else {
            // If quantity is 0 or less, remove the item
            removeFromCart(productId);
            return; // Exit function since item is removed
        }
    }
    saveCart(cart);
    // Re-render pages if on cart or checkout
    if(document.querySelector('.cart-items')) renderCartPage();
    if(document.querySelector('.order-summary')) renderCheckoutSummary();
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
     // Re-render pages if on cart or checkout
    if(document.querySelector('.cart-items')) renderCartPage();
    if(document.querySelector('.order-summary')) renderCheckoutSummary();
}

function calculateCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartIcon() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}


// --- DYNAMIC PAGE RENDERING ---

function renderCartPage() {
    const cart = getCart();
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = ''; // Clear current content

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty. <a href="products.html">Start shopping!</a></div>';
        document.querySelector('.checkout-btn').style.display = 'none';
    } else {
        cart.forEach(item => {
            const cartItemHTML = `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <p>$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <input type="number" value="${item.quantity}" min="1" class="item-quantity">
                        <button class="remove-item-btn"><i class="fas fa-trash"></i></button>
                    </div>
                    <p class="cart-item-subtotal">$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHTML;
        });
        document.querySelector('.checkout-btn').style.display = 'block';
    }

    // Add event listeners for new elements
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.closest('.cart-item').dataset.id;
            removeFromCart(productId);
        });
    });

    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.currentTarget.closest('.cart-item').dataset.id;
            const newQuantity = parseInt(e.currentTarget.value);
            updateCartQuantity(productId, newQuantity);
        });
    });

    updateCartSummary();
}

function updateCartSummary() {
    const total = calculateCartTotal();
    document.getElementById('cart-subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`; // Assuming free shipping
}

function renderCheckoutSummary() {
    const cart = getCart();
    const summaryContainer = document.querySelector('.summary-items');
    summaryContainer.innerHTML = ''; // Clear

    if (cart.length > 0) {
        cart.forEach(item => {
            const summaryItemHTML = `
                <div class="summary-item">
                    <span>${item.quantity} x ${item.name}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
            summaryContainer.innerHTML += summaryItemHTML;
        });
    }

    const total = calculateCartTotal();
    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
}