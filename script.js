// ================================
// WhatsApp Configuration
// ================================
const WHATSAPP_NUMBER = '917823802792'; // Format: Country code + number without + or spaces
const WHATSAPP_MESSAGE_TEMPLATE = 'Hi FarmaPro! I have a question about your farming portal. Can you help me?';

// ================================
// Navigation Active Link Management
// ================================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

// Set active link on page load
window.addEventListener('load', () => {
    updateActiveLink();
});

// Update active link on scroll
window.addEventListener('scroll', () => {
    updateActiveLink();
});

function updateActiveLink() {
    let current = '';
    
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop - 200) {
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
document.querySelectorAll('.btn-secondary').forEach((btn) => {
    if (btn.textContent === 'Learn More') {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('📚 More information coming soon!', 'info');
        });
    }
});

// Login Button
document.querySelector('.btn-login').addEventListener('click', () => {
    showNotification('👤 Login feature coming soon!', 'info');
});

// Sign Up Button
document.querySelector('.btn-signup').addEventListener('click', () => {
    showNotification('✨ Sign up feature coming soon!', 'info');
});

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
        
        const name = contactForm.querySelector('#userName').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        if (name && email && message) {
            // Store user name for dashboard
            localStorage.setItem('farmaUserName', name);
            showNotification(`✅ Thank you ${name}! Your message has been sent.`, 'success');
            
            // Send to WhatsApp
            const whatsappMessage = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
            sendToWhatsApp(whatsappMessage);
            
            contactForm.reset();
            updateUserDashboard();
        } else {
            showNotification('⚠️ Please fill in all fields!', 'warning');
        }
    });
}

// ================================
// Grocery Cart Management
// ================================
let cart = JSON.parse(localStorage.getItem('farmaCart')) || [];
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
    
    const userName = localStorage.getItem('farmaUserName') || 'Valued Customer';
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + DELIVERY_CHARGE;
    
    let cartMessage = `Hi FarmaPro! 👋\n\nI'm ${userName}.\n\n📦 Order Details:\n\n`;
    cart.forEach(item => {
        cartMessage += `• ${item.name} x${item.quantity} = ₹${item.price * item.quantity}\n`;
    });
    cartMessage += `\n💰 Subtotal: ₹${subtotal}\n🚚 Delivery: ₹${DELIVERY_CHARGE}\n📊 Total: ₹${total}\n\nPlease confirm my order. Thank you!`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(cartMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    showNotification('💬 Opening WhatsApp with your order...', 'success');
}

// Close cart modal when clicking outside
window.addEventListener('click', (event) => {
    const cartModal = document.getElementById('cartModal');
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
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
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE_TEMPLATE)}`;
    window.open(whatsappUrl, '_blank');
    showNotification('📱 Opening WhatsApp...', 'success');
}

function sendViaWhatsApp() {
    const userName = localStorage.getItem('farmaUserName') || 'Dear Farmer';
    const whatsappMessage = `Hello! 👋\n\nI'm ${userName}, interested in learning more about FarmaPro portal. Can you help me?`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    showNotification('💬 Connecting to WhatsApp...', 'success');
}

function sendToWhatsApp(message) {
    const fullMessage = `📬 New Contact Message:\n\n${message}\n\n---\nSent from FarmaPro Portal`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;
    // This opens WhatsApp for user confirmation
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 500);
}

function updateUserDashboard() {
    const userName = localStorage.getItem('farmaUserName');
    const userWelcome = document.getElementById('userWelcome');
    
    if (userName && userWelcome) {
        userWelcome.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                <span style="font-size: 2rem;">👨‍🌾</span>
                <div>
                    <p style="margin: 0; font-size: 1rem; opacity: 0.9;">Welcome back!</p>
                    <p style="margin: 0; font-size: 1.5rem;">${userName}</p>
                </div>
            </div>
        `;
        userWelcome.style.display = 'block';
    } else if (userWelcome) {
        userWelcome.innerHTML = `
            <p style="margin: 0;">👨‍🌾 Enter your name in the contact form to see personalized dashboard</p>
        `;
        userWelcome.style.fontSize = '1rem';
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
