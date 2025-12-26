import * as THREE from 'three';

/**
 * Level of Detail system for cards based on distance from camera
 */
class CardLODSystem {
  constructor(camera) {
    this.camera = camera;
    
    // Create different quality materials for LOD
    this.highDetailMaterial = null;
    this.mediumDetailMaterial = null;
    this.lowDetailMaterial = null;
    
    this.lodDistances = {
      highToMedium: 15,   // Switch to medium detail beyond 15 units
      mediumToLow: 30     // Switch to low detail beyond 30 units
    };
  }

  /**
   * Initialize LOD materials with different quality settings
   */
  initializeMaterials() {
    // High detail material (default)
    this.highDetailMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0,
      alphaTest: 0.1
    });

    // Medium detail material (simplified)
    this.mediumDetailMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      alphaTest: 0.15
    });

    // Low detail material (minimal detail)
    this.lowDetailMaterial = new THREE.MeshBasicMaterial({
      color: 0xdddddd,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      alphaTest: 0.2
    });
  }

  /**
   * Update LOD for all cards based on distance from camera
   */
  update(cards) {
    const cameraPosition = this.camera.position;
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      // Calculate distance to camera
      const distance = card.position.distanceTo(cameraPosition);
      
      // Apply frustum culling first - if outside frustum, don't render regardless of distance
      if (!card.userData.inFrustum) {
        card.visible = false;
        continue;
      }
      
      card.visible = true; // Reset visibility
      
      // Determine LOD level based on distance
      if (distance > this.lodDistances.mediumToLow) {
        // Low detail for distant cards
        if (card.material !== this.lowDetailMaterial) {
          card.material = this.lowDetailMaterial;
        }
      } else if (distance > this.lodDistances.highToMedium) {
        // Medium detail for mid-range cards
        if (card.material !== this.mediumDetailMaterial) {
          card.material = this.mediumDetailMaterial;
        }
      } else {
        // High detail for close cards
        if (card.material !== this.highDetailMaterial) {
          card.material = this.highDetailMaterial;
        }
      }
      
      // Additional optimization: reduce opacity slightly for very distant cards
      if (distance > 25) {
        const opacityFactor = Math.max(0.6, 1.0 - (distance - 25) / 20);
        if (card.material.opacity !== opacityFactor) {
          card.material.opacity = opacityFactor;
        }
      }
    }
  }

  /**
   * Get appropriate material based on distance
   */
  getMaterialForDistance(distance) {
    if (distance > this.lodDistances.mediumToLow) {
      return this.lowDetailMaterial;
    } else if (distance > this.lodDistances.highToMedium) {
      return this.mediumDetailMaterial;
    } else {
      return this.highDetailMaterial;
    }
  }
}

export { CardLODSystem };