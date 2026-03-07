# UI/UX Architecture & Design System
# Free SaaS Arabic Digital Menu

## 1. Core Philosophy (Anti-AI Look)
To ensure the platform looks like a premium, handcrafted product and not a generic AI-generated template, we must adhere strictly to these principles:
- **Bespoke Typography**: No standard system fonts (Arial, Roboto defaults). We will use premium, modern Arabic fonts (e.g., *Cairo*, *Tajawal*, or *IBM Plex Sans Arabic*).
- **Asymmetric & Intentional White Space**: Move away from perfect, rigid, blocky grids. Use soft margins, overlapping elements, and generous padding to let the content breathe.
- **Micro-interactions & Polish**: Smooth hover states, subtle active states, nuanced skeleton loaders, and satisfying transitions (e.g., Spring physics instead of linear easings).
- **Sophisticated Color Palette**: Avoid default hex codes (like solid #FF0000 or #0000FF). Use tailored, low-saturation backgrounds with high-contrast, vibrant accents.
- **Glassmorphism & Depth**: Strategic use of soft shadows (`box-shadow`), blur effects (`backdrop-filter`), and layered backgrounds instead of flat, solid borders.

## 2. Design System Tokens

### 2.1 Colors
- **Background (Light Mode)**: `#FAFAFA` (Off-white, warm) to `#F3F4F6`.
- **Background (Dark Mode)**: `#0F172A` (Rich slate) to `#1E293B`.
- **Surface**: `#FFFFFF` (Light) / `#1E293B` (Dark).
- **Primary Accent**: `#F97316` (Vibrant Orange, stimulates appetite) or `#10B981` (Fresh Emerald).
- **Text (Primary)**: `#111827` (Not pure black) / `#F9FAFB` (Dark mode).
- **Text (Secondary)**: `#6B7280` / `#9CA3AF`.
- **Borders/Dividers**: `#E5E7EB` / `#374151`.

### 2.2 Typography (Arabic First)
- **Primary Font**: [Tajawal](https://fonts.google.com/specimen/Tajawal) for headings (Bold, expressive).
- **Secondary Font**: [Cairo](https://fonts.google.com/specimen/Cairo) or [Readex Pro](https://fonts.google.com/specimen/Readex+Pro) for body text (Highly readable at small sizes).
- **Hierarchy**:
  - H1: 2.25rem, Extra Bold, tight tracking.
  - H2: 1.875rem, Bold.
  - H3: 1.5rem, Semi-Bold.
  - Body: 1rem, Regular, 1.6 line-height.
  - Caption: 0.875rem, Medium.

### 2.3 Shadows & Depth
- **Soft Shadow**: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)`
- **Hover Shadow**: `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)`
- **Border Radius**: 
  - Cards: `16px` or `24px` (Friendly, modern).
  - Buttons: `9999px` (Pill shape) or `12px` (Squircle).

## 3. UI Layouts & Components

### 3.1 The Customer View (The Menu)
*This is the most critical view. It must look appetizing and effortless.*
- **Header**: Large hero image of the restaurant, overlapping with the restaurant logo (Avatar style), name, and a short description.
- **Category Navigation**: Sticky, horizontally scrollable tabs (Pill design) that highlight the active category as the user scrolls down the page.
- **Menu Item Card**:
  - Image on the right (RTL), text on the left.
  - Soft rounded corners, subtle border.
  - "Add to Cart" button is an icon (`+`) that expands into a counter `- 1 +` smoothly when clicked.
- **Floating Cart (Bottom)**: A sticky bottom bar showing total items, total price, and a prominent "View Cart & Order" button.

### 3.2 The Checkout / WhatsApp Flow
- A clean slide-up modal (BottomSheet) or a distraction-free page.
- Clear summary of items.
- Input fields for table number or delivery address.
- A prominent "Send via WhatsApp" button with the WhatsApp green color (`#25D366`) and icon.

### 3.3 The Restaurant Admin Dashboard
*Clean, analytical, and heavily focused on ease of use.*
- **Sidebar**: Collapsible, icon-heavy navigation.
- **Dashboard Home**: Quick stats (Views, Clicks, Top items).
- **Menu Builder**: Drag-and-drop interface for categories and items. Inline editing where possible to avoid context switching.
- **Live Preview**: A mobile-sized frame on the right side of the screen showing exactly how the menu looks to customers as the admin edits it.

## 4. Technical Implementation Strategy
To achieve this premium look quickly and maintainably:
1. **Framework**: React / Vite (or Next.js for better SEO on restaurant pages).
2. **Styling**: Tailwind CSS + `tailwindcss-rtl` plugin (for seamless RTL support) + Framer Motion (for premium animations).
3. **Components**: Radix UI primitives / Shadcn UI (heavily customized to remove the "default" look and match our Arabic typography and spacing).

## 5. Next Steps
1. Initialize the frontend project (e.g., React + Vite + Tailwind).
2. Set up the specific Arabic fonts and color palette in `tailwind.config.js`.
3. Build the customer-facing Menu component to visualize the "Premium Look".
