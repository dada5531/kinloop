/**
 * Clerk stub module — used when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set.
 * Provides no-op implementations of all Clerk exports used in the app.
 * This allows the app to build and run without Clerk during development.
 */

// Client components
const noop = () => null;
const noopAsync = async () => {};
const identity = (fn) => fn;

// ClerkProvider — just renders children
function ClerkProvider({ children }) {
  return children;
}

// UI components — render nothing
const SignIn = noop;
const SignUp = noop;
const UserButton = noop;
const UserProfile = noop;
const SignedIn = ({ children }) => children;
const SignedOut = ({ children }) => children;

// Server functions
const clerkMiddleware = () => (req) => {
  const { NextResponse } = require("next/server");
  return NextResponse.next();
};
const createRouteMatcher = () => () => false;
const auth = async () => ({ userId: null, sessionId: null });
const currentUser = async () => null;

module.exports = {
  ClerkProvider,
  SignIn,
  SignUp,
  UserButton,
  UserProfile,
  SignedIn,
  SignedOut,
  clerkMiddleware,
  createRouteMatcher,
  auth,
  currentUser,
};
