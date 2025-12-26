import { OAuthProvider, Query } from "appwrite";
import { account, database, appwriteConfig } from "./client";
import { redirect } from "react-router";

export const getExistingUser = async (accountId: string) => {
    try {
        const { documents, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", accountId)]
        );
        return total > 0 ? documents[0] : null;
    } catch {
        return null;
    }
};


export const storeUserData = async () => {
    try {
        console.log('storeUserData: called');
        const user = await account.get();
        if (!user) throw new Error("User not found");

        // const { providerAccessToken } = (await account.getSession("current")) || {};
        // // console.log("storeUserData: providerAccessToken:", providerAccessToken);

        // const profilePicture = providerAccessToken
        //     ? await getGooglePicture(providerAccessToken)
        //     : null;
        // // console.log("storeUserData: profilePicture:", profilePicture);



    } catch (error) {
        console.error("Error storing user data:", error);
    }
};

export const getGooglePicture = async (accessToken: string) => {
    try {
        const resp = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.debug("getGooglePicture: response status", resp.status);
        const body = await resp.text();
        // attempt to parse JSON for logging; fall back to raw text
        let json: any = null;
        try { json = JSON.parse(body); } catch { json = body; }
        console.debug("getGooglePicture: response body", json);

        if (!resp.ok) {
            throw new Error(`Failed to fetch Google profile picture: ${resp.status}`);
        }

        const photos = Array.isArray(json.photos) ? json.photos : json?.photos;
        return photos?.[0]?.url || null;
    } catch (error) {
        console.error("Error fetching Google picture:", error);
        return null;
    }
};

export const loginWithGoogle = async () => {
    try {
        // Detect if we're on iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (isIOS && isSafari) {
            // For iOS Safari, use a more compatible OAuth flow
            account.createOAuth2Session(
                OAuthProvider.Google,
                `${window.location.origin}/sign-in`,
                `${window.location.origin}/sign-in`,
            );
        } else {
            // For other browsers, use the standard flow
            account.createOAuth2Session(
                OAuthProvider.Google,
                `${window.location.origin}`,
                `${window.location.origin}`,
            );
        }
    } catch (error) {
        console.error("Error during OAuth2 session creation:", error);
    }
}

export const logoutUser = async () => {
    try {
        await account.deleteSession("current");
    } catch (error) {
        console.error("Error during logout:", error);
    }

};

export const getUser = async () => {
    try {
        const user = await account.get();
        // if (!user) return redirect("/sign-in");

        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal("accountId", user.$id),
                Query.select(["name", "email", "imageUrl", "joinedAt", "accountId"]),
            ]
        );

        return documents.length > 0 ? documents[0] : redirect("/sign-in");
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const getAllUsers = async (limit: number, offset: number) => {
    try {
        const { documents: users, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.limit(limit), Query.offset(offset)]
        )

        if (total === 0) return { users: [], total };

        return { users, total };
    } catch (e) {
        console.log('Error fetching users', e)
        return { users: [], total: 0 }
    }
}
