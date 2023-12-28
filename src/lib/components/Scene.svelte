<script lang="ts">
  import { partnerNameElements } from '$lib/stores/partnerStore';
  import { T, useThrelte, type ThrelteContext, useTask, type Size } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { BlendFunction, BloomEffect, EffectComposer, EffectPass, GodRaysEffect, KernelSize, RenderPass } from 'postprocessing';
  import { onMount } from 'svelte';
  import { Vector3, type Camera, Mesh, MeshStandardMaterial, IcosahedronGeometry, PointLight, BoxGeometry } from 'three';

  const TC: ThrelteContext = useThrelte();
  const { scene, renderer, camera, size, autoRender, renderStage } = TC;

  let effectComposer: EffectComposer = new EffectComposer(renderer);
  setupEffectComposer();

  function setupEffectComposer(): void {
      useTask(
          (delta: number) => {
              effectComposer.render(delta);
          },
          {
              stage: renderStage,
              autoInvalidate: false
          }
      );
  }

  let sunGeometry = new IcosahedronGeometry(0.1, 3);
  let sunMaterial = new MeshStandardMaterial({ color: 'white', emissive: 'white' });
  let sunMesh = new Mesh(sunGeometry, sunMaterial);
  sunMesh.position.set(0, 0, 0);
  scene.add(sunMesh);
  const light = new PointLight( 'white', 1, 100 );
  light.position.set( 0, 0, 0 );
  scene.add( light );

  let createdPNEMeshes: boolean = false;
  function createPNEMeshes(): void {
    for (let pne of $partnerNameElements) {
      let geometry = new IcosahedronGeometry(0.1, 0);
      let material = new MeshStandardMaterial({ color: 'blue' });
      let mesh = new Mesh(geometry, material);
      mesh.position.copy(pne.position);
      scene.add(mesh);
    }
    createdPNEMeshes = true;
  }

  function updateEffects(camera: Camera): void {
      let renderPass: RenderPass = new RenderPass(scene, camera);
      // const bloomEffect: BloomEffect = new BloomEffect({
      //     blendFunction: BlendFunction.SCREEN,
      //     luminanceThreshold: 0,
      //     luminanceSmoothing: 0.25,
      //     intensity: 1,
      //     kernelSize: KernelSize.HUGE,
      // });
      // let bloomEffectPass: EffectPass = new EffectPass(camera, bloomEffect);
      // bloomEffectPass.renderToScreen = true;

      const godraysEffect: GodRaysEffect = new GodRaysEffect(camera, sunMesh, {
          blendFunction: BlendFunction.SCREEN,
          kernelSize: KernelSize.SMALL,
          density: 0.96,
          decay: 0.93,
          weight: 0.4,
          exposure: 0.55,
          samples: 60,
          clampMax: 1.0,
          resolutionScale: 1,
      });
      let godraysEffectPass: EffectPass = new EffectPass(camera, godraysEffect);
      godraysEffectPass.renderToScreen = true;

      effectComposer.removeAllPasses();
      effectComposer.setSize(window.innerWidth, window.innerHeight);
      effectComposer.addPass(renderPass);
      // effectComposer.addPass(bloomEffectPass);
      effectComposer.addPass(godraysEffectPass);
  }

  function updateComposerSize(size: Size): void {
      effectComposer.setSize(size.width, size.height);
  }
  
  function updateRenderPass(camera: Camera, size: Size): void {
      updateEffects(camera);
      updateComposerSize(size);
  }

  function updateLabels(camera: Camera) {
    let tempV = new Vector3();
    for (let pne of $partnerNameElements) {
      tempV.copy(pne.position);
      tempV.project(camera);
  
      // convert the normalized position to CSS coordinates
      const x = (tempV.x *  .5 + .5) * window.innerWidth;
      const y = (tempV.y * -.5 + .5) * window.innerHeight + 16;
  
      // move the elem to that position
      pne.element.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
  
      // set the zIndex for sorting
      pne.element.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
    }
  }

  $: if (camera && scene) updateRenderPass($camera, $size);
  $: if ($partnerNameElements.length > 0 && !createdPNEMeshes) createPNEMeshes();

  onMount(() => {
      render();
      let before: boolean = autoRender.current;
      autoRender.set(false);
      return () => {
          autoRender.set(before);
      }
  });

  function render(): void {
    if ($camera) {
        updateLabels($camera);
    }
    requestAnimationFrame(render);
  }
</script>

<T.PerspectiveCamera
  makeDefault
  position={[10, 0, 0]}
  fov={15}
>
  <OrbitControls
    autoRotate
    autoRotateSpeed={2}
  />
</T.PerspectiveCamera>

<T.Mesh
  position={[0, 0, 0]}
>
  <T.IcosahedronGeometry args={[1, 5]} />
  <T.MeshStandardMaterial color="blue" emissive="blue" wireframe />
</T.Mesh>

<T.Mesh
  position={[0, 0, 0]}
>
  <T.IcosahedronGeometry args={[0.75, 5]} />
  <T.MeshStandardMaterial color="magenta" emissive="magenta" wireframe />
</T.Mesh>