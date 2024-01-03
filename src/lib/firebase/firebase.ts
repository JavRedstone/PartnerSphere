/*
 * @author Javier Huang
 */

import { deleteApp, getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from 'firebase/auth';
import { collection, doc, getFirestore, type DocumentData, DocumentReference, CollectionReference } from "firebase/firestore";
import * as env from '$env/static/public';

// firebase configuration with environment variables
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
// get database
let db = getFirestore(firebaseApp);
// get collection
export function getFirestoreCollection(c: string): CollectionReference<DocumentData, DocumentData> {
    return collection(db, c);
}
// get document
export function getFirestoreDoc(c: string, d: string): DocumentReference<DocumentData, DocumentData> {
    return doc(db, c, d);
}