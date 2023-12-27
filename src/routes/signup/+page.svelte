<svelte:head>
    <title>Partner Sphere | Sign Up</title>
</svelte:head>
<script lang="ts">
	import type { UserCredential } from "firebase/auth";
	import { authHandlers } from "$lib/stores/authStore";

    import Snackbar, { Label as SnackbarLabel, Actions as SnackbarActions } from '@smui/snackbar';
    import IconButton from '@smui/icon-button';
    let snackbar: Snackbar;
    let snackbarMessage: string = '';

    let email: string = '';
    let password: string = '';

	import { DocumentReference, setDoc } from "firebase/firestore";
    import type { DocumentData } from "firebase/firestore";
	import { getFirestoreDoc } from "$lib/firebase/firebase";
    function signup(): void {
        try {
            authHandlers.signup(email, password).then(
                (credential: UserCredential) => {
                    let userDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('users', credential.user.uid);
                    setDoc(userDoc, { email: credential.user.email, uid: credential.user.uid, emailVerified: credential.user.emailVerified }).then(
                        () => {
                            authHandlers.verifyEmail(credential.user).then(
                                () => {
                                    window.location.href = '/login';
                                    sendSnackbarMessage('Signed up successfully. Please check your email for a verification link.')
                                }
                            ).catch(
                                (error: any) => {
                                    sendSnackbarMessage('Error sending email verification. Please try again.');
                                }
                            );
                        }
                    );
                }
            ).catch(
                (error: any) => {
                    if (error.code === 'auth/email-already-in-use') {
                        sendSnackbarMessage('This email is already in use. Please try again.');
                    }
                    else if (error.code === 'auth/invalid-email') {
                        sendSnackbarMessage('Email is invalid. Please try again.');
                    }
                    else if (error.code === 'auth/operation-not-allowed') {
                        sendSnackbarMessage('Email/password accounts are not enabled. Please try again.');
                    }
                    else if (error.code === 'auth/weak-password') {
                        sendSnackbarMessage('Password is too weak. Please try again.');
                    }
                    else {
                        sendSnackbarMessage('Error signing up. Please try again.');
                    }
                }
            )
        }
        catch (error: any) {
            sendSnackbarMessage('Error signing up. Please try again.');
        }
    }
    function sendSnackbarMessage(message: string): void {
        snackbarMessage = message;
        snackbar.open();
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
        <h1>Sign Up to PartnerSphere</h1>
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
                    <Button on:click={signup}>Sign up</Button>
                </div>
            </CardContent>
        </Card>
        <p>Already have an account? <a href="/login">Login</a></p>
    </div>
</main>