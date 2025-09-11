# Tech Stack & Development Setup

## Overview

**Ocean in a Drop** is a mobile-first web application for quarterly habit tracking and identity practice. The app uses modern web technologies with a focus on simplicity, performance, and maintainability.

## Core Technologies

### Frontend Stack
- **HTML5** - Semantic markup with mobile-first responsive design
- **CSS3** - Custom styling with Tailwind CSS framework
- **Vanilla JavaScript (ES6+)** - No heavy frameworks, modular architecture

### Key Libraries & Tools
- **Tailwind CSS** - Utility-first CSS framework (CDN delivery)
- **Inter Font** - Google Fonts for typography
- **LocalStorage API** - Client-side data persistence
- **GitHub Pages** - Static site hosting and deployment

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
├── src/                   # Modular JavaScript architecture
│   ├── config.js         # Application configuration & archetypes
│   ├── state.js          # State management & localStorage
│   ├── logic.js          # Business logic & calculations
│   ├── ui.js            # UI rendering & interactions
│   └── main.js           # App initialization & orchestration
├── docs/                  # Documentation
│   ├── CONTRIBUTING.md   # Contribution guidelines
│   ├── archive/          # Historical documentation
│   └── AI_Instructions.md # AI agent guidelines
├── assets/               # Static assets (images, icons)
├── config/               # Configuration files
├── tests/                # Test files
└── README.md            # Project documentation
```

## Development Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- VS Code (recommended) or any code editor
- Git for version control
- Internet connection for Tailwind CSS CDN

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

3. **Start development:**
   - Open `index.html` in your browser
   - Make changes to source files in `src/`
   - Refresh browser to see changes
   - Use browser DevTools for debugging

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