# Contributing to statsFM

Thank you for your interest in contributing to **statsFM**! Whether you are fixing bugs, improving accessibility, adding new music insights, or polishing the documentation, your help is appreciated.

---

## ✦ Code of Conduct

Please treat everyone with respect and kindness. We aim to foster an open, welcoming, and harassment-free community for all contributors.

---

## ✦ Getting Started

1. **Fork the Repository**:
   Click the "Fork" button on the GitHub repository [paidguy/statsFM](https://github.com/paidguy/statsFM).

2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/<your-username>/statsFM.git
   cd statsFM
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## ✦ Development Guidelines

### Code Quality & Formatting
- **TypeScript**: Ensure strict typing is maintained. Standard enums and interfaces should be located in `src/types/`.
- **Linting**: Run `npm run lint` before committing to verify zero compile or type errors.
- **Styling**: Use Tailwind CSS with the established two-ink risograph color palette:
  - Deep Navy Canvas: `#101626`
  - Elevated Surface: `#18203a`
  - Hairline Border: `#232d4b`
  - Fluorescent Pink Accent: `#ff5c9a`
  - Aqua Cyan Accent: `#3fd6c6`
  - Paper White Foreground: `#f1ebdc`
  - Muted Metadata: `#98a1ba`

### Accessibility Standards
- All interactive controls (`button`, `a`, `input`) must support full keyboard navigation (`Tab`, `Space`, `Enter`).
- All interactive elements must maintain visible `focus-visible:ring-2 focus-visible:ring-[#3fd6c6]` rings.
- Maintain minimum touch targets ($\ge 40\text{px}$ / $44\text{px}$ on mobile).
- Check color contrast for WCAG AA ($\ge 4.5:1$ for body text).

---

## ✦ Submitting a Pull Request

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Make your changes and test locally with `npm run build` and `npm run lint`.
3. Commit with a clear, concise message:
   ```bash
   git commit -m "feat(ratings): add decade distribution export card"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/my-new-feature
   ```
5. Open a Pull Request against the `main` branch of `paidguy/statsFM`.

---

Thank you for helping make statsFM better!
