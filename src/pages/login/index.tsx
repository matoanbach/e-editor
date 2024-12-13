import { AppDispatch, RootState } from '@/state/store';
import { handleAuthCallback, loginUser, logoutUser } from '@/state/user/userSlice';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from './state/store';
// import { loginUser, logoutUser, handleAuthCallback } from './state/user/userSlice';

const UserProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { name, picture, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.userSlice
  );

  useEffect(() => {
    if (window.location.search.includes('code=')) {
      dispatch(handleAuthCallback());
    }
  }, [dispatch]);

  const handleLogin = () => {
    dispatch(loginUser());
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {isAuthenticated ? (
        <div>
          <h1>Welcome, {name}</h1>
          {picture && <img src={picture} alt="Profile" />}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};

export default UserProfile;
