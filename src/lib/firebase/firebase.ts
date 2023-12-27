// Import the functions you need from the SDKs you need
import { deleteApp, getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, setPersistence, inMemoryPersistence, type Auth } from 'firebase/auth';
import { collection, doc, getFirestore, type DocumentData, DocumentReference, CollectionReference } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import * as env from '$env/static/public';

const firebaseConfig: any = {
    apiKey: env.PUBLIC_FIREBASE_API_KEY,
    authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.PUBLIC_FIREBASE_APP_ID,
    measurementId: env.PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else {
    firebaseApp = getApp();
    deleteApp(firebaseApp);
    firebaseApp = initializeApp(firebaseConfig);
}

export const auth: Auth = getAuth(firebaseApp);

let db = getFirestore(firebaseApp);
export function getFirestoreCollection(c: string): CollectionReference<DocumentData, DocumentData> {
    return collection(db, c);
}
export function getFirestoreDoc(c: string, d: string): DocumentReference<DocumentData, DocumentData> {
    return doc(db, c, d);
}