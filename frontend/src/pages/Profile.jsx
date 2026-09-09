import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { User, Lock, Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const Profile = () => {
  const { user, login } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPwd, setUpdatingPwd] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setUpdatingProfile(true);
    try {
      await api.put('/users/profile', {
        first_name: firstName,
        last_name: lastName,
        email: email,
      });
      setProfileMsg('Profile updated successfully.');
      // Reload profile from page/context if needed by re-setting auth or reloading
    } catch (err) {
      setProfileErr(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');
    if (newPassword !== confirmPassword) {
      setPwdErr('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdErr('New password must be at least 6 characters long.');
      return;
    }
    setUpdatingPwd(true);
    try {
      await api.put('/users/profile/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwdMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdErr(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setUpdatingPwd(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Account Settings</h1>
        <p className="text-harmony-muted">Manage your profile details and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="bg-harmony-card border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-harmony-primary">
              <User className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Profile Details</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileMsg && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}
            {profileErr && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{profileErr}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-harmony-muted">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary focus:border-transparent text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-harmony-muted">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-harmony-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 px-4 bg-harmony-primary hover:bg-violet-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {updatingProfile ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-harmony-card border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-harmony-secondary">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Security Settings</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {pwdMsg && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>{pwdMsg}</span>
              </div>
            )}
            {pwdErr && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{pwdErr}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary focus:border-transparent text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary focus:border-transparent text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-harmony-muted">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1B1926] border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-harmony-primary focus:border-transparent text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={updatingPwd}
              className="w-full py-2.5 px-4 bg-harmony-secondary hover:bg-pink-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {updatingPwd ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
