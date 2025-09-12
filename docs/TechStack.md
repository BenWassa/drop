# Tech Stack & Development Setup

> **🚀 Browser-Native Application** - No Node.js, no build tools, no compilation required. Just open `index.html` in your web browser!

## Overview

**Ocean in a Drop** is a mobile-first web application for quarterly habit tracking and identity practice. This is a **browser-native application** that runs directly in any modern web browser without requiring Node.js, build tools, or compilation. Simply open `index.html` in your browser to run the app.

## Core Technologies

### Frontend Stack
- **HTML5** - Semantic markup with mobile-first responsive design
- **CSS3** - Custom styling with Tailwind CSS framework
- **Vanilla JavaScript (ES6+)** - No heavy frameworks, modular architecture

### Key Libraries & Tools
- **Tailwind CSS** - Utility-first CSS framework (CDN delivery - no building required!)
- **Inter Font** - Google Fonts for typography
- **LocalStorage API** - Client-side data persistence
- **Vitest** - Fast unit testing framework for JavaScript (optional, requires Node.js)
- **GitHub Pages** - Static site hosting and deployment

### CSS Architecture
- **Tailwind CSS via CDN**: No build process needed - loads directly from `https://cdn.tailwindcss.com`
- **Custom Styles**: Additional styling in `style.css` for glass effects, gradients, and custom components
- **No Compilation**: All CSS works immediately in the browser without any processing

### Development Environment
- **VS Code** - Primary IDE with recommended extensions
- **Git** - Version control with GitHub integration
- **PowerShell** - Windows command line for development tasks
- **Browser DevTools** - Debugging and testing

## Project Structure

```
drop/
├── index.html              # Main application entry point
├── style.css              # Custom CSS with Tailwind utilities
├── package.json           # npm configuration and scripts (optional, for testing)
├── src/                   # Modular JavaScript architecture
│   ├── config.js         # Application configuration & archetypes
│   ├── state.js          # State management & localStorage
│   ├── logic.js          # Business logic & calculations
│   ├── ui.js            # UI rendering & interactions
│   └── main.js           # App initialization & orchestration
├── tests/                 # Unit test files
│   └── quarter.test.js   # Quarter calculation tests
├── docs/                  # Documentation
│   ├── CONTRIBUTING.md   # Contribution guidelines
│   ├── archive/          # Historical documentation
│   └── AI_Instructions.md # AI agent guidelines
├── assets/               # Static assets (images, icons)
├── config/               # Configuration files
└── README.md            # Project documentation
```

## Development Setup

### Prerequisites
- **Modern web browser** (Chrome, Firefox, Safari, Edge) - that's it!
- VS Code (recommended) or any code editor
- Git for version control (optional, for collaboration)
- Internet connection for Tailwind CSS CDN (optional, can work offline once loaded)

### Local Development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/BenWassa/drop.git
   cd drop
   ```

2. **Open in VS Code:**
   ```bash
   code .
   ```

3. **Start development (no build tools needed!):**
   - **Double-click `index.html`** or drag it into your web browser
   - Edit source files in `src/` with your code editor
   - **Refresh browser** to see changes instantly
   - Use browser DevTools (F12) for debugging and testing
   - **That's it!** No compilation, no servers, no Node.js required

### Testing Setup (Optional)
The project includes unit tests that can be run locally if you have Node.js installed:
- `package.json` contains test configuration
- `tests/quarter.test.js` contains test cases
- Run tests with `npm test` (requires Node.js/npm installation)
- Tests are optional - the app works perfectly without them

### File Organization Principles

#### JavaScript Modules (`src/`)
- **`config.js`** - Application constants, archetypes, and domain configurations
- **`state.js`** - State management, localStorage operations, DEV_MODE toggle
- **`logic.js`** - Business logic, calculations, date utilities, archetype application
- **`ui.js`** - DOM manipulation, screen rendering, event handlers, developer toolbar
- **`main.js`** - Application initialization, event listeners, routing logic

#### Styling Approach
- **Tailwind CSS** - Utility classes for rapid UI development
- **Custom CSS** - Glassmorphism effects, animations, responsive design
- **CSS Variables** - Consistent color scheme and theming
- **Mobile-First** - Responsive design starting from small screens

## Build & Deployment

### Development Workflow
- **No build step required** - Direct file editing and browser refresh
- **Hot reload** - Changes reflect immediately in browser
- **Version control** - Git commits for all changes
- **Testing** - Manual testing in multiple browsers

### GitHub Pages Deployment
- **Root deployment** - `index.html`, `style.css` remain in repository root
- **Script paths** - Updated to load from `src/` directory
- **Static hosting** - No server-side processing required
- **CDN dependencies** - Tailwind CSS loaded via CDN for performance

### Performance Considerations
- **Lightweight** - No heavy JavaScript frameworks
- **CDN optimization** - External resources loaded efficiently
- **Local storage** - Data persistence without server calls
- **Progressive enhancement** - Works without JavaScript (graceful degradation)

## Browser Support

- **Modern browsers** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers** - iOS Safari, Chrome Mobile, Samsung Internet
- **Responsive design** - Works on all screen sizes from 320px to 4K
- **Touch-friendly** - Optimized for mobile touch interactions

## Development Best Practices

### Code Quality
- **ES6+ features** - Modern JavaScript with const/let, arrow functions, template literals
- **Modular architecture** - Separation of concerns across files
- **Consistent naming** - camelCase for variables/functions, PascalCase for constructors
- **Error handling** - Try/catch blocks and defensive programming

### Performance
- **Efficient DOM manipulation** - Minimal reflows and repaints
- **Event delegation** - Single event listeners on parent elements
- **Memory management** - Proper cleanup and garbage collection
- **Bundle optimization** - No unused code or dependencies

### Accessibility
- **Semantic HTML** - Proper heading hierarchy and ARIA labels
- **Keyboard navigation** - Focus management and keyboard shortcuts
- **Screen reader support** - Descriptive alt text and labels
- **Color contrast** - WCAG compliant color combinations

This tech stack provides a solid foundation for rapid development, easy maintenance, and reliable deployment while keeping the application lightweight and performant.