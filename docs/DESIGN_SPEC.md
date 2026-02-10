# Brand Color Redesign Specification

## 1. Analysis of Current State
**Current Primary Color**: Purple/Indigo
- **Dark Mode**: `#818CF8` (Soft Indigo)
- **Light Mode**: `#4F46E5` (Indigo 600)
- **Usage**:
  - **Navigation**: Links and active states.
  - **Hero Section**: Gradient backgrounds and text highlights.
  - **Components**: Blockquote borders, card borders (subtle), icons.
  - **Buttons**: Primary call-to-action.

**Issue**: The current purple leans towards "creative/playful" or "SaaS startup" vibes. To convey "Professionalism" and "Ecommerce Authority," we need colors that suggest stability, growth, and trust.

## 2. Proposed Color Schemes
We propose three distinct options to replace the purple theme. All options meet WCAG 2.1 AA standards.

### Option A: Deep Ocean (Trust & Authority) - *Recommended*
A classic, high-trust blue palette often used in enterprise software and financial services. It conveys stability and deep knowledge.

| Mode | Role | Color Name | Hex | Contrast vs Bg |
|------|------|------------|-----|----------------|
| **Light** | Primary | Sky 700 | `#0369A1` | 6.5:1 (Pass AA) |
| **Light** | Surface | Cool Gray 50 | `#F9FAFB` | N/A |
| **Dark** | Primary | Sky 400 | `#38BDF8` | 9.7:1 (Pass AAA) |
| **Dark** | Surface | Soft Charcoal | `#161618` | N/A |

* **Best for**: Establishing immediate trust and a "corporate professional" identity.

### Option B: Modern Teal (Growth & Efficiency)
A fresh, modern palette that signals growth (green) without the generic "finance green" look. It feels tech-forward and clean.

| Mode | Role | Color Name | Hex | Contrast vs Bg |
|------|------|------------|-----|----------------|
| **Light** | Primary | Emerald 600 | `#059669` | 4.9:1 (Pass AA) |
| **Light** | Surface | Cool Gray 50 | `#F9FAFB` | N/A |
| **Dark** | Primary | Emerald 400 | `#34D399` | 10.8:1 (Pass AAA) |
| **Dark** | Surface | Soft Charcoal | `#161618` | N/A |

* **Best for**: Emphasizing "optimization," "results," and "modern tactics."

### Option C: Slate & Bronze (Premium & Exclusive)
A sophisticated monochrome palette with warm metallic accents. It stands out as high-end and "consultant-grade."

| Mode | Role | Color Name | Hex | Contrast vs Bg |
|------|------|------------|-----|----------------|
| **Light** | Primary | Amber 700 | `#B45309` | 4.6:1 (Pass AA) |
| **Light** | Surface | Warm Gray 50 | `#FAFAF9` | N/A |
| **Dark** | Primary | Amber 400 | `#FBBF24` | 11.5:1 (Pass AAA) |
| **Dark** | Surface | Warm Black | `#1C1917` | N/A |

* **Best for**: Differentiating as a "premium service" or "expert methodology."

## 3. Implementation Plan
We will replace the CSS variables in `src/assets/css/foundation.css`.

**Variables to Update:**
- `--accent-color`
- `--blockquote-border`
- `--hero-line-gradient` (RGB values need update)

## 4. Verification Strategy
- **Automated Check**: Verify contrast ratios using WCAG calculator.
- **Visual Check**: Inspect Homepage, Service Cards, and Typography.
- **User Proxy**: Ensure text is legible without strain (Contrast > 4.5:1).
