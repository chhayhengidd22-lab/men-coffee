import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ActivityLog, UserRole } from '../types';
import { INITIAL_USERS, INITIAL_LOGS } from '../data/mockData';
import { makeLaravelResponse } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  users: User[];
  logs: ActivityLog[];
  isAuthenticated: boolean;
  isAdminOrStaff: boolean;
  isSuperAdmin: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string }>;
  adminLogin: (identifier: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  addNewStaffMember: (data: { name: string; email: string; role: UserRole; phone: string; password?: string }) => Promise<{ success: boolean; message: string }>;
  updateUser: (userId: string, data: Partial<User>) => Promise<boolean>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  quickSwitchAccount: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'aura_cafe_users_v2';
const CURRENT_USER_KEY = 'aura_cafe_current_user_v2';
const TOKEN_KEY = 'aura_cafe_bearer_token_v2';
const LOGS_STORAGE_KEY = 'aura_cafe_activity_logs_v2';
const PASSWORDS_STORAGE_KEY = 'aura_cafe_user_passwords_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load stored users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Load passwords map
  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(PASSWORDS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      'superadmin@auracafe.com': 'admin123',
      'admin@auracafe.com': 'admin123',
      'staff@auracafe.com': 'staff123',
      'sokha@auracafe.com': 'user123',
    };
  });

  // Current user
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : INITIAL_USERS[3]; // Default to customer Sokha for immediate testing convenience
    } catch {
      return INITIAL_USERS[3];
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || 'sanctum_token_init_99812';
  });

  // Activity logs with strict unique ID validation
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) {
        const parsed: ActivityLog[] = JSON.parse(stored);
        const seenIds = new Set<string>();
        return parsed.map((item, idx) => {
          if (!item.id || seenIds.has(item.id)) {
            const uniqueId = `log-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
            seenIds.add(uniqueId);
            return { ...item, id: uniqueId };
          }
          seenIds.add(item.id);
          return item;
        });
      }
      return INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  // Persist users
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Persist passwords
  useEffect(() => {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
  }, [passwords]);

  // Persist current user
  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  // Persist logs
  useEffect(() => {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const addActivityLog = (newLog: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const logItem: ActivityLog = {
      ...newLog,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setLogs((prev) => [logItem, ...prev]);
  };

  const getClientDevice = () => {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS Safari / Mobile';
    if (ua.includes('Android')) return 'Android Chrome / Mobile';
    if (ua.includes('Macintosh')) return 'macOS / Safari & Chrome';
    if (ua.includes('Windows')) return 'Windows / Chrome';
    return 'Web Browser / Desktop';
  };

  // Flexible Login handler (Email, Name, or Phone)
  const login = async (identifier: string, password: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhoneDigits = identifier.replace(/[\s\-\+\(\)]/g, '');

    let foundUser = users.find((u) => {
      const uEmail = u.email.toLowerCase();
      const uName = u.name.toLowerCase();
      const uPhoneDigits = (u.phone || '').replace(/[\s\-\+\(\)]/g, '');

      return (
        uEmail === cleanId ||
        uName === cleanId ||
        uName.includes(cleanId) ||
        uEmail.startsWith(cleanId) ||
        (cleanId === 'admin' && (u.role === 'admin' || u.role === 'super_admin')) ||
        (cleanId === 'superadmin' && u.role === 'super_admin') ||
        (cleanId === 'super admin' && u.role === 'super_admin') ||
        (cleanId === 'manager' && (u.role === 'admin' || u.name.toLowerCase().includes('manager'))) ||
        (cleanPhoneDigits.length >= 6 && uPhoneDigits.endsWith(cleanPhoneDigits))
      );
    });

    if (!foundUser && (cleanId.includes('admin') || cleanId.includes('super'))) {
      foundUser = users.find((u) => u.role === 'super_admin' || u.role === 'admin');
    }

    if (!foundUser) {
      addActivityLog({
        userId: 'guest',
        userName: identifier,
        userEmail: cleanId.includes('@') ? cleanId : 'N/A',
        role: 'customer',
        action: 'AUTH_LOGIN_FAILED',
        actionKh: 'ការចូលគណនីបានបរាជ័យ (រកមិនឃើញគណនី)',
        details: `Failed authentication attempt for identifier: ${identifier}`,
        ipAddress: '103.216.51.' + Math.floor(Math.random() * 200 + 10),
        device: getClientDevice(),
        status: 'warning',
      });

      makeLaravelResponse(null, '/api/v1/auth/login', 'POST', 'Invalid credentials provided', 401);
      return { success: false, message: 'រកមិនឃើញគណនីដែលមានឈ្មោះ អ៊ីមែល ឬលេខទូរស័ព្ទនេះទេ។ (Account not found)' };
    }

    if (foundUser.status === 'suspended') {
      addActivityLog({
        userId: foundUser.id,
        userName: foundUser.name,
        userEmail: foundUser.email,
        role: foundUser.role,
        action: 'AUTH_SUSPENDED_BLOCKED',
        actionKh: 'គណនីត្រូវបានរារាំង (គណនីត្រូវព្យួរ)',
        details: `Blocked login attempt for suspended account: ${foundUser.email}`,
        ipAddress: '103.216.51.88',
        device: getClientDevice(),
        status: 'warning',
      });

      return {
        success: false,
        message: 'គណនីនេះត្រូវបានផ្អាកដំណើរការដោយ Admin។ សូមទាក់ទងមកកាន់ថ្នាក់ដឹកនាំ។ (Account is suspended by Admin)',
      };
    }

    const storedPass = passwords[foundUser.email.toLowerCase()] || passwords[foundUser.name.toLowerCase()] || 'admin123';
    const isPassValid = 
      password === storedPass ||
      password === 'admin123' ||
      password === 'admin' ||
      password === 'user123' ||
      password === '123456';

    if (!isPassValid) {
      addActivityLog({
        userId: foundUser.id,
        userName: foundUser.name,
        userEmail: foundUser.email,
        role: foundUser.role,
        action: 'AUTH_WRONG_PASSWORD',
        actionKh: 'ការចូលគណនីបរាជ័យ (ពាក្យសម្ងាត់មិនត្រឹមត្រូវ)',
        details: `Incorrect password entered for ${foundUser.email}`,
        ipAddress: '103.216.51.' + Math.floor(Math.random() * 200 + 10),
        device: getClientDevice(),
        status: 'warning',
      });

      makeLaravelResponse(null, '/api/v1/auth/login', 'POST', 'Incorrect password', 422);
      return { success: false, message: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។ (Default password: admin123 / user123)' };
    }

    // Success
    const newToken = 'sanctum_' + Math.random().toString(36).substring(2) + Date.now();
    const updatedUser: User = {
      ...foundUser,
      lastLoginAt: new Date().toISOString(),
    };

    setUsers((prev) => prev.map((u) => (u.id === foundUser.id ? updatedUser : u)));
    setUser(updatedUser);
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Record login activity in admin logs
    addActivityLog({
      userId: foundUser.id,
      userName: foundUser.name,
      userEmail: foundUser.email,
      role: foundUser.role,
      action: 'USER_LOGIN_SUCCESS',
      actionKh: 'ចូលប្រើប្រាស់គណនីជោគជ័យ',
      details: `User authenticated successfully via Laravel Sanctum session token (${foundUser.role}). Phone: ${foundUser.phone || 'N/A'}`,
      ipAddress: '103.216.51.88',
      device: getClientDevice(),
      status: 'success',
    });

    makeLaravelResponse(
      { user: updatedUser, token: newToken },
      '/api/v1/auth/login',
      'POST',
      'User authenticated successfully',
      200
    );

    return { success: true, message: `ចូលគណនីជោគជ័យ! សូមស្វាគមន៍ ${foundUser.name}` };
  };

  // Dedicated Admin Login Handler (Name or Email + Password)
  const adminLogin = async (identifier: string, password: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[\s\-\+\(\)]/g, '');

    // 1. Gather all authorized admin/manager users
    const adminAccounts = users.filter((u) => u.role === 'admin' || u.role === 'super_admin');

    // 2. Intelligent admin matching
    let foundUser = adminAccounts.find((u) => {
      const uEmail = u.email.toLowerCase();
      const uName = u.name.toLowerCase();
      const uPhoneDigits = (u.phone || '').replace(/[\s\-\+\(\)]/g, '');

      // Exact email or exact full name
      if (uEmail === cleanId || uName === cleanId) return true;

      // Email username part matches (e.g. "admin" matches "admin@auracafe.com")
      if (uEmail.split('@')[0] === cleanId || uEmail.startsWith(cleanId)) return true;

      // Name contains identifier or identifier contains name first word
      const firstName = uName.split(' ')[0];
      if (uName.includes(cleanId) || cleanId.includes(firstName)) return true;

      // Direct semantic aliases
      if ((cleanId === 'admin' || cleanId === 'administrator') && (u.role === 'admin' || u.role === 'super_admin')) return true;
      if ((cleanId === 'superadmin' || cleanId === 'super admin' || cleanId === 'super_admin') && u.role === 'super_admin') return true;
      if ((cleanId === 'manager' || cleanId === 'store manager') && (u.role === 'admin' || uName.includes('manager'))) return true;

      // Phone matching
      if (cleanDigits.length >= 6 && uPhoneDigits.endsWith(cleanDigits)) return true;

      return false;
    });

    // 3. Fallback: If cleanId has admin/super keywords, grab the primary admin
    if (!foundUser) {
      if (cleanId.includes('super')) {
        foundUser = adminAccounts.find((u) => u.role === 'super_admin') || adminAccounts[0];
      } else if (cleanId.includes('admin') || cleanId.includes('manage') || cleanId === 'root') {
        foundUser = adminAccounts.find((u) => u.role === 'admin') || adminAccounts[0];
      }
    }

    // 4. If still not matched, check if it was a customer who tried to access
    if (!foundUser) {
      const regularUser = users.find((u) => {
        const uEmail = u.email.toLowerCase();
        const uName = u.name.toLowerCase();
        return uEmail === cleanId || uName === cleanId || uName.includes(cleanId);
      });

      if (regularUser) {
        addActivityLog({
          userId: regularUser.id,
          userName: regularUser.name,
          userEmail: regularUser.email,
          role: regularUser.role,
          action: 'ADMIN_GATE_REJECTED_NON_ADMIN',
          actionKh: 'ការចូលច្រក Admin ត្រូវបានបដិសេធ (មិនមែនជា Admin)',
          details: `Rejected admin portal access for customer account: ${regularUser.name}`,
          ipAddress: '103.216.51.88',
          device: getClientDevice(),
          status: 'warning',
        });
        return {
          success: false,
          message: 'គណនីនេះជាអតិថិជនធម្មតា (Customer) មិនអាចចូលកាន់ Admin បានទេ។ សូមប្រើឈ្មោះ "admin" ឬ "super admin"!',
        };
      }

      addActivityLog({
        userId: 'admin-gate',
        userName: identifier,
        userEmail: cleanId,
        role: 'customer',
        action: 'ADMIN_GATE_FAILED_NOT_FOUND',
        actionKh: 'ការចូលច្រក Admin បរាជ័យ (រកមិនឃើញឈ្មោះ Admin)',
        details: `Failed admin gate attempt for identifier: ${identifier}`,
        ipAddress: '103.216.51.88',
        device: getClientDevice(),
        status: 'warning',
      });
      return { 
        success: false, 
        message: 'រកមិនឃើញឈ្មោះ Admin នេះទេ។ សូមវាយ "admin" ឬ "super admin" ឬចុចប៊ូតុងខាងក្រោម!', 
      };
    }

    if (foundUser.status === 'suspended') {
      return {
        success: false,
        message: 'គណនី Admin នេះត្រូវបានផ្អាកដំណើរការ (Account suspended)',
      };
    }

    // 5. Password verification (Supports stored password, plus standard admin passwords)
    const storedPass = passwords[foundUser.email.toLowerCase()] || passwords[foundUser.name.toLowerCase()] || 'admin123';
    const isPasswordValid = 
      password === storedPass ||
      password === 'admin123' ||
      password === 'admin' ||
      password === '123456' ||
      password === 'password';

    if (!isPasswordValid) {
      addActivityLog({
        userId: foundUser.id,
        userName: foundUser.name,
        userEmail: foundUser.email,
        role: foundUser.role,
        action: 'ADMIN_GATE_WRONG_PASSWORD',
        actionKh: 'ការចូលច្រក Admin បរាជ័យ (ពាក្យសម្ងាត់មិនត្រឹមត្រូវ)',
        details: `Incorrect password entered at admin security gate for ${foundUser.name}`,
        ipAddress: '103.216.51.88',
        device: getClientDevice(),
        status: 'warning',
      });
      return { 
        success: false, 
        message: 'ពាក្យសម្ងាត់ Admin មិនត្រឹមត្រូវទេ! (ពាក្យសម្ងាត់គំរូគឺ៖ admin123)', 
      };
    }

    // Success
    const newToken = 'sanctum_admin_' + Math.random().toString(36).substring(2) + Date.now();
    const updatedUser: User = {
      ...foundUser,
      lastLoginAt: new Date().toISOString(),
    };

    setUsers((prev) => prev.map((u) => (u.id === foundUser.id ? updatedUser : u)));
    setUser(updatedUser);
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    addActivityLog({
      userId: foundUser.id,
      userName: foundUser.name,
      userEmail: foundUser.email,
      role: foundUser.role,
      action: 'ADMIN_SECURITY_GATE_PASSED',
      actionKh: 'ការផ្ទៀងផ្ទាត់ច្រក Admin ជោគជ័យ',
      details: `Administrator authenticated successfully at security gateway. Full system access granted.`,
      ipAddress: '103.216.51.88',
      device: getClientDevice(),
      status: 'success',
    });

    return {
      success: true,
      message: `ផ្ទៀងផ្ទាត់ជោគជ័យ! សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ Admin ${foundUser.name}`,
    };
  };

  const logout = () => {
    if (user) {
      addActivityLog({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        action: 'USER_LOGOUT',
        actionKh: 'បានចាកចេញពីគណនី',
        details: `User logged out of session`,
        ipAddress: '103.216.51.88',
        device: getClientDevice(),
        status: 'info',
      });

      makeLaravelResponse(null, '/api/v1/auth/logout', 'POST', 'Session invalidated', 200);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      return { success: false, message: 'លេខទូរស័ព្ទត្រូវបានទាមទារជាចាំបាច់។ (Phone number is required)' };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email is already registered. Please login.' };
    }

    const newUser: User = {
      id: 'u-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      role: 'customer',
      phone: cleanPhone,
      loyaltyPoints: 50, // Welcome bonus points!
      status: 'active',
      ordersCount: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setPasswords((prev) => ({ ...prev, [cleanEmail]: password }));

    const newToken = 'sanctum_reg_' + Date.now();
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);

    addActivityLog({
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      role: 'customer',
      action: 'USER_REGISTERED',
      actionKh: 'បានចុះឈ្មោះគណនីថ្មី (Email + Phone)',
      details: `New customer joined with phone ${cleanPhone} and 50 complimentary loyalty points.`,
      ipAddress: '103.216.51.88',
      device: getClientDevice(),
      status: 'success',
    });

    makeLaravelResponse(
      { user: newUser, token: newToken },
      '/api/v1/auth/register',
      'POST',
      'Account created successfully',
      201
    );

    return { success: true, message: 'Account created! Welcome to AURA Roastery.' };
  };

  const changePassword = async (
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'You must be logged in to change password.' };
    }

    const currentSaved = passwords[user.email] || 'admin123';
    if (currentPass !== currentSaved) {
      addActivityLog({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        action: 'PASSWORD_CHANGE_FAILED',
        actionKh: 'ការប្តូរពាក្យសម្ងាត់បរាជ័យ (ពាក្យសម្ងាត់ចាស់ខុស)',
        details: 'User provided incorrect current password during update.',
        ipAddress: '103.216.51.88',
        device: getClientDevice(),
        status: 'warning',
      });
      return { success: false, message: 'Current password is not correct.' };
    }

    if (newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    setPasswords((prev) => ({ ...prev, [user.email]: newPass }));

    addActivityLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      action: 'PASSWORD_CHANGED',
      actionKh: 'បានប្តូរពាក្យសម្ងាត់ជោគជ័យ',
      details: 'User updated authentication password successfully.',
      ipAddress: '103.216.51.88',
      device: getClientDevice(),
      status: 'success',
    });

    makeLaravelResponse(
      { email: user.email },
      '/api/v1/auth/change-password',
      'POST',
      'Password updated successfully',
      200
    );

    return { success: true, message: 'Password updated successfully!' };
  };

  // Admin feature: Add new manager or staff member (Users cannot self-register as manager)
  const addNewStaffMember = async (data: {
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    password?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'A member with this email already exists.' };
    }

    const newStaff: User = {
      id: 'staff-' + Date.now(),
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role,
      phone: cleanPhone,
      loyaltyPoints: 0,
      status: 'active',
      ordersCount: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newStaff]);
    setPasswords((prev) => ({ ...prev, [cleanEmail]: data.password || 'staff123' }));

    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'ADMIN_CREATED_STAFF',
      actionKh: 'Admin បានបង្កើតគណនីបុគ្គលិក/Manager ថ្មី',
      details: `Admin provisioned ${newStaff.role.toUpperCase()} account: ${newStaff.name} (${newStaff.email}), Phone: ${newStaff.phone}.`,
      ipAddress: '103.216.51.88',
      device: getClientDevice(),
      status: 'success',
    });

    makeLaravelResponse(
      { staff: newStaff },
      '/api/v1/admin/users',
      'POST',
      'Manager/Staff member created successfully',
      201
    );

    return { success: true, message: `Member ${newStaff.name} added successfully as ${newStaff.role}!` };
  };

  const updateUser = async (userId: string, data: Partial<User>): Promise<boolean> => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (user?.id === userId) {
      setUser((prev) => (prev ? { ...prev, ...data } : null));
    }

    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'USER_UPDATED',
      actionKh: 'បានកែប្រែព័ត៌មានគណនីក្នុងប្រព័ន្ធ Admin',
      details: `Admin updated user ${userId}: ${Object.keys(data).join(', ')}.`,
      ipAddress: '103.216.51.88',
      device: getClientDevice(),
      status: 'info',
    });

    makeLaravelResponse(
      { userId, updatedFields: data },
      `/api/v1/admin/users/${userId}`,
      'PUT',
      'User record updated successfully',
      200
    );

    return true;
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (user?.id === userId) {
      setUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }

    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'USER_ROLE_UPDATED',
      actionKh: 'បានកែប្រែតួនាទីសមាជិក',
      details: `Updated role of user ID ${userId} to ${newRole}.`,
      ipAddress: '103.216.51.88',
      device: getClientDevice(),
      status: 'info',
    });

    makeLaravelResponse(
      { userId, newRole },
      `/api/v1/admin/users/${userId}/role`,
      'PATCH',
      'Role updated successfully',
      200
    );

    return true;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    addActivityLog({
      userId: user?.id || 'admin',
      userName: user?.name || 'Administrator',
      userEmail: user?.email || 'admin@auracafe.com',
      role: user?.role || 'admin',
      action: 'USER_DELETED',
      actionKh: 'បានលុបសមាជិកចេញពីប្រព័ន្ធ',
      details: `Deleted account: ${target?.name} (${target?.email})`,
      ipAddress: '103.216.51.88',
      device: getClientDevice(),
      status: 'warning',
    });

    makeLaravelResponse(
      { userId },
      `/api/v1/admin/users/${userId}`,
      'DELETE',
      'User removed from system',
      200
    );

    return true;
  };

  // Quick switch for tester demo convenience
  const quickSwitchAccount = (role: UserRole) => {
    const target = users.find((u) => u.role === role) || users[0];
    setUser(target);
    const fakeTok = 'token_' + target.role + '_' + Date.now();
    setToken(fakeTok);
    localStorage.setItem(TOKEN_KEY, fakeTok);

    addActivityLog({
      userId: target.id,
      userName: target.name,
      userEmail: target.email,
      role: target.role,
      action: 'DEMO_SWITCH_ACCOUNT',
      actionKh: 'ប្តូរគណនីសាកល្បង',
      details: `Switched active session to demo role [${role}]`,
      ipAddress: '103.216.51.88',
      device: getClientDevice(),
      status: 'info',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        users,
        logs,
        isAuthenticated: !!user,
        isAdminOrStaff: user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff',
        isSuperAdmin: user?.role === 'super_admin',
        login,
        adminLogin,
        logout,
        register,
        changePassword,
        addNewStaffMember,
        updateUser,
        updateUserRole,
        deleteUser,
        addActivityLog,
        quickSwitchAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
