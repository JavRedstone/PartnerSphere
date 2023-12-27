import { writable } from "svelte/store";
import { auth } from "$lib/firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, type User, type UserCredential } from "firebase/auth";

export const authStore = writable({
    isLoading: true,
    currentUser: null,
    userDoc: null
});

export const authHandlers = {
    signup: async function (email: string, password: string): Promise<UserCredential> {
        return await createUserWithEmailAndPassword(auth, email, password);
    },
    verifyEmail: async function (user: User): Promise<void> {
        return await sendEmailVerification(user);
    },
    login: async function (email: string, password: string): Promise<UserCredential> {
        return await signInWithEmailAndPassword(auth, email, password);
    },
    logout: async function (): Promise<void> {
        return await signOut(auth);
    }
};