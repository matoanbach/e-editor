import { Auth0Client } from "@auth0/auth0-spa-js";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const auth0 = new Auth0Client({
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URL,
  },
});

interface UserState {
  name: string | null;
  email: string | null;
  picture: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  name: null,
  email: null,
  picture: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async Thunk for logging in
export const loginUser = createAsyncThunk(
  "user/login",
  async (_, { rejectWithValue }) => {
    try {
      const returnTo = window.location.href; // Capture the current URL
      localStorage.setItem("returnTo", returnTo); // Store it in localStorage

      await auth0.loginWithRedirect();
      const user = await auth0.getUser();
      if (!user) throw new Error("User not found");
      return {
        name: user.name || "",
        email: user.email || "",
        picture: user.picture || "",
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for handling Auth0 redirect callback
export const handleAuthCallback = createAsyncThunk(
  "user/authCallback",
  async (_, { rejectWithValue }) => {
    try {
      await auth0.handleRedirectCallback();
      const user = await auth0.getUser();
      if (!user) throw new Error("User not found");

    //   // Retrieve the stored returnTo URL and clear it
    //   const returnTo =
    //     localStorage.getItem("returnTo") || window.location.origin;
    //   localStorage.removeItem("returnTo");

    //   // Redirect the user back to the saved URL
    //   window.location.href = returnTo;

      return {
        name: user.name || "",
        email: user.email || "",
        picture: user.picture || "",
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for logging out
export const logoutUser = createAsyncThunk("user/logout", async () => {
    await auth0.logout({ logoutParams: { returnTo: window.location.origin } });
  return null; // Reset the user state
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.picture = action.payload.picture;
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading = false;
    });

    // Handle Auth Callback
    builder.addCase(handleAuthCallback.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(handleAuthCallback.fulfilled, (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.picture = action.payload.picture;
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addCase(handleAuthCallback.rejected, (state, action) => {
      state.error = action.payload as string;
      state.loading = false;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.name = null;
      state.email = null;
      state.picture = null;
      state.isAuthenticated = false;
    });
  },
});

export default userSlice.reducer;
