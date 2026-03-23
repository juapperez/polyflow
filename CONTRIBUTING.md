# Contributing to PolyFlow

Thank you for your interest in contributing to PolyFlow! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit bug fixes
- ✨ Add new features
- 🌍 Add translations

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/juapperez/polyflow.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## 📋 Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🎨 Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## 🧪 Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test in both Testnet and Mainnet modes
- Test language switching (EN/PT)

## 📝 Commit Messages

Use clear, descriptive commit messages:

- `feat: Add new strategy block type`
- `fix: Resolve market filter bug`
- `docs: Update API documentation`
- `style: Format code with prettier`
- `refactor: Simplify market fetching logic`
- `test: Add tests for risk manager`

## 🌍 Adding Translations

To add a new language:

1. Open `frontend/src/translations.ts`
2. Add your language code to the `Language` type
3. Add translations following the existing structure
4. Update language selector in `App.tsx` and `Builder.tsx`
5. Test all UI elements in the new language

## 🐛 Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/OS information
- Network mode (Testnet/Mainnet)

## 💡 Feature Requests

For feature requests, please describe:

- The problem you're trying to solve
- Your proposed solution
- Alternative solutions considered
- Any additional context

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## ❓ Questions?

Feel free to open an issue or reach out on Discord!

Thank you for contributing to PolyFlow! 🎉
