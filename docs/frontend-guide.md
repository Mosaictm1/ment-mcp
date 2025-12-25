# 🎨 Frontend Guide

## Design System

### Color Palette

> [!NOTE]
> **Design Identity**: Strictly monochromatic green theme with soft, diffused, shadowless studio lighting. Creates a friendly and approachable corporate mood. High resolution, 4k, smooth vector finish.

```css
:root {
  /* === MONOCHROMATIC GREEN THEME === */
  
  /* Background Colors - Very Pale Mint */
  --bg-primary: #EEF6EE;
  --bg-secondary: #D0E7D0;
  --bg-light: #F5FAF5;
  --bg-accent: #E0F0E0;
  
  /* Element Colors - Soft Sage & Grass Greens */
  --primary: #75B875;          /* Sage Green */
  --primary-dark: #57A857;     /* Grass Green */
  --primary-light: #8FC98F;
  --primary-hover: #67A667;
  
  /* Details & Text - Deep Forest & Dark Moss */
  --text-primary: #2E592E;     /* Deep Forest */
  --text-secondary: #3D6B3D;
  --text-dark: #182F18;        /* Dark Moss */
  --text-muted: #4A7A4A;
  
  /* Accent Variations */
  --accent-light: #A3CFA3;
  --accent-medium: #6DB86D;
  --accent-dark: #2E592E;
  
  /* UI States */
  --success: #57A857;
  --error: #C25757;            /* Muted red for errors */
  --warning: #B8A857;          /* Muted yellow for warnings */
  --info: #57A8A8;             /* Muted teal for info */
  
  /* Borders & Shadows */
  --border-light: #C5DFC5;
  --border-medium: #A3CFA3;
  --shadow-color: rgba(46, 89, 46, 0.1);
}
```

### Design Guidelines

| Element | Color Range | Usage |
|---------|-------------|-------|
| **Backgrounds** | `#EEF6EE` → `#D0E7D0` | Page backgrounds, cards |
| **UI Elements** | `#75B875` → `#57A857` | Buttons, icons, highlights |
| **Text & Details** | `#2E592E` → `#182F18` | Headings, body text, borders |

### Lighting & Style

- **Lighting**: Soft, diffused, shadowless studio lighting
- **Mood**: Friendly and approachable corporate
- **Resolution**: High resolution, 4k ready
- **Finish**: Smooth vector finish

### Typography

```css
/* Headings - Inter or Outfit */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

h1 { font-size: 3.5rem; font-weight: 800; }
h2 { font-size: 2.5rem; font-weight: 700; }
h3 { font-size: 1.75rem; font-weight: 600; }
h4 { font-size: 1.25rem; font-weight: 600; }

/* Body */
body { font-family: 'Inter', sans-serif; font-size: 1rem; }

/* Code */
code { font-family: 'JetBrains Mono', monospace; }
```

---

## Component Library

### Button Components

```tsx
// Primary Button
<Button variant="primary" size="lg">
  Get Started Free
</Button>

// Secondary Button
<Button variant="outline" size="md">
  View Demo
</Button>

// Variants: primary, secondary, outline, ghost
// Sizes: sm, md, lg
```

### Feature Card

```tsx
<FeatureCard
  icon={<NodeIcon />}
  title="Complete Node Coverage"
  description="543 nodes with 99% accuracy"
  link="/docs/nodes"
/>
```

### Pricing Card

```tsx
<PricingCard
  tier="Free"
  price="$0"
  period="forever"
  features={[
    '100 MCP calls per day',
    'All 543 n8n nodes',
    '2,700+ templates'
  ]}
  cta="Get Started"
/>
```

---

## Page Structure

### Landing Page Sections

```
1. Header (sticky navbar)
2. Hero Section
3. Problem → Solution Timeline
4. Features Grid (6 cards)
5. Demo Video Section
6. Integrations
7. Pricing
8. Testimonials
9. Footer
```

### Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Header (Logo, User Menu)                    │
├──────────┬──────────────────────────────────┤
│          │                                   │
│  Sidebar │  Main Content Area               │
│          │                                   │
│  - Home  │  ┌─────────────────────────────┐ │
│  - Flows │  │  API Usage Card             │ │
│  - Keys  │  ├─────────────────────────────┤ │
│  - Stats │  │  Recent Workflows           │ │
│          │  ├─────────────────────────────┤ │
│          │  │  Quick Actions              │ │
│          │  └─────────────────────────────┘ │
└──────────┴──────────────────────────────────┘
```

---

## Animation Guidelines

### Framer Motion Defaults

```tsx
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};
```

### Scroll Animations

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
>
  <FeatureCard />
</motion.div>
```

---

## Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## Accessibility

- All interactive elements have focus states
- Color contrast ratio ≥ 4.5:1
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
