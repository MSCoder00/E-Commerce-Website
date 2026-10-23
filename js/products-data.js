// ==========================================================================
// MS STORE - Product Catalog & Categories Database
// 36 Curated Products across 6 Core Categories (6 per category)
// Compliant with PRD Section 6.3 & Section 7
// All images stored locally inside /assets/images/products/<id>/
// ==========================================================================

export const CATEGORIES = [
  {
    "id": "electronics",
    "name": "Electronics",
    "slug": "electronics",
    "icon": "headphones",
    "subCategories": [
      "Headphones",
      "Smart Watches",
      "Speakers",
      "Power Banks",
      "Chargers"
    ],
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "itemCount": 6
  },
  {
    "id": "fashion",
    "name": "Fashion",
    "slug": "fashion",
    "icon": "shirt",
    "subCategories": [
      "Men",
      "Women",
      "Shoes",
      "Bags"
    ],
    "image": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80",
    "itemCount": 6
  },
  {
    "id": "home-living",
    "name": "Home and Living",
    "slug": "home-living",
    "icon": "home",
    "subCategories": [
      "Decor",
      "Kitchen",
      "Lighting",
      "Bedding"
    ],
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    "itemCount": 6
  },
  {
    "id": "beauty-care",
    "name": "Beauty and Care",
    "slug": "beauty-care",
    "icon": "sparkles",
    "subCategories": [
      "Skincare",
      "Fragrance",
      "Grooming"
    ],
    "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
    "itemCount": 6
  },
  {
    "id": "sports-fitness",
    "name": "Sports and Fitness",
    "slug": "sports-fitness",
    "icon": "activity",
    "subCategories": [
      "Activewear",
      "Yoga",
      "Gym Gear"
    ],
    "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    "itemCount": 6
  },
  {
    "id": "accessories",
    "name": "Accessories",
    "slug": "accessories",
    "icon": "watch",
    "subCategories": [
      "Sunglasses",
      "Wallets",
      "Watches",
      "Phone Cases"
    ],
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    "itemCount": 6
  }
];

export const PRODUCTS_CATALOG = [
  {
    "id": "prod-elec-01",
    "name": "Aura Wireless Headphones",
    "brand": "AuraSound",
    "category": "Electronics",
    "subCategory": "Headphones",
    "price": 89,
    "oldPrice": 119,
    "discount": 25,
    "isDeal": true,
    "isFeatured": true,
    "rating": 4.9,
    "reviewCount": 142,
    "stock": 24,
    "tags": [
      "Wireless",
      "Active Noise Cancellation",
      "Spatial Audio"
    ],
    "images": [
      "/assets/images/products/prod-elec-01/main.jpg",
      "/assets/images/products/prod-elec-01/1.jpg",
      "/assets/images/products/prod-elec-01/2.jpg"
    ],
    "description": "Immerse yourself in rich, high-fidelity acoustics with Aura Wireless Headphones. Featuring custom-tuned 40mm beryllium drivers, active hybrid noise cancellation, and up to 40 hours of playtime on a single charge. Designed with ergonomic memory foam earcups for prolonged studio or travel comfort.",
    "specs": {
      "Battery Life": "40 Hours Playback",
      "Bluetooth Version": "5.3 with Multipoint",
      "Noise Cancellation": "Hybrid Active Noise Cancellation",
      "Charging": "USB-C Quick Charge (10 min = 5 hours)",
      "Weight": "250g",
      "Warranty": "2 Years Official Warranty"
    }
  },
  {
    "id": "prod-elec-02",
    "name": "PulseFit Smart Watch",
    "brand": "PulseHealth",
    "category": "Electronics",
    "subCategory": "Smart Watches",
    "price": 129,
    "oldPrice": 169,
    "discount": 24,
    "isDeal": true,
    "isFeatured": true,
    "rating": 4.8,
    "reviewCount": 98,
    "stock": 18,
    "tags": [
      "AMOLED",
      "Heart Rate",
      "Waterproof 5ATM"
    ],
    "images": [
      "/assets/images/products/prod-elec-02/main.jpg",
      "/assets/images/products/prod-elec-02/1.jpg",
      "/assets/images/products/prod-elec-02/2.jpg"
    ],
    "description": "Achieve your peak wellness with the PulseFit Smart Watch. Boasting a vivid 1.4-inch AMOLED display, real-time SpO2 monitoring, continuous heart rate tracking, and integrated GPS for 100+ athletic disciplines. 5ATM water resistance ensures effortless swimming and weather-proof endurance.",
    "specs": {
      "Display": "1.4-inch AMOLED (454 x 454)",
      "Battery": "Up to 14 Days Typical Use",
      "Water Resistance": "5ATM (50 meters)",
      "Sensors": "Optical HR, SpO2, Accelerometer, Barometer",
      "Connectivity": "Bluetooth 5.2 / GPS / GLONASS",
      "Warranty": "1 Year Official Warranty"
    }
  },
  {
    "id": "prod-elec-03",
    "name": "BoomBox Mini Speaker",
    "brand": "SoundForge",
    "category": "Electronics",
    "subCategory": "Speakers",
    "price": 59,
    "oldPrice": 69,
    "discount": 15,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.7,
    "reviewCount": 76,
    "stock": 35,
    "tags": [
      "Portable",
      "IPX7 Waterproof",
      "360 Audio"
    ],
    "images": [
      "/assets/images/products/prod-elec-03/main.jpg",
      "/assets/images/products/prod-elec-03/1.jpg",
      "/assets/images/products/prod-elec-03/2.jpg"
    ],
    "description": "Compact form factor, monumental acoustic soundstage. The BoomBox Mini radiates 360-degree room-filling audio powered by dual passive bass radiators and custom digital signal processing. Certified IPX7 waterproof for pool parties, trail hikes, and shower singing.",
    "specs": {
      "Output Power": "20W RMS (Peak 30W)",
      "Playtime": "18 Hours Continuous",
      "Waterproof Rating": "IPX7 Submersible",
      "Pairing": "True Wireless Stereo (TWS) Dual Link",
      "Weight": "480g",
      "Warranty": "1 Year Official Warranty"
    }
  },
  {
    "id": "prod-elec-05",
    "name": "NovaBuds Pro Earbuds",
    "brand": "NovaAcoustics",
    "category": "Electronics",
    "subCategory": "Headphones",
    "price": 99,
    "oldPrice": 129,
    "discount": 23,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 164,
    "stock": 31,
    "tags": [
      "True Wireless",
      "Transparency Mode",
      "Wireless Qi"
    ],
    "images": [
      "/assets/images/products/prod-elec-05/main.jpg",
      "/assets/images/products/prod-elec-05/1.jpg",
      "/assets/images/products/prod-elec-05/2.jpg"
    ],
    "description": "Engineered for pure listening intimacy. NovaBuds Pro deliver studio-master resolution via 11mm titanium composite diaphragms, seamless intelligent transparency switching, and ultra-clear 6-microphone beamforming call isolation. Qi-compatible charging case offers up to 32 total listening hours.",
    "specs": {
      "Drivers": "11mm Titanium Dynamic Drivers",
      "Battery": "8h (Buds) + 24h (Case) = 32h Total",
      "Codecs Supported": "LDAC, AAC, SBC",
      "Water Protection": "IPX5 Splash Resistance",
      "Charging": "USB-C + Qi Wireless Charging",
      "Warranty": "1 Year Official Warranty"
    }
  },
  {
    "id": "prod-elec-07",
    "name": "AeroCharge Magnetic Wireless Power Bank",
    "brand": "AeroCharge",
    "category": "Electronics",
    "subCategory": "Power Banks",
    "price": 45,
    "oldPrice": 59,
    "discount": 24,
    "isDeal": true,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 84,
    "stock": 38,
    "tags": [
      "MagSafe Compatible",
      "15W Fast Wireless",
      "10,000mAh",
      "Foldable Stand"
    ],
    "images": [
      "/assets/images/products/prod-elec-07/main.jpg",
      "/assets/images/products/prod-elec-07/1.jpg",
      "/assets/images/products/prod-elec-07/2.jpg"
    ],
    "description": "Snap-and-charge convenience engineered for everyday travel. Features strong magnetic alignment, 10,000mAh high-density cell, 20W PD bidirectional USB-C output, and an integrated foldable kickstand for comfortable viewing while powering.",
    "specs": {
      "Capacity": "10,000mAh (38.5Wh)",
      "Wireless Output": "15W Max (MagSafe & Qi compatible)",
      "USB-C In/Out": "20W Power Delivery 3.0",
      "Dimensions": "104 x 68 x 16 mm",
      "Weight": "195g",
      "Warranty": "2 Years Official Warranty"
    }
  },
  {
    "id": "prod-elec-08",
    "name": "HyperDrive 100W GaN Desktop Charger",
    "brand": "HyperDrive",
    "category": "Electronics",
    "subCategory": "Chargers",
    "price": 65,
    "oldPrice": 85,
    "discount": 24,
    "isDeal": false,
    "isFeatured": true,
    "rating": 4.9,
    "reviewCount": 112,
    "stock": 29,
    "tags": [
      "100W GaN III",
      "Quad Port",
      "Laptop Fast Charging"
    ],
    "images": [
      "/assets/images/products/prod-elec-08/main.jpg",
      "/assets/images/products/prod-elec-08/1.jpg",
      "/assets/images/products/prod-elec-08/2.jpg"
    ],
    "description": "Streamline your workspace with cutting-edge Gallium Nitride III technology. Delivers up to 100W total output across 3 USB-C and 1 USB-A ports, effortlessly fast-charging laptops, tablets, and phones simultaneously while running cooler and lighter.",
    "specs": {
      "Total Wattage": "100W Max Shared Output",
      "Ports": "3x USB-C PD 3.0, 1x USB-A QC 4.0",
      "Technology": "GaNFast III Semiconductor",
      "Input": "100-240V ~ 50/60Hz Global Voltage",
      "Safety": "Over-voltage, Over-temp, Short-circuit Protection",
      "Warranty": "2 Years Official Warranty"
    }
  },
  {
    "id": "prod-fash-01",
    "name": "Classic Denim Jacket",
    "brand": "UrbanDenim",
    "category": "Fashion",
    "subCategory": "Men",
    "price": 79,
    "oldPrice": 99,
    "discount": 20,
    "isDeal": false,
    "isFeatured": true,
    "rating": 4.8,
    "reviewCount": 118,
    "stock": 22,
    "tags": [
      "100% Cotton",
      "Vintage Wash",
      "Unisex Fit"
    ],
    "images": [
      "/assets/images/products/prod-fash-01/main.jpg",
      "/assets/images/products/prod-fash-01/1.jpg",
      "/assets/images/products/prod-fash-01/2.jpg"
    ],
    "variants": {
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ]
    },
    "description": "An authentic wardrobe essential cut from heavyweight 13.5oz organic cotton twill. Hand-distressed with vintage copper hardware, reinforced point-collar, double chest flap pockets, and adjustable waist tabs for a timeless silhouette.",
    "specs": {
      "Material": "100% Ring-Spun Organic Cotton (13.5 oz)",
      "Fit": "Regular Tailored Fit",
      "Closure": "Antiqued Copper Shank Buttons",
      "Care": "Machine wash cold inside-out, hang dry",
      "Origin": "Ethically crafted in Portugal"
    }
  },
  {
    "id": "prod-fash-02",
    "name": "Luxe Cashmere Blend Sweater",
    "brand": "AtelierNordic",
    "category": "Fashion",
    "subCategory": "Women",
    "price": 110,
    "oldPrice": 145,
    "discount": 24,
    "isDeal": true,
    "isFeatured": true,
    "rating": 4.9,
    "reviewCount": 85,
    "stock": 14,
    "tags": [
      "Mongolian Cashmere",
      "Ribbed Hem",
      "Ultra Soft"
    ],
    "images": [
      "/assets/images/products/prod-fash-02/main.jpg",
      "/assets/images/products/prod-fash-02/1.jpg",
      "/assets/images/products/prod-fash-02/2.jpg"
    ],
    "variants": {
      "sizes": [
        "XS",
        "S",
        "M",
        "L"
      ]
    },
    "description": "Pure thermal indulgence. Spun from sustainably harvested Grade-A Inner Mongolian cashmere combined with superfine merino wool. Feathery light yet supremely insulating, featuring an elegant crew neckline with ribbed micro-cuffs.",
    "specs": {
      "Composition": "70% Grade-A Cashmere, 30% Merino Wool",
      "Gauge": "12-Gauge Fine Knit",
      "Neckline": "Classic Ribbed Crewneck",
      "Care": "Hand wash lukewarm or dry clean",
      "Certification": "Good Cashmere Standard Certified"
    }
  },
  {
    "id": "prod-fash-03",
    "name": "Urban Minimalist Sneakers",
    "brand": "StrideLab",
    "category": "Fashion",
    "subCategory": "Shoes",
    "price": 95,
    "oldPrice": 120,
    "discount": 21,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.7,
    "reviewCount": 94,
    "stock": 28,
    "tags": [
      "Full-Grain Leather",
      "Ortholite Insole",
      "Low-Top"
    ],
    "images": [
      "/assets/images/products/prod-fash-03/main.jpg",
      "/assets/images/products/prod-fash-03/1.jpg",
      "/assets/images/products/prod-fash-03/2.jpg"
    ],
    "variants": {
      "sizes": [
        "US 8",
        "US 9",
        "US 10",
        "US 11",
        "US 12"
      ]
    },
    "description": "Sleek architectural sneakers engineered for effortless urban commuting. Handcrafted in Italian nappa leather over a vulcanized natural gum rubber cupsole, lined with breathable calfskin and cushioned with high-rebound antimicrobial footbeds.",
    "specs": {
      "Upper": "100% Certified Italian Full-Grain Nappa",
      "Sole": "Vulcanized Natural Rubber Margom-style Cupsole",
      "Insole": "Removable Ergonomic Ortholite Foam",
      "Laces": "Waxed Egyptian Cotton",
      "Warranty": "6 Months Sole Separation Guarantee"
    }
  },
  {
    "id": "prod-fash-04",
    "name": "Tailored Linen Casual Shirt",
    "brand": "RivieraClub",
    "category": "Fashion",
    "subCategory": "Men",
    "price": 49,
    "oldPrice": 65,
    "discount": 25,
    "isDeal": true,
    "isFeatured": false,
    "rating": 4.6,
    "reviewCount": 67,
    "stock": 36,
    "tags": [
      "100% French Linen",
      "Breathable",
      "Pre-Washed"
    ],
    "images": [
      "/assets/images/products/prod-fash-04/main.jpg",
      "/assets/images/products/prod-fash-04/1.jpg",
      "/assets/images/products/prod-fash-04/2.jpg"
    ],
    "variants": {
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ]
    },
    "description": "Embrace balmy coastal breezes in pristine tailored linen. Woven from naturally temperature-regulating Normandy flax linen, garment-washed for broken-in softness from the very first wear. Finished with mother-of-pearl buttons.",
    "specs": {
      "Fabric": "100% Pure Normandy Flax Linen (160 GSM)",
      "Collar": "Soft Semi-Spread Band",
      "Buttons": "Genuine River Shell Buttons",
      "Fit": "Relaxed Tailored Silhouette",
      "Care": "Machine wash gentle cycle, line dry"
    }
  },
  {
    "id": "prod-fash-05",
    "name": "Structured Canvas Tote Bag",
    "brand": "AtelierNordic",
    "category": "Fashion",
    "subCategory": "Bags",
    "price": 39,
    "oldPrice": 49,
    "discount": 20,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 110,
    "stock": 40,
    "tags": [
      "Heavyweight Duck Canvas",
      "Laptop Sleeve",
      "Water-Repellent"
    ],
    "images": [
      "/assets/images/products/prod-fash-05/main.jpg",
      "/assets/images/products/prod-fash-05/1.jpg",
      "/assets/images/products/prod-fash-05/2.jpg"
    ],
    "description": "A heavy-duty carryall designed to outlast daily metropolitan transit. Tailored in 16oz waxed cotton duck canvas with full-grain bridle leather handles, padded 15-inch laptop compartment, and zippered internal valuables pocket.",
    "specs": {
      "Dimensions": "42cm x 36cm x 14cm (22L Capacity)",
      "Body": "16 oz Water-Resistant Cotton Duck Canvas",
      "Handles": "Vegetable-Tanned Bridle Leather (26cm drop)",
      "Hardware": "Solid Brass YKK Zippers",
      "Pockets": "1x Padded Laptop, 2x Slip Pockets, 1x Zip Pocket"
    }
  },
  {
    "id": "prod-fash-06",
    "name": "Silk Blend Pleated Midi Skirt",
    "brand": "MaisonClaire",
    "category": "Fashion",
    "subCategory": "Women",
    "price": 69,
    "oldPrice": 89,
    "discount": 22,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.7,
    "reviewCount": 54,
    "stock": 19,
    "tags": [
      "Mulberry Silk Blend",
      "Accordion Pleats",
      "Elastic Waist"
    ],
    "images": [
      "/assets/images/products/prod-fash-06/main.jpg",
      "/assets/images/products/prod-fash-06/1.jpg",
      "/assets/images/products/prod-fash-06/2.jpg"
    ],
    "variants": {
      "sizes": [
        "XS",
        "S",
        "M",
        "L"
      ]
    },
    "description": "Liquid drape with ethereal movement. Precision accordion pleats shimmer subtly as you stride, woven from lustrous mulberry silk blended with lightweight technical twill for wrinkle resistance. Comfortable concealed grosgrain waistband.",
    "specs": {
      "Material": "45% Mulberry Silk, 55% Crepe de Chine Poly",
      "Length": "Midi Length (78cm center back)",
      "Waist": "Soft Comfort-Stretch Elastic Grosgrain",
      "Lining": "Full Breathable Cupro Underlay",
      "Care": "Dry clean recommended"
    }
  },
  {
    "id": "prod-home-01",
    "name": "Ceramic Aroma Diffuser",
    "brand": "AuraLiving",
    "category": "Home and Living",
    "subCategory": "Decor",
    "price": 49,
    "oldPrice": 65,
    "discount": 25,
    "isDeal": true,
    "isFeatured": true,
    "rating": 4.9,
    "reviewCount": 175,
    "stock": 45,
    "tags": [
      "Ultrasonic",
      "Handmade Ceramic",
      "Warm Ambient LED"
    ],
    "images": [
      "/assets/images/products/prod-home-01/main.jpg",
      "/assets/images/products/prod-home-01/1.jpg",
      "/assets/images/products/prod-home-01/2.jpg"
    ],
    "description": "Transform your dwelling into an oasis of calm. Artisan crafted from matte stone ceramic, the Aura Diffuser emits ultra-fine ultrasonic mist with 7 subtle ambient LED illumination states and auto-shutoff when the reservoir empties.",
    "specs": {
      "Tank Capacity": "280ml (Up to 10 hours continuous)",
      "Coverage": "Up to 350 sq ft",
      "Mist Modes": "Continuous / 30-sec Intermittent / 2h & 4h Timer",
      "Sound Output": "Whisper Quiet (<20dB)",
      "Power": "Universal DC Adapter included (100-240V)"
    }
  },
  {
    "id": "prod-home-02",
    "name": "Minimalist Nordic Desk Lamp",
    "brand": "LumenStudio",
    "category": "Home and Living",
    "subCategory": "Lighting",
    "price": 55,
    "oldPrice": 70,
    "discount": 21,
    "isDeal": false,
    "isFeatured": true,
    "rating": 4.8,
    "reviewCount": 89,
    "stock": 20,
    "tags": [
      "Dimmable Touch",
      "Eye-Care LED",
      "Solid Oak Base"
    ],
    "images": [
      "/assets/images/products/prod-home-02/main.jpg",
      "/assets/images/products/prod-home-02/1.jpg",
      "/assets/images/products/prod-home-02/2.jpg"
    ],
    "description": "Scandinavian clarity meets functional desk illumination. Architectural aluminum gooseneck with 3-step stepless touch dimming, CRI 95+ flicker-free eye protection, anchored firmly on a weighted solid natural American oak base.",
    "specs": {
      "Illumination": "9W LED Array (800 Lumens Max)",
      "Color Temperature": "Adjustable 2700K Warm to 5000K Cool White",
      "Base": "FSC-Certified Solid American Oak",
      "Power": "Braided 1.8m Fabric Cable with USB-C Wall Brick",
      "Lifespan": "50,000 Rated Hours"
    }
  },
  {
    "id": "prod-home-04",
    "name": "Handmade Ceramic Vase",
    "brand": "KlayCraft",
    "category": "Home and Living",
    "subCategory": "Decor",
    "price": 35,
    "oldPrice": 45,
    "discount": 22,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.7,
    "reviewCount": 62,
    "stock": 25,
    "tags": [
      "Earthenware",
      "Wheel Thrown",
      "Waterproof Glaze"
    ],
    "images": [
      "/assets/images/products/prod-home-04/main.jpg",
      "/assets/images/products/prod-home-04/1.jpg",
      "/assets/images/products/prod-home-04/2.jpg"
    ],
    "description": "Sculptural organic elegance for fresh blooms or dried pampas stems. Hand-thrown on the potter's wheel from natural Portuguese earthenware, finished with an unglazed exterior texture and sealed interior waterproof coating.",
    "specs": {
      "Dimensions": "22cm Height x 14cm Diameter (Neck: 6cm)",
      "Material": "100% Natural Earthenware Clay",
      "Interior": "Water-Sealed Vitrified Glaze",
      "Base Protection": "Soft felt counter-scratch pads",
      "Craft": "Handmade in small artisan batches"
    }
  },
  {
    "id": "prod-home-05",
    "name": "Linen Duvet Cover Set",
    "brand": "Loom&Nest",
    "category": "Home and Living",
    "subCategory": "Bedding",
    "price": 119,
    "oldPrice": 159,
    "discount": 25,
    "isDeal": true,
    "isFeatured": false,
    "rating": 4.9,
    "reviewCount": 134,
    "stock": 16,
    "tags": [
      "100% French Flax",
      "Stone Washed",
      "Includes 2 Shams"
    ],
    "images": [
      "/assets/images/products/prod-home-05/main.jpg",
      "/assets/images/products/prod-home-05/1.jpg",
      "/assets/images/products/prod-home-05/2.jpg"
    ],
    "variants": {
      "sizes": [
        "Queen (90\" x 92\")",
        "King (106\" x 92\")"
      ]
    },
    "description": "Sleep in supreme European luxury. Woven from 100% certified French flax, pre-washed with pumice stones for that coveted relaxed rumpled hand feel. Breathable in high summer, naturally insulating when winter frosts settle.",
    "specs": {
      "Material": "100% Certified French Flax Linen (175 GSM)",
      "Set Includes": "1x Duvet Cover + 2x Standard Pillow Shams",
      "Closure": "Hidden Coconut Shell Buttons & 8 Interior Corner Ties",
      "Care": "Machine wash warm, tumble dry gentle",
      "Certification": "OEKO-TEX Standard 100 Certified"
    }
  },
  {
    "id": "prod-home-06",
    "name": "Scented Soy Wax Candle Trio",
    "brand": "BotanicaAroma",
    "category": "Home and Living",
    "subCategory": "Decor",
    "price": 32,
    "oldPrice": 40,
    "discount": 20,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 92,
    "stock": 48,
    "tags": [
      "100% Soy Wax",
      "Cotton Wick",
      "Non-Toxic"
    ],
    "images": [
      "/assets/images/products/prod-home-06/main.jpg",
      "/assets/images/products/prod-home-06/1.jpg",
      "/assets/images/products/prod-home-06/2.jpg"
    ],
    "description": "Curated ambient olfactory journey. Three hand-poured 7oz soy candles infused with pure botanical essential oils and phthalate-free fragrances. Clean crackle-free organic cotton wicks deliver over 45 burn hours per candle.",
    "specs": {
      "Burn Time": "45+ Hours per candle (135+ Hours Total)",
      "Wax Type": "100% Pure Midwest Soy Wax (Zero Paraffin)",
      "Vessel": "Reusable Amber Glass with Gold Metal Screw Lids",
      "Wick": "Lead-free Braided Organic Cotton",
      "Fragrance Notes": "Cedarwood, Fig Bark, Bergamot, Amber Resin"
    }
  },
  {
    "id": "prod-home-07",
    "name": "Artisan Ceramic Pour-Over Kettle & Carafe Set",
    "brand": "ArtisanCraft",
    "category": "Home and Living",
    "subCategory": "Kitchen",
    "price": 68,
    "oldPrice": 89,
    "discount": 24,
    "isDeal": true,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 65,
    "stock": 22,
    "tags": [
      "Borosilicate Glass",
      "Gooseneck Spout",
      "Barista Grade"
    ],
    "images": [
      "/assets/images/products/prod-home-07/main.jpg",
      "/assets/images/products/prod-home-07/1.jpg",
      "/assets/images/products/prod-home-07/2.jpg"
    ],
    "description": "Elevate your morning coffee ceremony. Precision gooseneck electric kettle coupled with a handcrafted double-walled borosilicate glass carafe and laser-etched stainless steel reusable microfilter for unmatched brew clarity.",
    "specs": {
      "Kettle Capacity": "800ml Precision Spout",
      "Carafe Capacity": "600ml Double-Walled Borosilicate",
      "Filter": "Dual-Layer Reusable Stainless Steel Micro-Mesh",
      "Handle": "Ergonomic Real Walnut Accents",
      "Material": "Food-grade 304 Stainless Steel & Glass",
      "Warranty": "1 Year Official Warranty"
    }
  },
  {
    "id": "prod-beau-02",
    "name": "Botanical Restorative Night Oil",
    "brand": "AuraApothecary",
    "category": "Beauty and Care",
    "subCategory": "Skincare",
    "price": 45,
    "oldPrice": 58,
    "discount": 22,
    "isDeal": false,
    "isFeatured": true,
    "rating": 4.9,
    "reviewCount": 147,
    "stock": 32,
    "tags": [
      "Rosehip & Squalane",
      "Cold Pressed",
      "100% Organic"
    ],
    "images": [
      "/assets/images/products/prod-beau-02/main.jpg",
      "/assets/images/products/prod-beau-02/1.jpg",
      "/assets/images/products/prod-beau-02/2.jpg"
    ],
    "description": "Replenish moisture reserves while you sleep. A golden botanical elixir powered by cold-pressed Chilean rosehip seed, plant squalane, evening primrose, and blue tansy. Calms redness, firms skin elasticity, and absorbs without residue.",
    "specs": {
      "Volume": "30ml / 1.0 fl oz",
      "Key Ingredients": "Organic Rosehip, Olive Squalane, Blue Tansy",
      "Skin Type": "Dry, Normal, Dehydrated, and Mature",
      "Aroma": "Subtle herbal blue tansy & sweet lavender",
      "Packaging": "UV-Protective Miron Glass Bottle"
    }
  },
  {
    "id": "prod-beau-03",
    "name": "Velvet Matte Lipstick - Terracotta",
    "brand": "RougeStudio",
    "category": "Beauty and Care",
    "subCategory": "Skincare",
    "price": 22,
    "oldPrice": 28,
    "discount": 21,
    "isDeal": true,
    "isFeatured": false,
    "rating": 4.7,
    "reviewCount": 98,
    "stock": 55,
    "tags": [
      "Hydrating Hyaluronic",
      "Non-Drying",
      "Long Wear 12h"
    ],
    "images": [
      "/assets/images/products/prod-beau-03/main.jpg",
      "/assets/images/products/prod-beau-03/1.jpg",
      "/assets/images/products/prod-beau-03/2.jpg"
    ],
    "description": "Saturated pigment meets featherweight comfort. Enriched with micronized hyaluronic spheres and organic shea butter, this modern matte bullet delivers 12-hour high-impact color without flaking, feathering, or dehydrating lips.",
    "specs": {
      "Finish": "Powdered Velvet Matte",
      "Wear Time": "Up to 12 Hours Transfer-Resistant",
      "Formulation": "Paraben-Free, Sulfate-Free, Cruelty-Free",
      "Net Weight": "3.8g / 0.13 oz",
      "Case": "Magnetic Weighted Brushed Aluminum Bullet"
    }
  },
  {
    "id": "prod-beau-04",
    "name": "Sandalwood & Bergamot Eau De Parfum",
    "brand": "MaisonClaire",
    "category": "Beauty and Care",
    "subCategory": "Fragrance",
    "price": 85,
    "oldPrice": 110,
    "discount": 23,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 81,
    "stock": 20,
    "tags": [
      "Artisan Perfumery",
      "Long Lasting",
      "Unisex Notes"
    ],
    "images": [
      "/assets/images/products/prod-beau-04/main.jpg",
      "/assets/images/products/prod-beau-04/1.jpg",
      "/assets/images/products/prod-beau-04/2.jpg"
    ],
    "description": "A magnetic, warm woody fragrance composed in Grasse, France. Opens with bright Calabrian bergamot and pink peppercorn, settles into Australian sandalwood, cardamom, and soft Haitian vetiver for a lingering signature sillage.",
    "specs": {
      "Concentration": "Eau de Parfum (22% Fragrance Oil)",
      "Volume": "50ml / 1.7 fl. oz.",
      "Top Notes": "Calabrian Bergamot, Pink Pepper, Grapefruit Peel",
      "Heart Notes": "Cardamom, Smoked Iris, Papyrus",
      "Base Notes": "Australian Sandalwood, Haitian Vetiver, Ambergris"
    }
  },
  {
    "id": "prod-beau-07",
    "name": "HydraLuxe Peptide Barrier Repair Cream",
    "brand": "HydraLuxe",
    "category": "Beauty and Care",
    "subCategory": "Skincare",
    "price": 38,
    "oldPrice": 48,
    "discount": 21,
    "isDeal": false,
    "isFeatured": true,
    "rating": 4.9,
    "reviewCount": 156,
    "stock": 45,
    "tags": [
      "Multi-Peptide Complex",
      "Ceramides NP",
      "Fragrance Free"
    ],
    "images": [
      "/assets/images/products/prod-beau-07/main.jpg",
      "/assets/images/products/prod-beau-07/1.jpg",
      "/assets/images/products/prod-beau-07/2.jpg"
    ],
    "description": "Intensively restore skin resilience with 5 essential ceramides, biomimetic peptides, and multi-molecular hyaluronic acid. Strengthens moisture barrier, locks in deep cellular hydration, and leaves a silky satin finish without heaviness.",
    "specs": {
      "Volume": "50ml / 1.7 fl. oz.",
      "Key Actives": "Copper Tripeptide-1, Ceramide NP, Squalane",
      "Skin Type": "Suitable for all types, including sensitive",
      "Formulation": "Cruelty-Free, Paraben-Free, Fragrance-Free",
      "Origin": "Formulated in France",
      "Packaging": "Airless Recyclable Dispenser"
    }
  },
  {
    "id": "prod-beau-08",
    "name": "Rose & Green Tea Clarifying Gel Cleanser",
    "brand": "FloraNaturals",
    "category": "Beauty and Care",
    "subCategory": "Skincare",
    "price": 24,
    "oldPrice": 32,
    "discount": 25,
    "isDeal": true,
    "isFeatured": false,
    "rating": 4.7,
    "reviewCount": 88,
    "stock": 50,
    "tags": [
      "pH Balanced 5.5",
      "Organic Botanicals",
      "Non-Stripping"
    ],
    "images": [
      "/assets/images/products/prod-beau-08/main.jpg",
      "/assets/images/products/prod-beau-08/1.jpg",
      "/assets/images/products/prod-beau-08/2.jpg"
    ],
    "description": "A gentle sulfate-free foaming gel cleanser enriched with organic damask rose water, antioxidant green tea leaf extract, and soothing centella asiatica. Removes impurities and makeup without disrupting your natural moisture balance.",
    "specs": {
      "Volume": "200ml / 6.8 fl. oz.",
      "pH Level": "Balanced at 5.5",
      "Key Actives": "Rosa Damascena Water, Camellia Sinensis, Niacinamide",
      "Texture": "Lightweight Cooling Gel-to-Foam",
      "Certifications": "Dermatologically Approved, 100% Vegan",
      "Shelf Life": "12 Months After Opening"
    }
  },
  {
    "id": "prod-beau-09",
    "name": "Cedarwood & Amber Precision Grooming Set",
    "brand": "NobleBarber",
    "category": "Beauty and Care",
    "subCategory": "Grooming",
    "price": 42,
    "oldPrice": 55,
    "discount": 24,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 72,
    "stock": 33,
    "tags": [
      "Cold-Pressed Argan",
      "Natural Boar Bristle",
      "Amber Wood Scent"
    ],
    "images": [
      "/assets/images/products/prod-beau-09/main.jpg",
      "/assets/images/products/prod-beau-09/1.jpg",
      "/assets/images/products/prod-beau-09/2.jpg"
    ],
    "description": "Masterful grooming ritual for discerning modern gentlemen. Combines conditioning cold-pressed organic jojoba and argan elixir, a solid brass detail comb, and a pocket pearwood brush with natural bristles.",
    "specs": {
      "Elixir Volume": "60ml Glass Dropper Bottle",
      "Brush Material": "Solid Pearwood with First-Cut Bristles",
      "Comb": "Antistatic Hand-Polished Brass",
      "Scent Profile": "Virginian Cedarwood, Warm Amber, Fresh Bergamot",
      "Formulation": "100% Organic Cold-Pressed Carrier Oils",
      "Includes": "Canvas Travel Storage Pouch"
    }
  },
  {
    "id": "prod-spor-01",
    "name": "Eco-Grip Cork Yoga Mat",
    "brand": "ZenithFlow",
    "category": "Sports and Fitness",
    "subCategory": "Yoga",
    "price": 59,
    "oldPrice": 75,
    "discount": 21,
    "isDeal": true,
    "isFeatured": true,
    "rating": 4.9,
    "reviewCount": 168,
    "stock": 26,
    "tags": [
      "Natural Organic Cork",
      "Non-Slip Traction",
      "5mm Cushion"
    ],
    "images": [
      "/assets/images/products/prod-spor-01/main.jpg",
      "/assets/images/products/prod-spor-01/1.jpg",
      "/assets/images/products/prod-spor-01/2.jpg"
    ],
    "description": "Unshakable stability for your daily flow. Harvested sustainably from Portuguese cork oak bonded with non-toxic natural tree rubber backing. Grippier the more you sweat, antimicrobial, and delivers supportive 5mm joint cushioning.",
    "specs": {
      "Dimensions": "183cm x 66cm x 5mm Thick",
      "Material": "100% Organic Cork Surface + Natural Rubber Base",
      "Weight": "2.4 kg (Dense anti-sliding core)",
      "Antimicrobial": "Naturally resistant to mold & odor bacteria",
      "Carrying": "Includes woven organic cotton shoulder sling"
    }
  },
  {
    "id": "prod-spor-02",
    "name": "HydroInsulated Steel Water Bottle",
    "brand": "ApexHydrate",
    "category": "Sports and Fitness",
    "subCategory": "Gym Gear",
    "price": 28,
    "oldPrice": 35,
    "discount": 20,
    "isDeal": false,
    "isFeatured": true,
    "rating": 4.8,
    "reviewCount": 215,
    "stock": 65,
    "tags": [
      "Vacuum Insulated",
      "Cold 24h / Hot 12h",
      "BPA Free"
    ],
    "images": [
      "/assets/images/products/prod-spor-02/main.jpg",
      "/assets/images/products/prod-spor-02/1.jpg",
      "/assets/images/products/prod-spor-02/2.jpg"
    ],
    "description": "Keeps hydration ice-cold during grueling workouts. Double-wall 18/8 food-grade pro stainless steel prevents sweat condensation and flavor transfer. Features a leak-proof chug sports lid with an integrated ergonomic carry loop.",
    "specs": {
      "Volume": "750ml / 25 fl oz",
      "Thermal Performance": "24h Ice Cold / 12h Piping Hot",
      "Steel Grade": "18/8 Pro-Grade Kitchen Stainless Steel",
      "Finish": "ColorLast Powder Coat (Dishwasher Safe)",
      "Cap": "BPA-Free Polypropylene with Silicone Hermetic Seal"
    }
  },
  {
    "id": "prod-spor-03",
    "name": "Seamless Training T-Shirt",
    "brand": "AeroActive",
    "category": "Sports and Fitness",
    "subCategory": "Activewear",
    "price": 34,
    "oldPrice": 42,
    "discount": 19,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.7,
    "reviewCount": 77,
    "stock": 38,
    "tags": [
      "4-Way Stretch",
      "Moisture Wicking",
      "Anti-Chafing"
    ],
    "images": [
      "/assets/images/products/prod-spor-03/main.jpg",
      "/assets/images/products/prod-spor-03/1.jpg",
      "/assets/images/products/prod-spor-03/2.jpg"
    ],
    "variants": {
      "sizes": [
        "S",
        "M",
        "L",
        "XL"
      ]
    },
    "description": "Total athletic freedom with zero friction. Circular knitted construction completely eliminates side seams, while body-mapped micro-ventilation zones breathe across high-heat areas. Infused with silver ions for permanent odor resistance.",
    "specs": {
      "Fabric": "68% Recycled Polyamide, 26% Polyester, 6% Elastane",
      "Technology": "DryVent 3D Moisture-Transport Knit",
      "Fit": "Athletic Contoured Fit",
      "Reflective": "Subtle 3M Scotchlite logo for dusk running",
      "Care": "Machine wash cold with like athletic garments"
    }
  },
  {
    "id": "prod-spor-04",
    "name": "High-Waist Compression Leggings",
    "brand": "AeroActive",
    "category": "Sports and Fitness",
    "subCategory": "Activewear",
    "price": 48,
    "oldPrice": 65,
    "discount": 26,
    "isDeal": true,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 142,
    "stock": 29,
    "tags": [
      "Squat Proof",
      "Dual Drop-In Pockets",
      "Stay-Up Waistband"
    ],
    "images": [
      "/assets/images/products/prod-spor-04/main.jpg",
      "/assets/images/products/prod-spor-04/1.jpg",
      "/assets/images/products/prod-spor-04/2.jpg"
    ],
    "variants": {
      "sizes": [
        "XS",
        "S",
        "M",
        "L"
      ]
    },
    "description": "Sculpting compression with weightless, buttery coverage. Our proprietary CloudFlex fabric passes the ultimate 100% squat-proof test, anchored by a reinforced 4-inch non-rolling waistband and two deep side pockets that secure large smartphones.",
    "specs": {
      "Fabric": "75% Recycled Micro-Nylon, 25% Lycra Spandex",
      "Inseam": "25-inch 7/8 Ankle Length",
      "Waistband": "High-Rise 4\" Wide Contour Band",
      "Pockets": "2x Side Thigh Pockets + 1x Hidden Waist Card Key Pocket",
      "Opacity": "100% Interlock Opaque Density"
    }
  },
  {
    "id": "prod-spor-05",
    "name": "Adjustable Speed Jump Rope",
    "brand": "IronGrip",
    "category": "Sports and Fitness",
    "subCategory": "Gym Gear",
    "price": 18,
    "oldPrice": 24,
    "discount": 25,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.6,
    "reviewCount": 88,
    "stock": 50,
    "tags": [
      "360 Ball Bearings",
      "Steel Cable",
      "Anti-Slip Handles"
    ],
    "images": [
      "/assets/images/products/prod-spor-05/main.jpg",
      "/assets/images/products/prod-spor-05/1.jpg",
      "/assets/images/products/prod-spor-05/2.jpg"
    ],
    "description": "Turbocharge cardio conditioning and double-unders. Fitted with dual 360-degree high-velocity stainless steel ball bearings for lightning rotation. The kink-resistant 3mm steel cable adjusts in seconds with tool-free thumb screws.",
    "specs": {
      "Cable": "3-meter (10ft) PVC-Coated Braided Steel Wire (3mm diameter)",
      "Bearings": "Dual Industrial High-Speed Ball Bearings",
      "Handles": "Aircraft Aluminum with Diamond Knurled Grip (15cm)",
      "Adjustment": "Toolless Precision Thumb-Screw Clamps",
      "Includes": "Ripstop Nylon Drawstring Storage Pouch"
    }
  },
  {
    "id": "prod-spor-06",
    "name": "Resistance Bands Set (5-Pack)",
    "brand": "IronGrip",
    "category": "Sports and Fitness",
    "subCategory": "Gym Gear",
    "price": 24,
    "oldPrice": 30,
    "discount": 20,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 195,
    "stock": 60,
    "tags": [
      "100% Natural Malaysian Latex",
      "5 Resistance Tiers",
      "Door Anchor"
    ],
    "images": [
      "/assets/images/products/prod-spor-06/main.jpg",
      "/assets/images/products/prod-spor-06/1.jpg",
      "/assets/images/products/prod-spor-06/2.jpg"
    ],
    "description": "Full-body strength training wherever you travel. Five color-coded continuous resistance loop bands molded from 100% genuine Malaysian natural latex for snap-resistant elasticity spanning 10 lbs up to 50 lbs of resistance.",
    "specs": {
      "Resistance Levels": "X-Light (10lb), Light (15lb), Medium (25lb), Heavy (35lb), X-Heavy (50lb)",
      "Material": "100% Natural Eco Latex (Eco-friendly)",
      "Circumference": "600mm x 50mm Width",
      "Includes": "5x Loop Bands, Instruction Workout Guide, Breathable Travel Mesh Pouch",
      "Warranty": "Lifetime Snap Replacement Guarantee"
    }
  },
  {
    "id": "prod-acc-01",
    "name": "Polarized Aviator Sunglasses",
    "brand": "SolarisOptics",
    "category": "Accessories",
    "subCategory": "Sunglasses",
    "price": 49,
    "oldPrice": 65,
    "discount": 25,
    "isDeal": true,
    "isFeatured": true,
    "rating": 4.8,
    "reviewCount": 130,
    "stock": 35,
    "tags": [
      "UV400 Protection",
      "Polarized Triacetate",
      "Titanium Frame"
    ],
    "images": [
      "/assets/images/products/prod-acc-01/main.jpg",
      "/assets/images/products/prod-acc-01/1.jpg",
      "/assets/images/products/prod-acc-01/2.jpg"
    ],
    "description": "Classic aviation heritage paired with advanced optical clarity. Featuring ultra-lightweight aerospace alloy frames, self-adjusting silicone nose pads, and 9-layer TAC polarized lenses that eliminate 99.9% of reflective glare.",
    "specs": {
      "Lens": "9-Layer TAC Polarized with UV400 Filtering",
      "Frame": "Ultralight Monel & Stainless Steel Alloy",
      "Dimensions": "58mm Lens Width / 14mm Bridge / 140mm Temple",
      "Hinges": "Flex-Spring German Barrel Hinges",
      "Includes": "Hard Leatherette Shell Case & Microfiber Cleaning Cloth"
    }
  },
  {
    "id": "prod-acc-03",
    "name": "Minimalist Chrono Watch",
    "brand": "ChronosTime",
    "category": "Accessories",
    "subCategory": "Watches",
    "price": 135,
    "oldPrice": 175,
    "discount": 23,
    "isDeal": false,
    "isFeatured": true,
    "rating": 4.9,
    "reviewCount": 78,
    "stock": 15,
    "tags": [
      "Sapphire Crystal",
      "Miyota Movement",
      "5ATM Waterproof"
    ],
    "images": [
      "/assets/images/products/prod-acc-03/main.jpg",
      "/assets/images/products/prod-acc-03/1.jpg",
      "/assets/images/products/prod-acc-03/2.jpg"
    ],
    "description": "Architectural purity for the wrist. Ultra-slim 7.8mm profile in surgical 316L stainless steel, housing a precision Japanese Miyota quartz caliber beneath a scratch-proof sapphire crystal glass dome. Paired with quick-release Horween leather.",
    "specs": {
      "Case Diameter": "40mm (7.8mm thickness)",
      "Case Material": "316L Marine-Grade Stainless Steel",
      "Glass": "Anti-Reflective Scratch-Resistant Sapphire Crystal",
      "Movement": "Japanese Miyota Quartz Chronograph",
      "Strap": "20mm Quick-Release Full-Grain Horween Leather",
      "Water Resistance": "5ATM (50 meters)"
    }
  },
  {
    "id": "prod-acc-04",
    "name": "Magnetic Leather Phone Case",
    "brand": "CasingStudio",
    "category": "Accessories",
    "subCategory": "Phone Cases",
    "price": 38,
    "oldPrice": 48,
    "discount": 21,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.7,
    "reviewCount": 104,
    "stock": 42,
    "tags": [
      "MagSafe Compatible",
      "European Leather",
      "Microfiber Lined"
    ],
    "images": [
      "/assets/images/products/prod-acc-04/main.jpg",
      "/assets/images/products/prod-acc-04/1.jpg",
      "/assets/images/products/prod-acc-04/2.jpg"
    ],
    "description": "Wraps your smartphone in supple European aniline leather that develops an exquisite rich patina over time. Equipped with an integrated 38-magnet MagSafe ring for robust accessory hold and machined aluminum tactile buttons.",
    "specs": {
      "Leather": "Supple Full-Grain Vegetable-Tanned European Calfskin",
      "Compatibility": "MagSafe and Qi wireless charging compatible",
      "Buttons": "Independent Machined Anodized Aluminum Buttons",
      "Lining": "Silky Japanese Microfiber Interior to prevent scuffs",
      "Drop Protection": "Raised 1.2mm camera lip and screen bezel"
    }
  },
  {
    "id": "prod-acc-05",
    "name": "Canvas & Leather Weekender Duffle",
    "brand": "Sovereign Leather",
    "category": "Accessories",
    "subCategory": "Bags",
    "price": 125,
    "oldPrice": 160,
    "discount": 22,
    "isDeal": true,
    "isFeatured": false,
    "rating": 4.9,
    "reviewCount": 88,
    "stock": 12,
    "tags": [
      "Carry-On Approved",
      "18oz Waxed Canvas",
      "Shoe Compartment"
    ],
    "images": [
      "/assets/images/products/prod-acc-05/main.jpg",
      "/assets/images/products/prod-acc-05/1.jpg",
      "/assets/images/products/prod-acc-05/2.jpg"
    ],
    "description": "The quintessential travel companion for 3-day escapes. Rugged 18oz water-repellent paraffin-waxed cotton canvas trimmed with thick oil-tanned pull-up leather, featuring a separate ventilated shoe compartment and trolley sleeve.",
    "specs": {
      "Dimensions": "52cm x 30cm x 28cm (42L TSA Overhead Carry-On)",
      "Body": "18oz Heavy Waxed Cotton Canvas + Full-Grain Leather Trim",
      "Zippers": "Heavy-Duty Brass YKK #10 Two-Way Main Zipper",
      "Features": "Dedicated Side Shoe Tunnel, Padded Shoulder Strap, Trolley Pass",
      "Weight": "1.7 kg"
    }
  },
  {
    "id": "prod-acc-06",
    "name": "Pure Wool Tartan Scarf",
    "brand": "HighlandWeave",
    "category": "Accessories",
    "subCategory": "Fashion",
    "price": 45,
    "oldPrice": 55,
    "discount": 18,
    "isDeal": false,
    "isFeatured": false,
    "rating": 4.8,
    "reviewCount": 63,
    "stock": 28,
    "tags": [
      "100% Lambswool",
      "Made in Scotland",
      "Fringed Ends"
    ],
    "images": [
      "/assets/images/products/prod-acc-06/main.jpg",
      "/assets/images/products/prod-acc-06/1.jpg",
      "/assets/images/products/prod-acc-06/2.jpg"
    ],
    "description": "Woven in the Scottish borders using traditional shuttle looms. 100% pure first-shear lambswool combed for exceptional gentleness against neck skin. Classic heritage tartan patterns with hand-twisted fringed tassel edges.",
    "specs": {
      "Dimensions": "180cm x 30cm (including 8cm fringes)",
      "Material": "100% Pure Virgin First-Shear Lambswool",
      "Feel": "Sublimely soft, non-scratchy thermal breathability",
      "Weave": "Traditional Twill Weave",
      "Origin": "Woven and finished in Selkirk, Scotland"
    }
  },
  {
    "id": "prod-acc-07",
    "name": "Sovereign Full-Grain Leather Cardholder",
    "brand": "Sovereign Leather",
    "category": "Accessories",
    "subCategory": "Wallets",
    "price": 35,
    "oldPrice": 48,
    "discount": 27,
    "isDeal": true,
    "isFeatured": false,
    "rating": 4.9,
    "reviewCount": 120,
    "stock": 40,
    "tags": [
      "Italian Vegetable-Tanned",
      "RFID Blocking",
      "Ultra-Slim"
    ],
    "images": [
      "/assets/images/products/prod-acc-07/main.jpg",
      "/assets/images/products/prod-acc-07/1.jpg",
      "/assets/images/products/prod-acc-07/2.jpg"
    ],
    "description": "Artisanal minimalism refined. Handcrafted from top-grade Tuscan vegetable-tanned full-grain leather with waxed saddler stitching. Features 6 card slots, a central cash pocket, and built-in aerospace RFID blocking shielding.",
    "specs": {
      "Material": "Certified Tuscan Full-Grain Vegetable-Tanned Leather",
      "Capacity": "Up to 8 Cards + Folded Currency",
      "Security": "13.56 MHz RFID / NFC Signal Blocking",
      "Dimensions": "100 x 75 x 4 mm",
      "Stitching": "High-Tensile German Poly-Cotton Waxed Thread",
      "Warranty": "Lifetime Craftsmanship Guarantee"
    }
  }
];

export const SAMPLE_REVIEWS = [
  {
    "id": "rev-1",
    "productId": "prod-elec-01",
    "userName": "Alexander Wright",
    "userAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    "rating": 5,
    "date": "October 14, 2026",
    "title": "Astonishing acoustic depth and noise cancellation",
    "comment": "The soundstage is remarkable. Lows are articulate without muddying the midrange, and the ANC easily silences subway trains and office chatter. Worth every single penny."
  },
  {
    "id": "rev-2",
    "productId": "prod-elec-02",
    "userName": "Elena Rostova",
    "userAvatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    "rating": 5,
    "date": "October 18, 2026",
    "title": "Sleek, accurate, and 2-week battery life is real",
    "comment": "I run 10k twice a week and track sleep daily. The AMOLED screen is crisp under bright sunlight and the heart rate tracker matches my dedicated chest strap."
  },
  {
    "id": "rev-3",
    "productId": "prod-fash-01",
    "userName": "Marcus Thorne",
    "userAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    "rating": 5,
    "date": "October 10, 2026",
    "title": "Exceptional weight and perfect tailored cut",
    "comment": "You can feel the quality of the 13.5oz denim immediately. The wash has that authentic vintage patina and the fit is structured across the shoulders without feeling stiff."
  },
  {
    "id": "rev-4",
    "productId": "prod-beau-07",
    "userName": "Sophia Chen",
    "userAvatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
    "rating": 5,
    "date": "October 08, 2026",
    "title": "Transformed my skin barrier in three weeks",
    "comment": "Intensely hydrating and soothing. My moisture barrier feels completely healed and plump every morning."
  }
];
