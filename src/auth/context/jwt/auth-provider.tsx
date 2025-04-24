import { useMemo, useEffect, useReducer, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';

import { ASSETS_API } from 'src/config-global';

import { AuthContext } from './auth-context';
import { setSession, isValidToken } from './utils';
import { AuthUserType, ActionMapType, AuthStateType } from '../../types';

// ----------------------------------------------------------------------
/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */
// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      console.log('Initializing auth...');
      const accessToken = localStorage.getItem(STORAGE_KEY);
      console.log('Access token from storage:', accessToken);

      if (accessToken && isValidToken(accessToken)) {
        console.log('Token is valid, setting session...');
        setSession(accessToken);

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Saved user from storage:', savedUser);

        dispatch({
          type: Types.INITIAL,
          payload: {
            user: {
              accessToken,
              ...savedUser,
            },
          },
        });
      } else {
        console.log('No valid token found, dispatching null user...');
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error('Error during auth initialization:', error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    console.log('Auth provider mounted, initializing...');
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      const data = {
        email,
        password,
      };
      localStorage.removeItem('accessToken');

      const res = await axios.post(endpoints.auth.login, data);
      console.log('Login response:', res.data);

      const { access, refresh, user } = res.data;
      if (user?.type === 'admin') {
        setSession(access);
        const userData = {
          id: user?.id,
          photoURL: `${ASSETS_API}/assets/images/avatar/avatar_25.jpg`,
          displayName: user?.displayName || 'Admin',
          email: user?.email,
          type: user?.type,
          is_superuser: user?.is_superuser,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Login successful, user data saved');

        dispatch({
          type: Types.LOGIN,
          payload: {
            user: {
              ...userData,
              access,
            },
          },
        });
      } else {
        console.log('User is not an admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // REGISTER
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const data = {
        email,
        password,
        firstName,
        lastName,
      };

      const res = await axios.post(endpoints.auth.register, data);

      const { accessToken, user } = res.data;

      localStorage.setItem(STORAGE_KEY, accessToken);

      dispatch({
        type: Types.REGISTER,
        payload: {
          user: {
            ...user,
            accessToken,
          },
        },
      });
    },
    []
  );

  // LOGOUT
  const logout = useCallback(async () => {
    console.log('Logging out...');
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
    }),
    [login, logout, register, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
