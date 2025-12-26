# Migration to Pure Three.js Architecture

## Overview
This document describes the migration of the Palace Engine from a hybrid CSS 3D / Three.js system to a pure Three.js rendering system.

## Changes Made

### 1. Removed CSS-Only Modules
- `js/builder.js` - Removed DOM-based corridor builder
- `js/camera.js` - Removed CSS-based WASD camera controller
- `js/scroll-camera.js` - Removed viewport transform controls
- `js/room-builder.js` - Removed room generation for CSS mode
- `js/room-geometry.js` - Removed CSS-based room geometry

### 2. Removed CSS-Only Styles
- `css/world-objects.css` - Removed CSS 3D world objects
- `css/cards.css` - Removed CSS-based card styling
- `css/room-box.css` - Removed CSS room styling
- `css/room-card.css` - Removed CSS room card styling
- `css/animations.css` - Removed CSS animations
- `css/wasd-hints.css` - Removed WASD hints for CSS mode

### 3. Updated app.js
- Removed CSS mode toggle (`USE_THREEJS` flag)
- Removed `initCSS()` method
- Made `initThreeJS()` the only initialization path
- Updated debug system to use `cinematicCamera` instead of `window.Camera`
- Updated mode display to show "Three.js only"

### 4. CSS Updates
- Updated `scene-3d.css` to be Three.js canvas focused
- Removed CSS 3D transforms and perspective
- Kept UI-only styles: `ui-layer.css`, `quiz-mode.css`, `mobile-controls.css`

## Benefits of Migration

1. **Simplified Architecture**: Single rendering path instead of dual system
2. **Better Performance**: Pure WebGL rendering with GPU acceleration
3. **Enhanced Features**: Access to Three.js features (shaders, lighting, effects)
4. **Easier Maintenance**: Single codebase instead of duplicated functionality
5. **Better Mobile Performance**: Optimized for WebGL on mobile devices

## Remaining Files (Post-Migration)

### JavaScript Modules
- `app.js` - Main application entry point (Three.js only)
- `builder-threejs.js` - Three.js world generation
- `CinematicCamera.js` - Camera system
- `CameraControls.js` - Input handling
- `quiz-manager.js` - Quiz system with raycasting
- `mobile-dpad.js` - Mobile controls
- `GameLoop.js` - Game loop system
- Debug modules - All debug systems remain compatible

### CSS Files
- `reset.css` - Base resets
- `variables.css` - CSS variables
- `scene-3d.css` - Three.js canvas container
- `ui-layer.css` - UI overlay styles
- `quiz-mode.css` - Quiz overlay styles
- `mobile-controls.css` - Mobile D-pad styles
- `responsive.css` - Responsive design
- `style.css` - General styles
- `crosshair.css` - Crosshair overlay

## Testing Checklist

- [x] Three.js rendering works correctly
- [x] Camera movement functions properly
- [x] Quiz system with raycasting works
- [x] Mobile D-pad positioning correct
- [x] All debug systems functional
- [x] Performance improved

## Rollback Plan

If needed, rollback can be performed using git history to restore the hybrid system.