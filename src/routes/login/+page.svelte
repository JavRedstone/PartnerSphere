<svelte:head>
    <title>Partner Sphere | Login</title>
</svelte:head>
<script lang="ts">
    /*
     * @author Javier Huang
    */

	import type { UserCredential } from "firebase/auth";
	import { authHandlers } from "$lib/stores/authStore";

	import { type DocumentData, setDoc, DocumentReference } from "firebase/firestore";
    import { getFirestoreDoc } from '$lib/firebase/firebase';

    import Snackbar, { Label as SnackbarLabel, Actions as SnackbarActions } from '@smui/snackbar';
    import IconButton from '@smui/icon-button';
    let snackbar: Snackbar;
    let snackbarMessage: string = '';

    let email: string = '';
    let password: string = '';

    function login(): void {
        try {
            authHandlers.login(email, password).then(
                (credential: UserCredential) => {
                    if (credential.user.emailVerified) {
                        let userDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('users', credential.user.uid);
                        setDoc(userDoc, { email: credential.user.email, uid: credential.user.uid, emailVerified: credential.user.emailVerified }).then(
                            () => {    
                                // redirect to catalog page on successful login
                                window.location.href = '/catalog';
                                sendSnackbarMessage('Logged in successfully. Welcome back!');
                            }
                        );
                    }
                    else {
                        sendSnackbarMessage('Please verify your email before logging in.');
                    }
                }
            ).catch(
                (error: any) => {
                    // catch errors from firebase auth
                    if (error.code === 'auth/invalid-email') {
                        sendSnackbarMessage('Email is invalid. Please try again.');
                    }
                    else if (error.code === 'auth/user-disabled') {
                        sendSnackbarMessage('This account has been disabled. Please try again.');
                    }
                    else if (error.code === 'auth/user-not-found') {
                        sendSnackbarMessage('This account does not exist. Please try again.');
                    }
                    else if (error.code === 'auth/wrong-password') {
                        sendSnackbarMessage('Password is incorrect. Please try again.');
                    }
                    else {
                        sendSnackbarMessage('Error logging in. Please try again.');
                    }
                }
            );
        }
        catch(error: any) {
            sendSnackbarMessage('Error logging in. Please try again.');
        }
    }

    // send a snackbar message
    function sendSnackbarMessage(message: string): void {
        snackbar.close();
        snackbarMessage = message;
        snackbar.forceOpen();
    }

    import Card, { Content as CardContent } from '@smui/card';
    import TextField from '@smui/textfield';
    import TextFieldIcon from '@smui/textfield/icon';
    import Button from '@smui/button';
</script>
<main>
    <Snackbar bind:this={snackbar}>
        <SnackbarLabel>{ snackbarMessage }</SnackbarLabel>
        <SnackbarActions>
            <IconButton on:click={() => snackbar.close()} class="material-symbols-outlined">close</IconButton>
        </SnackbarActions>
    </Snackbar>

    <div class="center-layout">
        <h1>Login to PartnerSphere</h1>
        <Card style="width: 20rem; margin-left: 50%; transform: translate(-50%)" variant="outlined">
            <CardContent style="text-align: center">
                <div>
                    <TextField style="width: 100%" type="email" label="Email" bind:value={email}>
                        <TextFieldIcon class="material-symbols-outlined" slot="leadingIcon">email</TextFieldIcon>
                    </TextField>
                </div>
                <div>
                    <TextField style="width: 100%" type="password" label="Password" bind:value={password}>
                        <TextFieldIcon class="material-symbols-outlined" slot="leadingIcon">password</TextFieldIcon>
                    </TextField>
                </div> 
                <div style="margin-top: 1rem">
                    <Button on:click={login}>Login</Button>
                </div>
            </CardContent>
        </Card>
        <p>Don't have an account? <a href="/signup">Sign up</a></p>
    </div>
</main>