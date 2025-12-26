import * as THREE from 'three';

/**
 * Efficient frustum culling system to hide objects outside camera view
 */
class FrustumCullingSystem {
  constructor(camera) {
    this.camera = camera;
    this.frustum = new THREE.Frustum();
    this.plane = new THREE.Plane();
    this.projectionMatrix = new THREE.Matrix4();
    this.mvMatrix = new THREE.Matrix4();
    this.clippingPlanes = [
      new THREE.Plane(),
      new THREE.Plane(),
      new THREE.Plane(),
      new THREE.Plane(),
      new THREE.Plane(),
      new THREE.Plane()
    ];
  }

  /**
   * Update frustum based on current camera position and orientation
   */
  updateFrustum() {
    this.projectionMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );

    // Extract frustum planes from the combined projection-view matrix
    const projScreenMatrix = this.projectionMatrix;
    const planes = this.clippingPlanes;

    // Left plane
    planes[0].set(
      projScreenMatrix.elements[3] + projScreenMatrix.elements[0],
      projScreenMatrix.elements[7] + projScreenMatrix.elements[4],
      projScreenMatrix.elements[11] + projScreenMatrix.elements[8],
      projScreenMatrix.elements[15] + projScreenMatrix.elements[12]
    ).normalize();

    // Right plane
    planes[1].set(
      projScreenMatrix.elements[3] - projScreenMatrix.elements[0],
      projScreenMatrix.elements[7] - projScreenMatrix.elements[4],
      projScreenMatrix.elements[11] - projScreenMatrix.elements[8],
      projScreenMatrix.elements[15] - projScreenMatrix.elements[12]
    ).normalize();

    // Top plane
    planes[2].set(
      projScreenMatrix.elements[3] - projScreenMatrix.elements[1],
      projScreenMatrix.elements[7] - projScreenMatrix.elements[5],
      projScreenMatrix.elements[11] - projScreenMatrix.elements[9],
      projScreenMatrix.elements[15] - projScreenMatrix.elements[13]
    ).normalize();

    // Bottom plane
    planes[3].set(
      projScreenMatrix.elements[3] + projScreenMatrix.elements[1],
      projScreenMatrix.elements[7] + projScreenMatrix.elements[5],
      projScreenMatrix.elements[11] + projScreenMatrix.elements[9],
      projScreenMatrix.elements[15] + projScreenMatrix.elements[13]
    ).normalize();

    // Near plane
    planes[4].set(
      projScreenMatrix.elements[3] + projScreenMatrix.elements[2],
      projScreenMatrix.elements[7] + projScreenMatrix.elements[6],
      projScreenMatrix.elements[11] + projScreenMatrix.elements[10],
      projScreenMatrix.elements[15] + projScreenMatrix.elements[14]
    ).normalize();

    // Far plane
    planes[5].set(
      projScreenMatrix.elements[3] - projScreenMatrix.elements[2],
      projScreenMatrix.elements[7] - projScreenMatrix.elements[6],
      projScreenMatrix.elements[11] - projScreenMatrix.elements[10],
      projScreenMatrix.elements[15] - projScreenMatrix.elements[14]
    ).normalize();
  }

  /**
   * Check if a bounding sphere intersects with the frustum
   */
  sphereInFrustum(center, radius) {
    const planes = this.clippingPlanes;
    
    for (let i = 0; i < 6; i++) {
      const distance = planes[i].distanceToPoint(center) + radius;
      if (distance < 0) {
        return false; // Outside this plane
      }
    }
    return true; // Inside all planes
  }

  /**
   * Check if a point is inside the frustum
   */
  pointInFrustum(point) {
    const planes = this.clippingPlanes;
    
    for (let i = 0; i < 6; i++) {
      if (planes[i].distanceToPoint(point) < 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Update visibility of objects based on frustum culling
   */
  updateVisibility(objects) {
    this.updateFrustum();
    
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      
      if (obj.userData.type === 'card') {
        // For cards, we can use point-based culling since they're planar
        obj.visible = this.pointInFrustum(obj.position);
      } else {
        // For other objects, use sphere-based culling if bounding sphere is available
        if (obj.geometry && obj.geometry.boundingSphere) {
          obj.geometry.computeBoundingSphere();
          const worldCenter = obj.localToWorld(obj.geometry.boundingSphere.center.clone());
          const radius = obj.geometry.boundingSphere.radius * Math.max(
            obj.scale.x, Math.max(obj.scale.y, obj.scale.z)
          );
          
          obj.visible = this.sphereInFrustum(worldCenter, radius);
        } else {
          obj.visible = this.pointInFrustum(obj.position);
        }
      }
    }
  }
}

export { FrustumCullingSystem };