import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-three-d-mountains',
  imports: [],
  templateUrl: './three-d-mountains.component.html',
  styleUrl: './three-d-mountains.component.scss',
})
export class ThreeDMountainsComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private mountains!: THREE.Object3D;
  private animationId!: number;

  ngOnInit(): void {
    this.initScene();
    this.loadModel();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer?.dispose();
  }

  private initScene(): void {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x121212);

    // Create camera
    const canvas = this.canvasRef.nativeElement;

    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 10;
    this.camera.position.y = 0;
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private loadModel(): void {
    const loader = new GLTFLoader();

    loader.load(
      '/assets/mountains.glb',
      (gltf: any) => {
        console.log('Model loaded successfully!', gltf);
        this.mountains = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(this.mountains);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log('Model bounds - Center:', center, 'Size:', size);

        // Scale the model first - make it bigger
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 15 / maxDim;
        this.mountains.scale.multiplyScalar(scale);

        this.mountains.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale
        );

        console.log('Model scaled by:', scale);
        console.log('Final model position:', this.mountains.position);

        this.mountains.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              child.material.color.setHex(0x00d5a6);  // Primary color

              if (child.material.emissive) {
                child.material.emissive.setHex(0x004d3d);
              }

              child.material.needsUpdate = true;
            }
          }
        });

        this.mountains.rotation.y = Math.PI / 2;
        this.scene.add(this.mountains);
      },
    );
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.mountains) {
      this.mountains.rotation.y += 0.001;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
}
