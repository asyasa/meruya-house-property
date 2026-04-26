# Perumahan Komplek Masyarakat Sejahtera Meruya Selatan

> *Where Life Finds Its Finest Form*
>
> **Bukan Sekadar Rumah — Sebuah Peradaban**

An Awwwards-grade landing page for a 1,215-hectare premium residential complex in Meruya Selatan, Jakarta Barat, by **Rizal Fadhilah Property Group**.

## Stack

- Vanilla HTML / CSS / JavaScript (no build step required)
- [GSAP](https://gsap.com/) + ScrollTrigger for scroll-driven animation
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scroll
- [Swiper](https://swiperjs.com/) for carousels
- [Three.js](https://threejs.org/) for the hero particle field
- [Remixicon](https://remixicon.com/) for iconography
- Google Fonts: Cormorant Garamond, Syne, DM Sans, Playfair Display, JetBrains Mono

## Running locally

The project is purely static — any HTTP server works:

```bash
# Option A: Python
python3 -m http.server 8080

# Option B: Node
npx serve -l 8080 .
```

Then open <http://localhost:8080>.

## File structure

```
/
├── index.html                  # Full landing page markup
├── assets/
│   ├── css/
│   │   ├── main.css            # Base, layout, components
│   │   └── animations.css      # Keyframes, motion utilities
│   └── js/
│       ├── main.js             # Bootstrap + cross-section logic
│       ├── gsap-init.js        # ScrollTrigger, SplitText, magnetic buttons
│       └── components/
│           ├── calculator.js   # Mortgage simulator
│           ├── carousel.js     # Swiper init (testimonials)
│           └── form.js         # Booking form handling
└── README.md
```

## Sections

1. Preloader
2. Fixed Navigation
3. Hero
4. About / Intro
5. Keunggulan Kawasan
6. Tipe Hunian (horizontal scroll)
7. Zona Komersial
8. Fasilitas Kawasan (tabbed)
9. Sistem Proteksi
10. Galeri Kawasan
11. Lokasi & Aksesibilitas
12. Program Komunitas Gratis
13. Koneksi Teknologi
14. Sertifikasi & Partner
15. Simulasi KPR
16. Booking & Konsultasi
17. Testimoni
18. Tips & Panduan
19. FAQ
20. Footer

## Color palette

```
--midnight-violet  #242038
--slate-blue       #725ac1
--soft-periwinkle  #8d86c9
--pale-slate       #cac4ce
--linen            #f7ece1
```

## License

© 2025 Rizal Fadhilah Property Group. All Rights Reserved.
