import * as admin from 'firebase-admin';

// Initialize Firebase Admin recursively
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            // Since we're only validating ID tokens on the server, we technically 
            // only need the projectId. However, if using service accounts, they can 
            // be initialized here via credential: admin.credential.cert(...)
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        console.log('Firebase Admin Initialized successfully');
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}

export const adminAuth = admin.auth();
