import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface AuthState {
    user: null | User;
    token: null | string;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            state.isAuthenticated = true; // Usually, having a token means authenticated
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;