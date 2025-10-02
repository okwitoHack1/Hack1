// js/main.js
class MainMarketApp {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.cart = [];
        this.wishlist = [];
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
        this.checkAuthState();
        this.setupDarkMode();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                if (category) {
                    this.filterProductsByCategory(category);
                }
            });
        });

        // Search
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showRegisterModal();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Cart and wishlist
        document.getElementById('viewCart').addEventListener('click', () => {
            this.showCart();
        });

        document.getElementById('wishlistBtn').addEventListener('click', () => {
            this.showWishlist();
        });

        // Video chat
        document.getElementById('videoChatBtn').addEventListener('click', () => {
            window.location.href = 'video-chat.html';
        });
    }

    setupDarkMode() {
        const themeToggle = document.getElementById('themeToggle');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
    }

    async loadProducts() {
        try {
            // Show loading state
            const productGrid = document.getElementById('productGrid');
            productGrid.innerHTML = `
                <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <div class="spinner"></div>
                    <p>Loading products...</p>
                </div>
            `;

            // In a real app, this would be a Firebase call
            // For demo, we'll use sample data
            this.products = await this.getSampleProducts();
            this.renderProducts(this.products);
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products');
        }
    }

    getSampleProducts() {
        return [
            {
                id: 1,
                name: "Ankara Print Dress",
                price: 12500,
                category: "fashion",
                seller: "Ngozi's Fashion",
                image: "https://images.unsplash.com/photo-1594938371073-8b96043d18d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                description: "Beautiful handmade Ankara dress with traditional patterns.",
                rating: 4.5,
                reviewCount: 128,
                inStock: true
            },
            {
                id: 2,
                name: "Wooden Carving Art",
                price: 8500,
                category: "art",
                seller: "Traditional Crafts",
                image: "https://images.unsplash.com/photo-1562569633-622763f1f602?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                description: "Handcrafted wooden sculpture from local artisans.",
                rating: 4.8,
                reviewCount: 64,
                inStock: true
            },
            {
                id: 3,
                name: "Smartphone Android",
                price: 65000,
                category: "electronics",
                seller: "Tech Hub NG",
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                description: "Latest Android smartphone with great features.",
                rating: 4.3,
                reviewCount: 89,
                inStock: true
            },
            {
                id: 4,
                name: "Traditional Spice Set",
                price: 3500,
                category: "food",
                seller: "Local Foods Market",
                image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                description: "Authentic Nigerian spices for traditional cooking.",
                rating: 4.7,
                reviewCount: 156,
                inStock: true
            },
            {
                id: 5,
                name: "Handwoven Basket",
                price: 4500,
                category: "home",
                seller: "Artisan Collective",
                image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                description: "Beautiful handwoven basket for home decor.",
                rating: 4.6,
                reviewCount: 42,
                inStock: true
            },
            {
                id: 6,
                name: "African Print Shirt",
                price: 9800,
                category: "fashion",
                seller: "Modern Traditional",
                image: "https://images.unsplash.com/photo-1506634572416-48cdfe530110?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                description: "Stylish African print shirt for men.",
                rating: 4.4,
                reviewCount: 93,
                inStock: true
            }
        ];
    }

    renderProducts(products) {
        const productGrid = document.getElementById('productGrid');
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${!product.inStock ? '<div class="product-badge">Out of Stock</div>' : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">₦${product.price.toLocaleString()}</div>
                    <div class="product-rating">
                        ${this.generateStarRating(product.rating)}
                        <span>(${product.reviewCount})</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-seller">
                        <small>Sold by: ${product.seller}</small>
                    </div>
                    <div class="product-actions">
                        <button class="add-to-cart" onclick="app.addToCart(${product.id})" 
                                ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="video-chat-product" onclick="app.startProductVideoChat(${product.id})">
                            <i class="fas fa-video"></i> Video Chat
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    generateStarRating(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="fas fa-star"></i>');
        }

        if (hasHalfStar) {
            stars.push('<i class="fas fa-star-half-alt"></i>');
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push('<i class="far fa-star"></i>');
        }

        return stars.join('');
    }

    filterProductsByCategory(category) {
        this.currentCategory = category;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        const filteredProducts = category === 'all' 
            ? this.products 
            : this.products.filter(product => product.category === category);

        this.renderProducts(filteredProducts);
    }

    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.renderProducts(this.products);
            return;
        }

        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.seller.toLowerCase().includes(searchTerm)
        );

        this.renderProducts(filteredProducts);
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.updateCartCount();
        this.showToast(`${product.name} added to cart`, 'success');
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = totalItems;
    }

    startProductVideoChat(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // In a real app, this would redirect to video chat with product context
        window.location.href = `video-chat.html?product=${productId}&seller=${encodeURIComponent(product.seller)}`;
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    // Auth methods
    checkAuthState() {
        // In real app, check Firebase auth state
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.currentUser) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    showLoginModal() {
        // Implementation for login modal
        alert('Login modal would appear here');
    }

    showRegisterModal() {
        // Implementation for register modal
        alert('Register modal would appear here');
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        this.showToast('Logged out successfully', 'success');
    }

    showCart() {
        // Implementation for cart modal/page
        alert('Cart would appear here');
    }

    showWishlist() {
        // Implementation for wishlist modal/page
        alert('Wishlist would appear here');
    }
}

// Additional CSS for dynamic elements
const additionalStyles = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--white);
        color: var(--dark);
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1000;
        border-left: 4px solid var(--primary);
    }

    .toast.show {
        transform: translateX(0);
    }

    .toast-success {
        border-left-color: var(--success);
    }

    .toast-error {
        border-left-color: var(--danger);
    }

    .loading-state .spinner {
        border: 3px solid var(--light);
        border-top: 3px solid var(--primary);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .empty-state {
        color: var(--gray);
    }

    .product-rating {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-bottom: 10px;
        color: var(--secondary);
    }

    .product-rating span {
        color: var(--gray);
        font-size: 0.9rem;
    }

    .product-seller {
        margin-bottom: 15px;
        color: var(--gray);
        font-size: 0.9rem;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize app
const app = new MainMarketApp();
