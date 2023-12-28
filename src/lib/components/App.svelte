<script lang="ts">
    import { Canvas } from '@threlte/core';
    import Scene from './Scene.svelte';
    import { PartnerNameElem } from '$lib/classes/structs/PartnerNameElem';
    import { partnerNameElements, partners } from '$lib/stores/partnerStore';
  import { Vector3 } from 'three';

    let labelParent: HTMLDivElement;
    $: if ($partners && labelParent) {
        let pne: PartnerNameElem[] = [];
        for (let partner of $partners) {
            let elem = document.createElement('div');
            elem.classList.add('partner-name');
            elem.style.position = 'absolute';
            elem.style.top = '0';
            elem.style.left = '0';
            elem.style.fontSize = '2rem';
            elem.style.textShadow = '0 0 1rem #fff';
            elem.style.userSelect = 'none';
            elem.innerHTML = partner.name;
            labelParent.appendChild(elem);
            // random point on unit sphere
            let position: Vector3 = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
            pne.push(new PartnerNameElem(position, elem, partner));
        }
        partnerNameElements.set(pne);
    }
</script>

<div bind:this={labelParent} style="width: 100vw; height: calc(100vh - 3rem)">
    <h1 style="z-index: -1; position: absolute; left: 50%; top: 2rem; transform: translate(-50%); text-shadow: 0 0 1rem #fff; user-select: none;">Sphere of Partners</h1>
    <Canvas>
        <Scene />
    </Canvas>
</div>