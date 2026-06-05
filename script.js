// ================================
// WhatsApp Configuration
// ================================
const WHATSAPP_NUMBER = '917823802792'; // Format: Country code + number without + or spaces
const WHATSAPP_MESSAGE_TEMPLATE = 'Hi FarmaPro! I have a question about your farming portal. Can you help me?';
const USER_STORAGE_KEY = 'farmaUsers';
const USER_NAME_KEY = 'farmaUserName';
const USER_EMAIL_KEY = 'farmaUserEmail';

function getWhatsAppNumber() {
    return (WHATSAPP_NUMBER || '').replace(/\D/g, '');
}

// ================================
// Navigation Active Link Management
// ================================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

// Set active link on page load
window.addEventListener('load', () => {
    requestAnimationFrame(updateActiveLink);
});

// Update active link on scroll
window.addEventListener('scroll', () => {
    updateActiveLink();
});

function updateActiveLink() {
    let current = sections[0]?.getAttribute('id') || '';
    const scrollPosition = window.scrollY + 120;
    
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}

// ================================
// Smooth Scroll for Navigation Links
// ================================
navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ================================
// Button Event Listeners
// ================================

// Get Started Button
document.querySelectorAll('.btn-primary').forEach((btn) => {
    btn.addEventListener('click', function(e) {
        if (this.textContent === 'Get Started') {
            e.preventDefault();
            showNotification('🚀 Welcome! Let\'s get started with FarmaPro', 'success');
            setTimeout(() => {
                const dashboardSection = document.getElementById('dashboard');
                const offsetTop = dashboardSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }, 1000);
        }
    });
});

// Learn More Button
const learnMoreButton = document.getElementById('learnMoreBtn');
if (learnMoreButton) {
    learnMoreButton.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = document.getElementById('crops');
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
}

// Login / Signup Buttons
const loginButton = document.querySelector('.btn-login');
const signupButton = document.querySelector('.btn-signup');

if (loginButton) {
    loginButton.addEventListener('click', () => openAuthModal('loginModal'));
}

if (signupButton) {
    signupButton.addEventListener('click', () => openAuthModal('signupModal'));
}

function showFormError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFormError(errorId) {
    showFormError(errorId, '');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readStoredUsers() {
    try {
        const storedUsers = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
        return Array.isArray(storedUsers) ? storedUsers : [];
    } catch (error) {
        console.error('Failed to parse stored users:', error);
        return [];
    }
}

function saveStoredUsers(users) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function openAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function setupAuthForms() {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    document.querySelectorAll('[data-close-modal]').forEach((button) => {
        button.addEventListener('click', () => closeAuthModal(button.getAttribute('data-close-modal')));
    });

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearFormError('signupFormError');

            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim().toLowerCase();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (!name || !email || !password || !confirmPassword) {
                showFormError('signupFormError', 'Please fill in all fields.');
                return;
            }

            if (!isValidEmail(email)) {
                showFormError('signupFormError', 'Please enter a valid email address.');
                return;
            }

            if (password.length < 6) {
                showFormError('signupFormError', 'Password must be at least 6 characters.');
                return;
            }

            if (password !== confirmPassword) {
                showFormError('signupFormError', 'Passwords do not match.');
                return;
            }

            const users = readStoredUsers();
            if (users.some((user) => user.email === email)) {
                showFormError('signupFormError', 'This email is already registered. Please login.');
                return;
            }

            users.push({ name, email, password });
            saveStoredUsers(users);
            localStorage.setItem(USER_NAME_KEY, name);
            localStorage.setItem(USER_EMAIL_KEY, email);
            updateUserDashboard();
            signupForm.reset();
            closeAuthModal('signupModal');
            showNotification(`✅ Welcome ${name}! Signup successful.`, 'success');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearFormError('loginFormError');

            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showFormError('loginFormError', 'Please enter email and password.');
                return;
            }

            if (!isValidEmail(email)) {
                showFormError('loginFormError', 'Please enter a valid email address.');
                return;
            }

            const users = readStoredUsers();
            const existingUser = users.find((user) => user.email === email && user.password === password);

            if (!existingUser) {
                showFormError('loginFormError', 'Invalid login credentials.');
                return;
            }

            localStorage.setItem(USER_NAME_KEY, existingUser.name);
            localStorage.setItem(USER_EMAIL_KEY, existingUser.email);
            updateUserDashboard();
            loginForm.reset();
            closeAuthModal('loginModal');
            showNotification(`👋 Welcome back, ${existingUser.name}!`, 'success');
        });
    }
}

// ================================
// Crop Card Interactions
// ================================
const cropButtons = document.querySelectorAll('.crop-card .btn-small');

cropButtons.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cropCard = btn.closest('.crop-card');
        const cropName = cropCard.querySelector('h3').textContent;
        
        showNotification(`🌱 Added "${cropName}" to your favorites!`, 'success');
        btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        btn.textContent = '✓ Added';
    });
});

// ================================
// Contact Form Submission
// ================================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        clearFormError('contactFormError');

        const name = contactForm.querySelector('#userName').value.trim();
        const email = contactForm.querySelector('#userEmail').value.trim();
        const message = contactForm.querySelector('#userMessage').value.trim();

        if (!name || !email || !message) {
            showFormError('contactFormError', 'Please fill in all fields.');
            return;
        }

        if (!isValidEmail(email)) {
            showFormError('contactFormError', 'Please enter a valid email address.');
            return;
        }

        if (message.length < 10) {
            showFormError('contactFormError', 'Message should be at least 10 characters.');
            return;
        }

        try {
            localStorage.setItem(USER_NAME_KEY, name);
            localStorage.setItem(USER_EMAIL_KEY, email.toLowerCase());
            showNotification(`✅ Thank you ${name}! Your message has been sent.`, 'success');

            const whatsappMessage = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
            sendToWhatsApp(whatsappMessage);

            contactForm.reset();
            updateUserDashboard();
        } catch (error) {
            console.error('Contact form submission error:', error);
            showFormError('contactFormError', 'Something went wrong. Please try again.');
        }
    });
}

// ================================
// Grocery Cart Management
// ================================
function loadStoredCart() {
    try {
        const storedCart = JSON.parse(localStorage.getItem('farmaCart') || '[]');
        return Array.isArray(storedCart) ? storedCart : [];
    } catch (error) {
        console.error('Failed to parse cart data:', error);
        return [];
    }
}

let cart = loadStoredCart();
const DELIVERY_CHARGE = 0; // Free delivery demo

function addToCart(itemName, price) {
    const existingItem = cart.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`✅ Added "${itemName}" to cart!`, 'success');
}

function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    saveCart();
    updateCartUI();
    showNotification(`🗑️ Removed "${itemName}" from cart`, 'info');
}

function updateQuantity(itemName, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(itemName);
    } else {
        const item = cart.find(item => item.name === itemName);
        if (item) {
            item.quantity = newQuantity;
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('farmaCart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartItemsList = document.getElementById('cartItems');
    
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + DELIVERY_CHARGE;
    
    document.getElementById('cartTotal').textContent = total;
    document.getElementById('subtotal').textContent = subtotal;
    document.getElementById('delivery').textContent = DELIVERY_CHARGE;
    document.getElementById('total').textContent = total;
    
    // Update items list
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div>
                    <div class="cart-item-name">${item.name}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity('${item.name}', ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-price">₹${item.price * item.quantity}</div>
                <button class="remove-item" onclick="removeFromCart('${item.name}')">Remove</button>
            </div>
        `).join('');
    }
}

function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
    updateCartUI();
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCartUI();
        showNotification('🗑️ Cart cleared', 'info');
    }
}

function checkoutCart() {
    if (cart.length === 0) {
        showNotification('⚠️ Your cart is empty!', 'warning');
        return;
    }
    
    const userName = localStorage.getItem(USER_NAME_KEY) || 'Valued Customer';
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + DELIVERY_CHARGE;
    
    let cartMessage = `Hi FarmaPro! 👋\n\nI'm ${userName}.\n\n📦 Order Details:\n`;
    cart.forEach(item => {
        cartMessage += `\n• ${item.name}\n  Qty: ${item.quantity}\n  Amount: ₹${item.price * item.quantity}`;
    });
    cartMessage += `\n\n💰 Subtotal: ₹${subtotal}\n🚚 Delivery: ₹${DELIVERY_CHARGE}\n📊 Total: ₹${total}\n\nPlease confirm my order. Thank you!`;
    
    const whatsappUrl = `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(cartMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    showNotification('💬 Opening WhatsApp with your order...', 'success');
}

// Close cart modal when clicking outside
window.addEventListener('click', (event) => {
    const cartModal = document.getElementById('cartModal');
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }

    if (event.target.classList.contains('auth-modal')) {
        closeAuthModal(event.target.id);
    }
});
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 50px;
        background: ${getNotificationColor(type)};
        color: white;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationColor(type) {
    const colors = {
        success: '#2ecc71',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db'
    };
    return colors[type] || colors.info;
}

// ================================
// Add CSS Animations to Style Tag
// ================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ================================
// Lazy Loading for Images (Future Use)
// ================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.crop-card, .weather-card, .dashboard-card, .stat-card').forEach((element) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(element);
});

// ================================
// Real-time Price Updates (Demo)
// ================================
function updatePrices() {
    const priceCells = document.querySelectorAll('.price-today');
    
    priceCells.forEach((cell) => {
        const currentPrice = parseInt(cell.textContent.replace('₹', ''));
        const change = Math.floor(Math.random() * 10) - 5;
        const newPrice = currentPrice + change;
        
        // Animate price change
        cell.style.color = change > 0 ? '#27ae60' : change < 0 ? '#e74c3c' : '#2c3e50';
        
        setTimeout(() => {
            cell.textContent = '₹' + newPrice;
            cell.style.color = '#2c3e50';
        }, 500);
    });
}

// Update prices every 5 minutes (for demo)
setInterval(updatePrices, 300000);

// ================================
// Weather Animation
// ================================
const weatherCards = document.querySelectorAll('.weather-card');

weatherCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) rotateZ(2deg)';
    });
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotateZ(0deg)';
    });
});

// ================================
// Dashboard Stats Counter Animation
// ================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Animate stats on page load
window.addEventListener('load', () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat) => {
        const text = stat.textContent;
        const number = parseInt(text.replace(/\D/g, ''));
        if (!isNaN(number)) {
            animateCounter(stat, number, 2000);
        }
    });
});

// ================================
// Scroll to Top Button
// ================================
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.textContent = '↑';
    button.className = 'scroll-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #2ecc71, #27ae60);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        z-index: 999;
        display: none;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

createScrollToTopButton();

// ================================
// Initialize on Page Load
// ================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌾 FarmaPro Portal loaded successfully!');
    showNotification('👋 Welcome to FarmaPro - Your Smart Farm Portal!', 'success');
    setupAuthForms();
    updateActiveLink();
    updateUserDashboard();
    updateCartUI(); // Initialize cart on page load
});

// ================================
// Keyboard Shortcuts
// ================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to scroll to crops section
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const cropsSection = document.getElementById('crops');
        const offsetTop = cropsSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        showNotification('⌨️ Keyboard shortcut: Ctrl+K to jump to Crops', 'info');
    }
});

// ================================
// WhatsApp Integration Functions
// ================================
function openWhatsApp() {
    const whatsappUrl = `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(WHATSAPP_MESSAGE_TEMPLATE)}`;
    window.open(whatsappUrl, '_blank');
    showNotification('📱 Opening WhatsApp...', 'success');
}

function sendViaWhatsApp() {
    const userName = localStorage.getItem(USER_NAME_KEY) || 'Dear Farmer';
    const whatsappMessage = `Hello! 👋\n\nI'm ${userName}, interested in learning more about FarmaPro portal. Can you help me?`;
    const whatsappUrl = `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    showNotification('💬 Connecting to WhatsApp...', 'success');
}

function sendToWhatsApp(message) {
    const fullMessage = `📬 New Contact Message:\n\n${message}\n\n---\nSent from FarmaPro Portal`;
    const whatsappUrl = `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(fullMessage)}`;
    // This opens WhatsApp for user confirmation
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 500);
}

function getUserDashboardMetrics(userName) {
    const seed = userName.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
    const harvest = 1800 + (seed % 3200);
    const revenue = (harvest * 42) + (seed % 5000);
    const fields = 2 + (seed % 7);
    const soil = (7 + ((seed % 30) / 10)).toFixed(1);

    return {
        harvest: `${harvest.toLocaleString('en-IN')} kg`,
        revenue: `₹${revenue.toLocaleString('en-IN')}`,
        fields: String(fields),
        soil: `${soil}/10`
    };
}

function updateUserDashboard() {
    const userName = localStorage.getItem(USER_NAME_KEY);
    const userWelcome = document.getElementById('userWelcome');

    const harvestElement = document.getElementById('dashboardHarvest');
    const revenueElement = document.getElementById('dashboardRevenue');
    const fieldsElement = document.getElementById('dashboardFields');
    const soilElement = document.getElementById('dashboardSoil');

    if (userName && userWelcome && harvestElement && revenueElement && fieldsElement && soilElement) {
        const metrics = getUserDashboardMetrics(userName);
        userWelcome.innerHTML = `
            <div class="welcome-content">
                <span class="welcome-icon">👨‍🌾</span>
                <div>
                    <p class="welcome-subtitle">Welcome back!</p>
                    <p class="welcome-title">${userName}</p>
                </div>
            </div>
        `;
        harvestElement.textContent = metrics.harvest;
        revenueElement.textContent = metrics.revenue;
        fieldsElement.textContent = metrics.fields;
        soilElement.textContent = metrics.soil;
    } else if (userWelcome) {
        userWelcome.innerHTML = `
            <div class="welcome-content">
                <span class="welcome-icon">👨‍🌾</span>
                <div>
                    <p class="welcome-subtitle">Welcome to your dashboard</p>
                    <p class="welcome-title">Enter your name in Contact, Login, or Sign Up to personalize this section.</p>
                </div>
            </div>
        `;

        if (harvestElement) harvestElement.textContent = '2,450 kg';
        if (revenueElement) revenueElement.textContent = '₹1,22,500';
        if (fieldsElement) fieldsElement.textContent = '5';
        if (soilElement) soilElement.textContent = '8.5/10';
    }
}

// ================================
// Page Visibility Change
// ================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('FarmaPro tab is now hidden');
    } else {
        console.log('Welcome back to FarmaPro!');
    }
});
