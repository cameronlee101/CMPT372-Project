"use server";

import { CredentialResponse } from "@react-oauth/google";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createNewUser, getUserType } from "@/api/user";
import { UserTypes } from "@/api/user.types";

if (!process.env.SECRET_KEY) {
  throw Error("env variable not set: SECRET_KEY");
}

const secretKey = process.env.SECRET_KEY;
const key = new TextEncoder().encode(secretKey);

const cookieLength = 1000 * 60 * 60 * 3; // 3 hours

export type GoogleCredentials = {
  email: string;
  picture: string;
};

// encrypts the payload using the key
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 hour from now")
    .sign(key);
}

// decrypts the input using the key
export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

// Returns the session cookie of the current user if there is one
export async function getSession(): Promise<any | null> {
  try {
    const session = cookies().get("session")?.value;
    if (!session) return null;
    return await decrypt(session);
  } catch (error) {
    console.error("Error occurred when retrieving session: " + error);
  }
}

// Gets all of the user data of the logged in user
export async function getSessionUserData(): Promise<GoogleCredentials | null> {
  const session = await getSession();
  if (session) {
    const userData = <GoogleCredentials>jwt.decode(session.googleJWT);
    return userData;
  } else {
    console.error("Could not retrieve user session");
    return null;
  }
}

// Gets the user type of the logged in user
export async function getSessionUserType(): Promise<UserTypes | null> {
  const session = await getSession();
  if (session) {
    return session.userType;
  } else {
    console.error("Could not retrieve user type");
    return null;
  }
}

// Gets all of the user email of the logged in user
export async function getSessionUserEmail(): Promise<string | null> {
  const session = await getSession();
  if (session) {
    const user_email = (<GoogleCredentials>jwt.decode(session.googleJWT)).email;
    return user_email;
  } else {
    console.error("Could not retrieve user email");
    return null;
  }
}

// Given the google response, creates a new session for the user if they exist in the database already
// If they don't exist, creates a new account for them as a customer
export async function login(
  credentialResponse: CredentialResponse,
  user_type: UserTypes,
): Promise<void> {
  const googleJWT = credentialResponse.credential;
  if (googleJWT) {
    const user_email = (<GoogleCredentials>jwt.decode(googleJWT)).email;

    if (user_email) {
      // Create the session
      const expires = new Date(Date.now() + cookieLength);
      const session = await encrypt({
        googleJWT,
        userType: user_type,
        expires,
      });

      // Save the session in a cookie
      cookies().set("session", session, { expires, httpOnly: true });

      return;
    }
  }
  throw Error("Error occurred while logging in");
}

// Logs the current user out
export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
}

// Refreshes the current session, effectively resetting the expiry time
export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + cookieLength);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
