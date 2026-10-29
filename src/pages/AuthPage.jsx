
import { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';


export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(true);
    const [name, setName] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                if (!name.trim() || !organizationName.trim()) {
                    throw new Error('Name and organization name are required.');
                }

                const credential = await createUserWithEmailAndPassword(
                    auth,
                    email.trim(),
                    password
                );
                await updateProfile(credential.user, {
                    displayName: name.trim(),
                });

                await setDoc(doc(db, 'organizations', credential.user.uid), {
                    name: organizationName.trim(),
                    ownerUid: credential.user.uid,
                    defaultLowStockThreshold: 5,
                    createdAt: serverTimestamp(),
                });

            } else {
                await signInWithEmailAndPassword(auth, email.trim(), password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>StockFlow</h1>
                <p>Manage your inventory with confidence.</p>

                <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>

                {isSignup && (
                    <>
                        <input
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            placeholder="Organization name"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            required
                        />
                    </>
                )}

                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password (minimum 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                />

                {error && <p className="error-message">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
                </button>

                <p>
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setError('');
                        }}
                    >
                        {isSignup ? 'Log in' : 'Sign up'}
                    </button>
                </p>
            </form>
        </main>
    );
}
