/**
 * MEMORY PALACE - MAIN APPLICATION
 * Last update: 2025-12-11 (Pure Three.js mode)
 * 
 * MIGRATION: Removed CSS 3D mode, now uses pure Three.js rendering
 */

import { CONFIG } from './config.js';
import { GameLoop } from './GameLoop.js';

// === DEBUG SYSTEM IMPORTS ===
import { 
  initializeDebugSystems, 
  setupDebugKeyboardShortcuts,
  getDebugLevel,
  setDebugLevel
} from './debug-integration.js';

// === THREE.JS MODE IMPORTS ===
import * as THREE from 'three';
import { buildOptimizedWorld, buildOptimizedWorldInstanced, createOptimizedFloor, createOptimizedWalls, disposeScene } from './OptimizedBuilder.js';
import { CinematicCamera } from '../CinematicCamera.js';
import { CameraControls } from '../CameraControls.js';
import { PerformanceMonitor } from './PerformanceMonitor.js';
import { SmartRenderer } from './SmartRenderer.js';

const App = {
    // Global variables
    scene: null,
    camera: null,
    renderer: null,
    cards: null,
    cinematicCamera: null,
    controls: null,
    gameLoop: null,
    
    async init() {
        const loader = document.getElementById('loading');
        
        try {
            // 1. Initialize GameLoop
            console.log('⚙️ Initializing GameLoop...');
            this.gameLoop = new GameLoop({
                targetFPS: 60,
                debug: true,
                maxDeltaCap: 250
            });
            console.log('✅ GameLoop ready');
            
            // 2. Read lesson ID from URL
            const params = new URLSearchParams(window.location.search);
            const lessonId = params.get('lesson') || '263';
            console.log(`🎯 Loading lesson: ${lessonId}`);
            
            // 3. Load JSON
            const response = await fetch(`../data/${lessonId}.json`);
            if (!response.ok) {
                throw new Error(`Lesson ${lessonId} not found`);
            }
            
            const data = await response.json();
            console.log('📦 Data loaded:', data);
            
            // 4. Extract words
            let words = [];
            if (data.content?.vocabulary?.words) {
                words = data.content.vocabulary.words;
            }
            
            if (words.length === 0) {
                throw new Error('No words in this lesson');
            }
            console.log(`📚 Words found: ${words.length}`);
            
            // === PURE THREE.JS MODE ===
            await this.initThreeJS(words);
            
            // Update word counter
            const counter = document.getElementById('word-counter');
            if (counter) {
                counter.textContent = `0 / ${words.length}`;
            }
            
            // 🔧 CRITICAL: Initialize Debug Systems AFTER camera is ready
            if (this.cinematicCamera) {
                try {
                  initializeDebugSystems(this.cinematicCamera);
                  setupDebugKeyboardShortcuts();
                  console.log('🔧 Debug systems initialized');
                } catch (error) {
                  console.warn('⚠️ Debug system initialization failed:', error);
                }
            }
            
            // Start GameLoop
            this.gameLoop.start();
            console.log('▶️ GameLoop started');
            
            // Hide loader
            if (loader) {
                loader.style.display = 'none';
            }
            
            console.log(`✅ App initialized with ${words.length} words`);
            console.log(`🎮 Mode: Three.js only`);
            console.log('🔍 Debug: Press G to toggle panel, F3-F8 for features');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            
            if (loader) {
                loader.style.display = 'none';
            }
            
            showError(`Ошибка: ${error.message}`);
        }
    },
    
    
    /**
     * THREE.JS MODE INITIALIZATION
     */
    async initThreeJS(words) {
        console.log('🎬 Initializing Three.js mode...');
        
        // 1. Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);
        
        // 2. Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 15);
        
        // 3. Create renderer with optimizations
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',  // Optimize for performance
            preserveDrawingBuffer: false,         // Reduce memory usage
            logarithmicDepthBuffer: true          // Better for large scenes
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;  // Better performance with good visuals
        this.renderer.toneMappingExposure = 1.2;
        
        // 4. Add canvas to #world
        const worldContainer = document.getElementById('world');
        if (!worldContainer) {
            throw new Error('#world container not found');
        }
        
        worldContainer.innerHTML = '';
        worldContainer.appendChild(this.renderer.domElement);
        console.log('🖼️ Three.js canvas added to #world');
        
        // 5. Add lighting (optimized)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);  // Increased ambient
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;   // Lower shadow resolution for performance
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
        console.log('💡 Lighting added');
        
        // 6. Create floor and walls (optimized)
        createOptimizedFloor(this.scene);
        createOptimizedWalls(this.scene);
        
        // 7. Create cards (optimized with InstancedMesh)
        const { instancedMesh, cards: cardTextures } = await buildOptimizedWorldInstanced(words, this.scene);
        this.instancedMesh = instancedMesh;
        this.cards = cardTextures;
        console.log(`🎴 ${cardTextures.length} cards created with InstancedMesh (${instancedMesh.count} instances)`);
        
        // 8. Initialize Cinematic Camera
        this.cinematicCamera = new CinematicCamera(this.scene, this.camera, this.cards);
        this.controls = new CameraControls(this.cinematicCamera);
        console.log('🎥 Cinematic Camera initialized');
        
        // 9. Setup quiz interaction
        this.setupQuizInteraction(words);
        
        // 10. Performance monitoring
        this.performanceMonitor = new PerformanceMonitor();
        
        // 11. Smart renderer
        this.smartRenderer = new SmartRenderer(this.renderer, this.camera, this.scene);
        
        // 12. Animation loop with performance optimizations
        const clock = new THREE.Clock();
        
        const animate = () => {
            // Begin performance monitoring
            this.performanceMonitor.begin(this.renderer);
            
            const deltaTime = clock.getDelta();
            
            // Update camera
            this.cinematicCamera.update(deltaTime);
            
            // Smart render
            this.smartRenderer.render();
            
            // End performance monitoring
            this.performanceMonitor.end();
            
            requestAnimationFrame(animate);
        };
        
        animate();
        
        // 11. Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log('🎮 Controls: W/S or ↑/↓ - Move, Space - Next waypoint');
        console.log('📊 Performance Monitor: Active');
    },
    
    /**
     * Setup raycasting for quiz
     */
    setupQuizInteraction(words) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.renderer.domElement.addEventListener('click', (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            
            // For InstancedMesh, we need special handling
            let intersects = [];
            
            // First, try standard intersection with the instanced mesh
            if (this.instancedMesh) {
                const tempGroup = new THREE.Group();
                tempGroup.add(this.instancedMesh.clone());
                
                // We'll need to manually calculate which instance was clicked
                const instanceIntersections = this.checkInstanceIntersection(raycaster, this.instancedMesh, words);
                
                if (instanceIntersections.length > 0) {
                    // Create a mock intersection object to maintain compatibility
                    intersects = [instanceIntersections[0]];
                }
            } else {
                // Fallback to original method if not using instanced mesh
                intersects = raycaster.intersectObjects(this.cards);
            }
            
            if (intersects.length > 0) {
                // Use the intersected data from our custom calculation
                const wordData = intersects[0].object.userData || intersects[0].userData;
                
                console.log('🎯 Clicked card:', wordData.word);
                
                this.showQuizOverlay(wordData);
                
                if (this.controls) {
                    this.controls.enabled = false;
                }
            }
        });
        
        console.log('✅ Raycasting setup complete');
    },
    
    /**
     * Check which instance of an InstancedMesh was clicked
     */
    checkInstanceIntersection(raycaster, instancedMesh, words) {
        const intersects = [];
        
        // Get the world matrix for each instance and create temporary objects for raycasting
        const tempMatrix = new THREE.Matrix4();
        const tempPosition = new THREE.Vector3();
        const tempRotation = new THREE.Euler();
        const tempScale = new THREE.Vector3(1, 1, 1);
        
        // Create a simple bounding box for each instance to test against
        const geometry = instancedMesh.geometry;
        const count = instancedMesh.count;
        
        // Raycast against each instance's approximate position
        for (let i = 0; i < Math.min(count, words.length); i++) {
            instancedMesh.getMatrixAt(i, tempMatrix);
            tempMatrix.decompose(tempPosition, tempRotation, tempScale);
            
            // Create a temporary object to represent this instance
            const tempObject = new THREE.Object3D();
            tempObject.position.copy(tempPosition);
            tempObject.rotation.copy(tempRotation);
            tempObject.scale.copy(tempScale);
            tempObject.updateMatrixWorld(true);
            
            // Calculate the bounding sphere for this instance
            const bbox = new THREE.Box3().setFromCenterAndSize(
                tempPosition,
                new THREE.Vector3(3, 2, 0.1) // Approximate size of a card
            );
            
            // Test if the ray intersects with this bounding box
            if (raycaster.ray.intersectsBox(bbox)) {
                // Found a potential hit, create intersection data
                const intersection = {
                    distance: raycaster.ray.origin.distanceTo(tempPosition),
                    point: tempPosition.clone(),
                    object: {
                        userData: words[i],
                        position: tempPosition.clone()
                    },
                    userData: words[i]
                };
                
                intersects.push(intersection);
                
                // Only return the closest hit
                break;
            }
        }
        
        return intersects;
    },
    
    /**
     * Show quiz overlay
     */
    showQuizOverlay(wordData) {
        const overlay = document.createElement('div');
        overlay.id = 'quiz-overlay-threejs';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const quizCard = document.createElement('div');
        quizCard.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            border: 3px solid #FFD60A;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        quizCard.innerHTML = `
            <div style="text-align: center; color: white;">
                <h1 style="font-size: 48px; margin: 0 0 20px 0;">${wordData.word}</h1>
                <p style="font-size: 24px; color: rgba(255, 255, 255, 0.6); margin: 0 0 30px 0;">
                    ${wordData.transcription || `/${wordData.word}/`}
                </p>
                
                ${wordData.example ? `
                    <p style="font-size: 18px; font-style: italic; color: rgba(255, 255, 255, 0.5); margin-bottom: 30px;">
                        "${wordData.example}"
                    </p>
                ` : ''}
                
                <input 
                    type="text" 
                    id="quiz-input-threejs" 
                    placeholder="Введите перевод..."
                    style="
                        width: 100%;
                        padding: 15px;
                        font-size: 20px;
                        border: 2px solid #0f4c75;
                        border-radius: 10px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        margin-bottom: 20px;
                    "
                    autocomplete="off"
                />
                
                <div id="quiz-hint-threejs" style="
                    color: #FFD60A;
                    font-size: 16px;
                    margin-bottom: 20px;
                    display: none;
                "></div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="check-btn-threejs" style="
                        padding: 15px 30px;
                        font-size: 18px;
                        background: #0f4c75;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">Проверить</button>
                    
                    <button id="close-btn-threejs" style="
                        padding: 15px 30px;
                        font-size: 18px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">Закрыть (Esc)</button>
                </div>
            </div>
        `;
        
        overlay.appendChild(quizCard);
        document.body.appendChild(overlay);
        
        const input = document.getElementById('quiz-input-threejs');
        input.focus();
        
        const checkBtn = document.getElementById('check-btn-threejs');
        const hint = document.getElementById('quiz-hint-threejs');
        
        const checkAnswer = () => {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = wordData.translation.toLowerCase();
            
            if (userAnswer === correctAnswer) {
                hint.style.display = 'block';
                hint.style.color = '#4CAF50';
                hint.textContent = '✅ Правильно!';
                
                setTimeout(() => {
                    closeOverlay();
                }, 1500);
            } else {
                hint.style.display = 'block';
                hint.style.color = '#f44336';
                hint.textContent = `❌ Неправильно. Правильный ответ: ${wordData.translation}`;
            }
        };
        
        checkBtn.onclick = checkAnswer;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
        
        const closeBtn = document.getElementById('close-btn-threejs');
        const closeOverlay = () => {
            overlay.remove();
            if (this.controls) {
                this.controls.enabled = true;
            }
        };
        
        closeBtn.onclick = closeOverlay;
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeOverlay();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
};

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-msg';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px 40px;
        background: rgba(255, 50, 50, 0.9);
        color: white;
        border-radius: 12px;
        font-size: 18px;
        border: 2px solid rgba(255, 100, 100, 0.5);
        z-index: 10000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}

// Start on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

export default App;

// ═══════════════════════════════════════════════════════════
// 🔧 DEBUG: Export to window for Console access
// ═══════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  // Export THREE
  import('three').then(THREE => {
    window.THREE = THREE;
    console.log('✅ THREE exported to window');
  }).catch(err => {
    console.warn('⚠️ Could not export THREE to window:', err);
    // Fallback: if THREE is already imported, use it
    if (typeof THREE !== 'undefined') {
      window.THREE = THREE;
      console.log('✅ THREE exported to window via fallback');
    }
  });
  
  // Export App
  window.App = App;
  console.log('✅ App exported to window');
  
  // Export shortcuts
  window.getCamera = () => App.cinematicCamera?.camera;
  window.getCards = () => App.cards;
  window.getScene = () => App.scene;
  window.tp = (index) => App.cinematicCamera?.moveToWaypoint(index);
  
  console.log('✅ Debug shortcuts ready: tp(index), getCamera(), getCards()');
}
