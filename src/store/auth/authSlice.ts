import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiRequestError, readStoredAuth, storeAuth } from '../../services/apiClient';
import { authApi, LoginCredentials, RegistrationDetails } from '../../services/authApi';

interface AuthState {
  token: string | null;
  username: string | null;
  expiresAt: number | null;
  isLoggingIn: boolean;
  isRegistering: boolean;
  error: string | null;
}

const storedAuth = readStoredAuth();

const initialState: AuthState = {
  token: storedAuth?.token ?? null,
  username: storedAuth?.username ?? null,
  expiresAt: storedAuth?.expiresAt ?? null,
  isLoggingIn: false,
  isRegistering: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  { token: string; username: string; expiresAt: number },
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      const expiresAt = Date.now() + response.expiresIn * 1000;
      storeAuth({ token: response.token, username: credentials.username, expiresAt });
      return { token: response.token, username: credentials.username, expiresAt };
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        return rejectWithValue('Could not log in with the provided user credentials');
      }
      throw error;
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  (details: RegistrationDetails) => authApi.register(details)
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout() {
      return {
        token: null,
        username: null,
        expiresAt: null,
        isLoggingIn: false,
        isRegistering: false,
        error: null,
      };
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.expiresAt = action.payload.expiresAt;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.error = action.payload ?? action.error.message ?? 'Could not log in';
      })
      .addCase(registerUser.pending, (state) => {
        state.isRegistering = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isRegistering = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isRegistering = false;
        state.error = action.error.message ?? 'Could not create account';
      });
  },
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
