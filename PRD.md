MS STORE – Product Requirements Document
Product: MS STORE, a modern, fully responsive e-commerce website Version: 1.0 Stack: HTML, CSS, JavaScript (vanilla) and Firebase Inspiration: Shopify-style storefront: clean, fast, conversion-focused
Note on tooling: The MCP (Model Context Protocol) connection is already connected and ready for use in this project. No additional MCP setup is required during development.
1. Product Overview
MS STORE is an online shop where customers browse products by category, discover deals, save favourites, add items to a cart, sign in, and pay at checkout. After a successful payment, a celebratory pop-up confirms that the payment is complete. The site should feel premium, load quickly, and work equally well on phones, tablets and desktops.
2. Goals and Success Criteria
Goal
How we measure it
Look modern and trustworthy
Consistent design system, smooth animations, no layout breaks on any screen
Make buying easy
A new visitor can go from home page to paid order in under 2 minutes
Secure accounts
Firebase Authentication with protected account and checkout pages
Reliable data
Products, carts, wishlists and orders stored in Firebase
Fast
Page content visible in under 2 seconds on a normal connection
3. Target Users
• Shopper (guest): browses products, searches, views details, and can add to cart.
• Registered customer: everything a guest can do, plus checkout, order history, wishlist sync and profile.
• Store owner/admin (future phase): manages products and orders.
4. Technology and Backend
• Frontend: HTML5, CSS3 (Flexbox, Grid, CSS variables, keyframe animations), JavaScript (ES6 modules).
• Backend (Firebase project: MS STORE):
    ◦ Firebase Authentication for sign up, login and logout.
    ◦ Cloud Firestore for products, categories, users, carts, wishlists and orders.
    ◦ Firebase Storage for product images.
    ◦ Firebase Analytics for visit and conversion tracking.
• MCP: already connected.
• The Firebase configuration is listed in Appendix A and is kept in one file (firebase-config.js) so it can be reused everywhere.
5. Website Pages and Structure
1. Home
2. Shop (all products) with filters and sorting
3. Category page
4. Product detail page
5. Cart
6. Wishlist
7. Checkout
8. Payment (with success pop-up)
9. Login / Sign Up
10. My Account (profile, orders, addresses)
11. Order details / tracking
12. About, Contact, FAQ, Shipping and Returns, Privacy Policy, Terms
13. 404 page
6. Feature Requirements
6.1 Header and Navigation
• Sticky header with the MS STORE logo, main menu, search bar, wishlist icon, cart icon with live item count, and a Sign In / Login button.
• When logged in, the Sign In button changes to a user menu (My Account, Orders, Logout).
• Categories mega-menu on desktop; slide-in menu with hamburger icon on mobile.
• Announcement bar above the header (e.g. free shipping offer, seasonal sale).
6.2 Home Page
• Hero banner slider with headline, offer text and a Shop Now button.
• Shop by Category grid with image cards.
• Today's Deals section with countdown timer and discount badges.
• Featured Products and New Arrivals carousels.
• Best Sellers grid.
• Promo banners (two or three wide banners linking to categories).
• Why Shop With Us strip: Free Shipping, Easy Returns, Secure Payment, 24/7 Support.
• Customer Reviews slider.
• Newsletter sign-up (email saved to Firestore).
• Footer with links, social icons, contact details and payment icons.
6.3 Categories
Six main categories, each with sub-categories:
Category
Sub-categories
Electronics
Headphones, Smart Watches, Speakers, Power Banks
Fashion
Men, Women, Shoes, Bags
Home and Living
Decor, Kitchen, Lighting, Bedding
Beauty and Care
Skincare, Fragrance, Grooming
Sports and Fitness
Activewear, Yoga, Gym Gear
Accessories
Sunglasses, Wallets, Watches, Phone Cases
6.4 Product Listing (Shop and Category pages)
• Product cards showing image, name, price, old price, discount badge, star rating, and quick actions (Add to Cart, Wishlist, Quick View).
• Filters: category, price range, rating, brand, availability.
• Sorting: Popular, Newest, Price low to high, Price high to low, Top rated.
• Grid/list view toggle and "Load more" pagination.
• Skeleton loading placeholders while products load.
6.5 Product Detail Page
• Image gallery with thumbnails and hover zoom.
• Name, brand, rating, price, discount, stock status.
• Variant selectors (size, colour) where applicable, and quantity selector.
• Add to Cart, Buy Now and Add to Wishlist buttons.
• Tabs: Description, Specifications, Reviews.
• Delivery and return information.
• Related Products carousel.
6.6 Search
• Live search suggestions as the customer types (product names and categories).
• Search results page with the same filters as the shop page.
• Friendly "no results" message with suggested categories.
6.7 Cart
• Slide-out mini cart and a full cart page.
• Change quantity, remove item, and see subtotal, shipping, tax and total.
• Coupon code field (e.g. WELCOME10 for 10% off).
• Cart saved in Firebase for logged-in users and in the browser for guests; merged on login.
• Empty cart state with a button back to the shop.
6.8 Wishlist
• Heart icon on every product card and product page.
• Wishlist page with Move to Cart and Remove actions.
6.9 Authentication (Firebase Authentication)
• Sign Up with name, email and password.
• Login with email and password.
• Continue with Google option.
• Forgot password email reset.
• Logout from the user menu.
• Clear, friendly error messages (wrong password, email already in use, weak password).
• Visible Sign In / Login button in the header on every page.
• Checkout, My Account and Orders require login; guests are redirected to Login and returned to where they were afterward.
• Password rules: minimum 8 characters, with a strength indicator.
6.10 Checkout
Three clear steps with a progress bar:
1. Shipping details: full name, phone, address, city, postal code, country.
2. Delivery method: Standard or Express, each with price and estimated days.
3. Payment (see 6.11).
An order summary panel stays visible on the side (or collapses on mobile).
6.11 Payment Section
• Payment method options: Credit/Debit Card, plus a Cash on Delivery option.
• Card form fields: card number, name on card, expiry (MM/YY), CVV.
• Live card preview that flips and updates as the customer types.
• Input validation: card number length and checksum, valid expiry date, 3-digit CVV, required name.
• The payment is processed inside the site without contacting a real bank. The interface treats it as a normal payment, so no words like "demo" or "dummy" appear anywhere on the website.
• On pressing Pay Now, the button shows a spinner and a short "Processing your payment..." animation (about 2 seconds).
• On success the order is saved to Firestore with status Paid and the cart is cleared.
6.12 Payment Complete Pop-up
Shown immediately after a successful payment:
• A centred modal with a dimmed, blurred background.
• Animated green checkmark that draws itself.
• Confetti burst animation.
• Heading: "Payment Complete!"
• Text: "Thank you for shopping with MS STORE. Your order is confirmed."
• Shows the Order ID, amount paid and estimated delivery date.
• Buttons: Track Order and Continue Shopping.
• Closes with the button, the Escape key or a click outside; the page behind is not scrollable while it is open.
6.13 My Account
• Profile (name, email, phone) with edit option.
• Saved addresses (add, edit, delete).
• Order history with status (Processing, Shipped, Delivered) and an order details view.
• Wishlist shortcut and Logout.
6.14 Additional Store Features
• Customer reviews and ratings on products (logged-in customers only).
• Stock indicators: "In Stock", "Only 3 left", "Out of Stock".
• Recently viewed products.
• Toast notifications ("Added to cart", "Saved to wishlist").
• Contact form saving messages to Firestore.
• Cookie notice and back-to-top button.
• Light/Dark mode toggle (optional).
7. Product Catalog
All products are written specifically for MS STORE. Each product has: name, brand, category, sub-category, price, old price, description, specifications, 3 to 4 images, rating, review count, stock and tags. Launch with at least 36 products, six per category. Examples:
Category
Products (price)
Electronics
Aura Wireless Headphones ($89), PulseFit Smart Watch ($129), BoomBox Mini Speaker ($59), VoltMax 20,000mAh Power Bank ($39), NovaBuds Pro Earbuds ($69), SnapCharge 65W Fast Charger ($34)
Fashion
Urban Edge Denim Jacket ($74), Everyday Cotton Tee ($24), Stride Runner Sneakers ($84), Metro Leather Backpack ($99), Breeze Summer Dress ($54), Classic Chino Pants ($49)
Home and Living
Lumina Table Lamp ($44), CozyNest Throw Blanket ($39), ChefMate Non-Stick Pan Set ($79), Oak and Ivory Wall Clock ($32), Serene Ceramic Vase ($27), DreamCloud Bedding Set ($94)
Beauty and Care
Glow Vitamin C Serum ($29), Velvet Matte Lipstick ($18), Oud Noir Perfume ($64), SilkSmooth Hair Dryer ($57), Pure Aloe Face Wash ($14), GentleMan Beard Care Kit ($31)
Sports and Fitness
FlexGrip Yoga Mat ($28), IronCore Dumbbell Set ($89), AeroDry Training Tee ($26), ProSprint Running Shorts ($29), HydroSip Steel Bottle ($19), PowerBand Resistance Set ($22)
Accessories
Aviator Polarized Sunglasses ($42), Heritage Leather Wallet ($36), Chrono Steel Watch ($119), ShieldGuard Phone Case ($15), Weave Canvas Belt ($21), Pearl Drop Earrings ($33)
About 30% of products carry a deal discount (10% to 40%) and appear in Today's Deals.
8. Animations and Visual Effects
Area
Animation
Page load
Fade-in and slide-up on sections as they scroll into view
Hero
Auto-sliding banner with smooth fade/zoom transitions and animated text
Product cards
Lift and shadow on hover, image zoom, quick-action buttons sliding in
Buttons
Ripple effect on click, subtle colour transitions
Add to cart
Product image flies into the cart icon; cart badge bounces
Wishlist heart
Pop and fill animation
Mini cart
Smooth slide-in drawer
Categories
Hover scale and overlay reveal
Deals
Live countdown with flip effect
Forms
Floating labels and animated focus borders
Payment
Card flip preview, loading spinner
Success pop-up
Drawing checkmark, confetti, scale-in modal
Loading
Skeleton shimmer placeholders
Respect settings
Animations reduced for users who prefer reduced motion
9. Design System
• Style: clean, spacious, modern; rounded corners, soft shadows, high-quality imagery.
• Colours: Primary deep indigo #4F46E5, accent coral #FF6B6B, success green #22C55E, dark text #111827, light background #F9FAFB, white cards.
• Typography: Poppins for headings, Inter for body text.
• Icons: one consistent icon set (e.g. Font Awesome or Lucide).
• Spacing: 8px grid; maximum content width 1280px.
• Accessibility: colour contrast of at least WCAG AA, keyboard-navigable, alt text on all images, visible focus states.
10. Responsive Behaviour
Device
Width
Layout
Mobile
up to 640px
1–2 product columns, hamburger menu, bottom-friendly buttons, stacked checkout
Tablet
641–1024px
2–3 columns, collapsible filters
Desktop
1025px and up
4 columns, sidebar filters, mega-menu, side-by-side checkout
11. Firebase Data Model (Firestore)
Collection
Key fields
users
uid, name, email, phone, addresses[], createdAt
products
id, name, brand, category, subCategory, price, oldPrice, discount, description, specs, images[], rating, reviewCount, stock, tags[], isFeatured, isDeal, createdAt
categories
id, name, slug, image, subCategories[]
carts
uid, items[{productId, qty, variant}], updatedAt
wishlists
uid, productIds[]
orders
orderId, uid, items[], shipping{}, deliveryMethod, subtotal, shippingFee, tax, discount, total, paymentMethod, paymentStatus, orderStatus, createdAt
reviews
productId, uid, userName, rating, comment, createdAt
coupons
code, type, value, minOrder, expiresAt, active
newsletter
email, subscribedAt
messages
name, email, subject, message, createdAt
Security rules (summary):
• Anyone can read products, categories and approved reviews.
• Users can read and write only their own users, carts, wishlists and orders documents.
• Only signed-in customers can create reviews and orders.
• Only the admin role can write to products, categories and coupons.
• Card details are validated in the browser and never stored in Firestore; only the payment method type and status are saved.
12. Key User Flows
Purchase flow: Home, then Category, then Product, then Add to Cart, then Cart, then Checkout (login if needed), then Shipping, then Delivery, then Payment, then Payment Complete pop-up, then Order saved and viewable in My Account.
Login flow: Click Sign In in the header, then Login or Sign Up form, then success toast, then the header shows the user menu.
Wishlist flow: Tap the heart, then item saved (login prompt for guests), then view and move to cart from the Wishlist page.
13. Content Rules
• All text, products, reviews and policies are written as real store content.
• The words "demo", "dummy", "test" and "lorem ipsum" must not appear anywhere in the user interface or page content.
• Brand name is always written as MS STORE.
14. Non-Functional Requirements
• Performance: lazy-loaded images, compressed WebP assets, minified CSS and JS, Lighthouse score above 90.
• Security: HTTPS, Firebase security rules, input sanitisation, protected routes.
• Browser support: latest Chrome, Edge, Firefox, Safari, and mobile browsers.
• SEO: semantic HTML, meta titles and descriptions, Open Graph tags, clean page titles.
• Reliability: graceful error and offline messages when Firebase cannot be reached.
15. Suggested Project Structure
ms-store/
  index.html, shop.html, product.html, cart.html,
  checkout.html, login.html, account.html, orders.html
  css/    (style.css, animations.css, responsive.css)
  js/     (firebase-config.js, auth.js, products.js, cart.js,
           wishlist.js, checkout.js, payment.js, ui.js)
  assets/ (images, icons, fonts)
16. Development Phases
Phase
Deliverables
1. Foundation
Design system, Firebase setup, header, footer, home page layout
2. Catalog
Product data, categories, listing, filters, search, product page
3. Accounts
Sign up, login, Google login, protected pages, My Account
4. Shopping
Cart, wishlist, coupons, mini cart
5. Checkout
Shipping, delivery, payment form, order creation, Payment Complete pop-up
6. Polish
Animations, responsive tuning, accessibility, performance, SEO
7. Launch
Final testing and deployment (Firebase Hosting)
17. Acceptance Criteria
• Site displays correctly on mobile, tablet and desktop.
• A visitor can create an account, log in and log out; the header Sign In button works on every page.
• At least 36 products across 6 categories are visible, filterable and searchable.
• Cart and wishlist update instantly and persist after refresh and login.
• A logged-in customer can complete checkout; the order appears in Firestore and in My Account.
• After a successful payment, the Payment Complete pop-up appears with animation, confetti and the Order ID.
• Invalid card details show clear error messages and block payment.
• No "demo" or "dummy" wording is visible anywhere.
• Animations run smoothly and are reduced when the user prefers reduced motion.
Appendix A – Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhbiLyWASsXgQW-j4m-tRtHo5OvlrZ-qs",
  authDomain: "ms-store-9c263.firebaseapp.com",
  projectId: "ms-store-9c263",
  storageBucket: "ms-store-9c263.firebasestorage.app",
  messagingSenderId: "1064610853166",
  appId: "1:1064610853166:web:cf21e4f6b810c8f7cc4abf",
  measurementId: "G-V7R2T29CSV"
};
Firebase project name: MS STORE. Enable Email/Password and Google sign-in providers, Firestore, Storage and Analytics in the Firebase console, and publish the security rules from Section 11 before launch.