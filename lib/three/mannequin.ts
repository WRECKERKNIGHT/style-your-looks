import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Real rigged mannequin (Cesium Man glTF sample asset) served locally.
 * Unlike the procedural parametric avatar, this is an actual sculpted human
 * mesh with a skeleton and animation clip — the "photoreal" studio mode.
 */
export const MANNEQUIN_URL = "/models/mannequin/cesium-man.glb";

/** Target display height in metres — standard tailoring mannequin height. */
const TARGET_HEIGHT = 1.78;

export interface MannequinHandle {
  /** Root object to add to a scene. Feet rest at y=0, centred on origin. */
  object: THREE.Group;
  /** Animation clips bundled with the model (walk cycle etc.). */
  animations: THREE.AnimationClip[];
  /** Mixer driving the clips; null when the model ships without any. */
  mixer: THREE.AnimationMixer | null;
  /** Advance playback by dt seconds — call once per frame while playing. */
  update: (dtSeconds: number) => void;
  /** Play a clip by index (default 0). Returns false when nothing to play. */
  playClip: (index?: number) => boolean;
  /** Halt playback and freeze the pose where it is. */
  pause: () => void;
  /** Release GPU resources held by the model + its textures. */
  dispose: () => void;
}

export async function loadMannequin(url: string = MANNEQUIN_URL): Promise<MannequinHandle> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);

  const object = gltf.scene;

  // Normalise whatever units the artist used: uniform-scale so the figure is
  // TARGET_HEIGHT tall, then drop the lowest point onto y=0 and centre X/Z so
  // OrbitControls can treat the pedestal centre as the orbit target.
  const initialBox = new THREE.Box3().setFromObject(object);
  const initialSize = new THREE.Vector3();
  initialBox.getSize(initialSize);
  if (initialSize.y > 0) {
    object.scale.setScalar(TARGET_HEIGHT / initialSize.y);
  }
  const fittedBox = new THREE.Box3().setFromObject(object);
  const fittedCenter = new THREE.Vector3();
  fittedBox.getCenter(fittedCenter);
  object.position.x -= fittedCenter.x;
  object.position.z -= fittedCenter.z;
  object.position.y -= fittedBox.min.y;

  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  const animations = gltf.animations ?? [];
  const mixer = animations.length > 0 ? new THREE.AnimationMixer(object) : null;
  let activeAction: THREE.AnimationAction | null = null;

  return {
    object,
    animations,
    mixer,
    update(dtSeconds: number) {
      mixer?.update(dtSeconds);
    },
    playClip(index = 0) {
      if (!mixer || !animations[index]) return false;
      activeAction?.stop();
      activeAction = mixer.clipAction(animations[index]);
      activeAction.reset();
      activeAction.timeScale = 1;
      activeAction.fadeIn(0.35).play();
      return true;
    },
    pause() {
      activeAction?.fadeOut(0.2);
      activeAction = null;
    },
    dispose() {
      activeAction?.stop();
      mixer?.stopAllAction();
      object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        const kill = (m: THREE.Material) => {
          const std = m as THREE.MeshStandardMaterial;
          std.map?.dispose();
          std.normalMap?.dispose();
          std.roughnessMap?.dispose();
          std.metalnessMap?.dispose();
          m.dispose();
        };
        if (Array.isArray(mat)) mat.forEach(kill);
        else if (mat) kill(mat);
      });
    },
  };
}

/** Named camera framings for the mannequin stage (target is chest height). */
export const MANNEQUIN_CAMERA_PRESETS: Record<string, [number, number, number]> = {
  front: [0, 1.05, 3.1],
  "three-quarter": [2.1, 1.15, 2.4],
  side: [3.1, 1.05, 0],
  back: [0, 1.05, -3.1],
  detail: [0.55, 1.62, 1.15],
};
