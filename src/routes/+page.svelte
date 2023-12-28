<script lang="ts">
    import Button, { Label } from "@smui/button";
    import bg from "$lib/assets/background.png";
</script>
<style>
    .partner-sphere-container {
        position: fixed;
        top: 0;
        left: 0;
        padding: 2rem;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, black, rgba(0, 0, 0, 0.75), rgba(33, 150, 243, 0.75), rgba(233, 30, 99, 0.75), rgb(233, 30, 99));
    }
    .partner-sphere-title {
        font-size: 4rem;
        color: white;
    }
    .partner-sphere-subtitle {
        font-size: 2rem;
        color: white;
        margin-top: -3rem;
    }
    .partner-sphere-description {
        font-size: 1.5rem;
        color: white;
    }
</style>

<div class="partner-sphere-container">
    <h1 class="partner-sphere-title"><b>Partner Sphere</b></h1>
    <h3 class="partner-sphere-subtitle">Community and Business Partners</h3>
    <p class="partner-sphere-description"><i>Unlocking Opportunities, Connecting Futures, Empowering Collaborations.</i></p>
    <Button href="/catalog" color="secondary" variant="raised">
        <Label>Get Started</Label>
    </Button>
</div>
<img src={bg} alt="background" style="z-index: -1; position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: cover; object-position: center;" />