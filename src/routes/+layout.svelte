<style>
    :global(body),
    :global(html)
    :global(main) {
        display: block !important;
        height: auto !important;
        width: auto !important;
        position: static !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
        font-family: 'Poppins', sans-serif !important;
    }

    :global(main) {
        word-break: normal;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
    }

    :global(::-webkit-scrollbar) {
        width: 0.5rem;
        height: 0.5rem;
    }

    :global(::-webkit-scrollbar-thumb) {
        border-radius: 3px;

        background-color: #00000040;
    }

    :global(::-webkit-scrollbar-thumb:hover) {
        background-color: #00000080
    }

    :global(.center-layout) {
        width: 100vw; padding: 3rem; padding-left: 0; padding-right: 0; text-align: center;
    }
</style>
<script lang="ts">
    // Theme
    import '$lib/styles/themes/smui-dark.css';

    // Drawer
    import Drawer, { AppContent as DrawerAppContent, Content as DrawerContent, Scrim as DrawerScrim } from '@smui/drawer';
    let drawerOpen: boolean = false;

    // List
    import List, { Item as ListItem, Graphic as ListGraphic, Text as ListText } from '@smui/list';
	import { DrawerListItem } from '$lib/classes/structs/DrawerListItem';
    let drawerListItems: DrawerListItem[] = [
        new DrawerListItem('Home', '/', 'home'),
        new DrawerListItem('Catalog', '/catalog', 'list_alt'),
        new DrawerListItem('Sphere', '/sphere', 'language')
    ];
    let listActive: DrawerListItem = drawerListItems[0];
    
    // Top App Bar
    import TopAppBar, { Row as TopAppBarRow, Section as TopAppBarSection, Title as TopAppBarTitle } from '@smui/top-app-bar';
    import IconButton, { Icon } from '@smui/icon-button';
    import logo from '$lib/assets/logo.svg';

    // Sign in
    import Snackbar, { Label as SnackbarLabel, Actions as SnackbarActions, Label } from '@smui/snackbar';
    let snackbar: Snackbar;
    let snackbarMessage: string = '';

    import { onMount } from 'svelte';
	import { auth, getFirestoreDoc } from '$lib/firebase/firebase';
	import { authHandlers, authStore } from '$lib/stores/authStore';
    import { getFirestoreCollection } from "$lib/firebase/firebase";
    import { QuerySnapshot, getDocs, type DocumentData, query, where } from "firebase/firestore";
	import type { User } from 'firebase/auth';
    import { partners } from '$lib/stores/partnerStore';
    import type { Partner } from '$lib/classes/structs/Partner';
    import Button from '@smui/button';
    
    let loc = null;

    onMount(() => {
        loc = window.location;

        auth.onAuthStateChanged(
            (user: User | null) => {
                if (user != null) {
                    // User is signed in.
                    authStore.update((curr: any) => {
                        return {
                            ...curr,
                            isLoading: false,
                            currentUser: user,
                            userDoc: getFirestoreDoc('users', user.uid)
                        }
                    });

                    let partnersCollection = getFirestoreCollection('partners');
                    partners.set([]);
                    getDocs(query(partnersCollection, where("uid", "==", $authStore.currentUser.uid))).then(
                        (querySnapshot: QuerySnapshot<DocumentData, DocumentData>) => {
                            querySnapshot.forEach(
                                (doc) => {
                                    partners.update(
                                        (currentPartners) => {
                                            return [...currentPartners, doc.data() as Partner];
                                        }
                                    );
                                }
                            );
                        }
                    ).catch(
                        (error: any) => {
                            sendSnackbarMessage('Error getting workshops. Please try again later.');
                        }
                    );
                } else {
                    // No user is signed in.
                }
            }
        );
    });
    function logout(): void {
        try {
            authHandlers.logout().then(
                () => {
                    sendSnackbarMessage('Logged out successfully. Good bye!');
                    window.location.reload();
                }
            ).catch(
                (error: any) => {
                    sendSnackbarMessage('Error logging out. Please try again.');
                }
            );
        }
        catch(error: any) {
            sendSnackbarMessage('Error logging out. Please try again.')                
        }
    }
    function sendSnackbarMessage(message: string): void {
        snackbar.close();
        snackbarMessage = message;
        snackbar.forceOpen();
    }
</script>
<main>
    <Snackbar bind:this={snackbar}>
        <SnackbarLabel>{ snackbarMessage }</SnackbarLabel>
        <SnackbarActions>
            <IconButton on:click={() => snackbar.close()} class="material-symbols-outlined">close</IconButton>
        </SnackbarActions>
    </Snackbar>

    <Drawer variant="modal" bind:open={drawerOpen}>
        <DrawerContent>
            <List>
                {#each drawerListItems as item}
                    <ListItem href={item.route} on:click={() => {drawerOpen = !drawerOpen; listActive = item}} selected={listActive === item}>
                        <ListGraphic>
                            <Icon class="material-symbols-outlined">{item.icon}</Icon>
                        </ListGraphic>
                        <ListText>{item.text}</ListText>
                    </ListItem>
                {/each}
            </List>
        </DrawerContent>
    </Drawer>

    <DrawerScrim />
    <DrawerAppContent style="position: absolute; top: 0;">
        <TopAppBar variant="fixed" dense>
            <TopAppBarRow>
                <TopAppBarSection align="start">
                    <IconButton on:click={() => drawerOpen = !drawerOpen}>
                        <Icon class="material-symbols-outlined">menu</Icon>
                    </IconButton>
                    <img style="width: 12rem; margin-right: 1rem" src={logo} alt="Partner Sphere">
                    {#each drawerListItems as item}
                        <TopAppBarTitle style="font-size: 1rem;"><a style="color: #000000; text-decoration: none" href={item.route}>{item.text}</a></TopAppBarTitle>
                    {/each}
                </TopAppBarSection>
                <TopAppBarSection align="end">
                    {#if $authStore.currentUser}
                        <IconButton on:click={logout}>
                            <Icon class="material-symbols-outlined">logout</Icon>
                        </IconButton>
                    {:else}
                        <IconButton href="/login">
                            <Icon class="material-symbols-outlined">login</Icon>
                        </IconButton>
                    {/if}
                </TopAppBarSection>
            </TopAppBarRow>
        </TopAppBar>

        <div style="margin-top: 3rem">
            {#if (loc && (loc.pathname == '/' || loc.pathname == '/login' || loc.pathname == '/signup')) || $authStore.currentUser}
                <slot />
            {:else}
                <div style="padding: 2rem">
                    <h2>You must login to continue</h2>
                    <Button color="secondary" variant="raised" on:click={() => {loc.href='/login'}}>
                        <Label>Login</Label>
                    </Button>
                </div>
            {/if}
        </div>
    </DrawerAppContent>
</main>