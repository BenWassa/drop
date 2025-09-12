# 📚 Documentation Overview

Welcome to the drop documentation! This directory contains all the project documentation, from original vision to technical implementation details.

## 📖 Essential Reading

### 🌟 **[Original_Vision.md](Original_Vision.md)**
**Must-read first** — The foundational philosophy and core insights that birthed drop. Understand the "identity practice over time" concept and the resource allocation model.

### 💡 **[Key_Insights.md](Key_Insights.md)**
Quick reference for the most important design decisions and implementation principles. Perfect for staying aligned with the original vision during development.

### 🤖 **[AI_Instructions.md](AI_Instructions.md)**
Technical guide for AI assistants working on the codebase. Includes architecture overview, development patterns, and contribution guidelines.

## 🧭 Creative Direction & Recent Changes

See **[Creative_Direction.md](Creative_Direction.md)** for a concise summary of the product philosophy and recent implementation notes. It captures high-level design decisions (identity-first approach, quarterly commitments) and recent engineering choices including:

- Modular screens under `src/screens/` and the ScreenRegistry pattern in `src/ui.js`.
- ScreenRegistry autoload behavior: modules that attach setup functions to `window` are auto-registered to avoid race conditions when scripts load before `src/ui.js`.
- Per-aspect fitness model (cardio/strength/skills) with tiered multipliers used to compute weekly targets.
- Onboarding second-step paths: `direct`, `identities`, and `growth` and how they write to `state.commitments`.

This note is intentionally short; refer to the full docs for implementation details.

## 📋 Project Management

### 🚀 **[NextSteps.md](NextSteps.md)**
Current development roadmap and implementation status. Tracks progress from prototype to polished product.

### 📊 **[NextSteps_Management.md](NextSteps_Management.md)**
Detailed project management documentation with timelines, priorities, and success metrics.

## 🛠 Technical Documentation

### 💻 **[TechStack.md](TechStack.md)**
Complete technical stack overview, development environment setup, and deployment instructions.

### 🎨 **[CONTRIBUTING.md](CONTRIBUTING.md)**
Guidelines for contributors, coding standards, and development workflow.

## 📁 Archive

The `archive/` folder contains historical documentation and specifications:

- **Commission_drop.md** — Original project commissioning document
- **UI_Flow.md** — Detailed user interface flow specifications
- **AI_Instructions.md** — Earlier version of AI development guidelines
- **BackendIntegration.md** — Future backend integration plans
- **TechStack.md** — Earlier technical stack documentation

## 📖 Reading Order

For new contributors or anyone wanting to understand the project deeply:

1. **[Original_Vision.md](Original_Vision.md)** — Core philosophy and mission
2. **[Key_Insights.md](Key_Insights.md)** — Key design decisions and principles
3. **[TechStack.md](TechStack.md)** — Technical foundation
4. **[AI_Instructions.md](AI_Instructions.md)** — Development guidelines
5. **[NextSteps.md](NextSteps.md)** — Current status and roadmap

## 🔗 Quick Links

- **Main README**: [../README.md](../README.md) — Project overview and quick start
- **Live App**: Open `../index.html` in your browser
- **Source Code**: `../src/` directory
- **Tests**: `../tests/` directory

---

*drop is a mobile-first web app that reimagines habit tracking as identity practice over time. The documentation reflects this philosophy — focused on understanding and contribution rather than exhaustive technical details.*