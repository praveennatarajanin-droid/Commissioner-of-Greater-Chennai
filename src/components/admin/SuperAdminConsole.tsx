"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Sliders,
  Lock,
  ScrollText,
  Database,
  Mail,
  Key,
  Server,
  Palette,
  Plus,
  Edit,
  Trash,
  UserCheck,
  UserMinus,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload as UploadIcon,
  RefreshCw,
  Search,
  Check,
  X,
  Phone,
  Image as ImageIcon
} from "lucide-react";

interface SuperAdminConsoleProps {
  user: { username: string; role: string };
  onTabChange: (tab: any) => void;
}

const MODULES = [
  { id: "dashboard", label: "Overview" },
  { id: "superadmin", label: "Access Management" },
  { id: "menu-management", label: "Menu Management" },
  { id: "news", label: "News Articles" },
  { id: "media", label: "Media Library" },
  { id: "ticker", label: "News Ticker" },
  { id: "slider", label: "Hero Slider" },
  { id: "videos", label: "Video & Media" },
  { id: "alerts", label: "Official Alerts" },
  { id: "police-stations", label: "Police Stations" },
  { id: "emergency-contacts", label: "Helplines Registry" },
  { id: "department-links", label: "Portal Links" },
  { id: "profile", label: "Profile" },
  { id: "theme", label: "Branding Theme" },
  { id: "settings", label: "Console Config" }
];

const PERMISSIONS = [
  { id: "view", label: "View" },
  { id: "create", label: "Create" },
  { id: "edit", label: "Edit" },
  { id: "delete", label: "Delete" },
  { id: "publish", label: "Publish" },
  { id: "upload", label: "Upload" }
];

export default function SuperAdminConsole({ user, onTabChange }: SuperAdminConsoleProps) {
  const [activeSection, setActiveSection] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // User form modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    role: "CONTENT_MANAGER",
    email: "",
    status: "active",
    mobile: "",
    profile_photo: "",
    locked: false,
    force_password_change: false,
    permissions_json: {} as Record<string, string[]>
  });

  // Custom Role Builder modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [roleForm, setRoleForm] = useState({
    role_name: "",
    permissions_json: {} as Record<string, string[]>
  });

  // Search & Filters
  const [logSearch, setLogSearch] = useState("");
  const [logModuleFilter, setLogModuleFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Load Data ──
  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/superadmin?action=users");
      if (res.ok) setUsers(await res.json());
    } catch {
      showToast("Failed to load users", "error");
    }
  };

  const loadRoles = async () => {
    try {
      const res = await fetch("/api/admin/superadmin?action=roles");
      if (res.ok) setRoles(await res.json());
    } catch {
      showToast("Failed to load roles", "error");
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/admin/superadmin?action=logs");
      if (res.ok) setLogs(await res.json());
    } catch {
      showToast("Failed to load logs", "error");
    }
  };

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/admin/superadmin?action=config");
      if (res.ok) setConfig(await res.json());
    } catch {
      showToast("Failed to load system config", "error");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadUsers(), loadRoles(), loadLogs(), loadConfig()]).finally(() => setLoading(false));
  }, []);

  // ── User Management handlers ──
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username || !userForm.email || (!editingUser && !userForm.password)) {
      return showToast("Please fill all required fields", "error");
    }

    setLoading(true);
    try {
      const method = editingUser ? "PUT" : "POST";
      const payload = editingUser ? { id: editingUser.id, ...userForm } : userForm;

      const res = await fetch("/api/admin/superadmin?action=users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editingUser ? "User updated successfully" : "User created successfully");
        setShowUserModal(false);
        setEditingUser(null);
        setUserForm({
          username: "",
          password: "",
          role: "CONTENT_MANAGER",
          email: "",
          status: "active",
          mobile: "",
          profile_photo: "",
          locked: false,
          force_password_change: false,
          permissions_json: {}
        });
        loadUsers();
        loadLogs();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save user", "error");
      }
    } catch {
      showToast("Network error saving user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, uName: string) => {
    if (uName === user.username) return showToast("You cannot delete yourself", "error");
    if (!window.confirm(`Are you sure you want to permanently delete user account "${uName}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/superadmin?action=users&id=${userId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("User deleted successfully");
        loadUsers();
        loadLogs();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to delete user", "error");
      }
    } catch {
      showToast("Network error deleting user", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Custom Roles handlers ──
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.role_name) {
      return showToast("Role name is required", "error");
    }

    setLoading(true);
    try {
      const method = editingRole ? "PUT" : "POST";
      const payload = editingRole ? { id: editingRole.id, ...roleForm } : roleForm;

      const res = await fetch("/api/admin/superadmin?action=roles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editingRole ? "Role updated successfully" : "Role created successfully");
        setShowRoleModal(false);
        setEditingRole(null);
        setRoleForm({ role_name: "", permissions_json: {} });
        loadRoles();
        loadLogs();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save role", "error");
      }
    } catch {
      showToast("Network error saving role", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: number, rName: string) => {
    if (!window.confirm(`Are you sure you want to delete custom role "${rName}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/superadmin?action=roles&id=${roleId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Role deleted successfully");
        loadRoles();
        loadLogs();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to delete role", "error");
      }
    } catch {
      showToast("Network error deleting role", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Config Management handlers ──
  const saveConfigKey = async (key: string, value: any) => {
    try {
      const res = await fetch("/api/admin/superadmin?action=config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        showToast(`Configuration updated: ${key}`);
        loadConfig();
        loadLogs();
      } else {
        showToast("Failed to save configuration", "error");
      }
    } catch {
      showToast("Network error saving configuration", "error");
    }
  };

  // ── Backup & Restore handlers ──
  const triggerBackupDownload = () => {
    window.open("/api/admin/superadmin?action=backup", "_blank");
    setTimeout(() => loadLogs(), 1500);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupJson = event.target?.result as string;
        JSON.parse(backupJson);
        
        if (!window.confirm("WARNING: Restoring will overwrite all existing database tables with the backup data. Proceed?")) return;

        setLoading(true);
        const res = await fetch("/api/admin/superadmin?action=restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backupJson })
        });

        if (res.ok) {
          showToast("Database restored successfully!");
          loadUsers();
          loadRoles();
          loadLogs();
          loadConfig();
        } else {
          showToast("Failed to restore backup", "error");
        }
      } catch {
        showToast("Invalid JSON file uploaded", "error");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const sections = [
    { id: "users", label: "User Management", icon: <Users className="w-4 h-4" /> },
    { id: "roles", label: "Role Builder", icon: <Shield className="w-4 h-4" /> },
    { id: "sysconfig", label: "System Configuration", icon: <Sliders className="w-4 h-4" /> },
    { id: "security", label: "Security Settings", icon: <Lock className="w-4 h-4" /> },
    { id: "logs", label: "Audit Logs", icon: <ScrollText className="w-4 h-4" /> },
    { id: "backup", label: "Backup & Restore", icon: <Database className="w-4 h-4" /> },
    { id: "smtp", label: "SMTP Configuration", icon: <Mail className="w-4 h-4" /> },
    { id: "apikeys", label: "API Keys", icon: <Key className="w-4 h-4" /> },
    { id: "env", label: "Environment Variables", icon: <Server className="w-4 h-4" /> },
    { id: "branding", label: "Console Configuration", icon: <Palette className="w-4 h-4" /> }
  ];

  return (
    <div className="flex-grow flex flex-col lg:flex-row bg-[#f8fafc] dark:bg-stone-955 min-h-[550px] rounded-2xl border border-slate-200 dark:border-stone-850 overflow-hidden shadow-sm text-left">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-250 text-emerald-800" : "bg-rose-50 border-rose-250 text-rose-800"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-xs font-black uppercase tracking-wider">{toast.text}</span>
        </div>
      )}

      {/* Sidebar Links */}
      <div className="w-full lg:w-64 bg-white dark:bg-stone-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-stone-850 flex flex-col shrink-0">
        <div className="p-4 bg-slate-50 dark:bg-stone-955 border-b border-slate-200 dark:border-stone-850 shrink-0">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#1e40af]" />
            <span>Access Management Module</span>
          </span>
        </div>
        <div className="p-2 space-y-0.5 overflow-y-auto max-h-[250px] lg:max-h-none">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeSection === sec.id
                  ? "bg-[#1e40af]/10 text-[#1e40af] dark:bg-brand-gold/10 dark:text-brand-gold"
                  : "text-slate-600 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-800"
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-grow p-6 overflow-y-auto bg-white dark:bg-stone-900 min-h-[480px]">
        {loading && (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-xs uppercase font-black tracking-wider">Syncing dashboard data...</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            
            {/* 1. USER MANAGEMENT SECTION */}
            {activeSection === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-stone-800">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">User Management</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Create, edit, reset, lock, or delete user credentials and permissions.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({
                        username: "",
                        password: "",
                        role: "CONTENT_MANAGER",
                        email: "",
                        status: "active",
                        mobile: "",
                        profile_photo: "",
                        locked: false,
                        force_password_change: false,
                        permissions_json: {}
                      });
                      setShowUserModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create User
                  </button>
                </div>

                <div className="relative w-full max-w-sm mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-200 dark:border-stone-800 rounded-xl text-xs outline-none focus:border-[#1e40af] bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                  />
                </div>

                <div className="border border-slate-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-stone-950">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-stone-900 border-b border-slate-200 dark:border-stone-800 text-[10px] font-black uppercase text-slate-500 dark:text-stone-400 tracking-wider">
                        <th className="p-3">User</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Mobile</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Last Login</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-stone-800 font-bold text-slate-700 dark:text-stone-300">
                      {users
                        .filter((u) => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-stone-900/50">
                            <td className="p-3 flex items-center gap-2">
                              {u.profile_photo ? (
                                <img src={u.profile_photo} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-stone-800 flex items-center justify-center text-[10px] font-black uppercase text-slate-550">
                                  {u.username.slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <p className="text-slate-800 dark:text-white font-black">{u.username}</p>
                                <span className="text-[10px] text-slate-400 font-normal">{u.email}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-[#1e40af]/10 text-[#1e40af] dark:bg-brand-gold/10 dark:text-brand-gold rounded text-[8px] font-black uppercase tracking-wider">
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-normal text-[10px] text-slate-500">{u.mobile || "—"}</td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1.5">
                                <span className={`w-max px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                  u.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                                }`}>
                                  {u.status}
                                </span>
                                {u.locked === 1 && (
                                  <span className="w-max px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> Locked
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-normal text-slate-400 text-[10px]">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}</td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingUser(u);
                                    let parsedPerms = {};
                                    if (u.permissions_json) {
                                      try { parsedPerms = JSON.parse(u.permissions_json); } catch {}
                                    }
                                    setUserForm({
                                      username: u.username,
                                      password: "",
                                      role: u.role,
                                      email: u.email || "",
                                      status: u.status,
                                      mobile: u.mobile || "",
                                      profile_photo: u.profile_photo || "",
                                      locked: u.locked === 1,
                                      force_password_change: u.force_password_change === 1,
                                      permissions_json: parsedPerms
                                    });
                                    setShowUserModal(true);
                                  }}
                                  className="p-1.5 text-slate-450 hover:text-brand-blue dark:hover:text-brand-gold hover:bg-slate-50 dark:hover:bg-stone-900 rounded-lg cursor-pointer"
                                  title="Edit User details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {u.username !== user.username && u.id !== 1 && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                    className="p-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-stone-900 rounded-lg cursor-pointer"
                                    title="Delete User account"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. ROLE BUILDER SECTION */}
            {activeSection === "roles" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-stone-800">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Custom Role Builder</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Build custom role models with modular matrix checkboxes for governace permissions.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingRole(null);
                      setRoleForm({ role_name: "", permissions_json: {} });
                      setShowRoleModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Custom Role
                  </button>
                </div>

                {/* Default Roles Grid */}
                <div className="bg-slate-50 dark:bg-stone-950 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Built-in Roles Permissions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {["Super Admin", "Administrator", "Content Manager", "News Editor", "Station Manager", "Media Manager", "Viewer"].map((r) => (
                      <div key={r} className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-3 rounded-lg flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{r}</p>
                          <span className="text-[9px] text-slate-400 font-bold block pt-1">Default Template</span>
                        </div>
                        <span className="text-[8px] uppercase tracking-wider text-brand-gold pt-2 font-black">Pre-configured</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Roles Table */}
                <div className="border border-slate-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-stone-950">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-stone-900 border-b border-slate-200 dark:border-stone-800 text-[10px] font-black uppercase text-slate-500 dark:text-stone-400 tracking-wider">
                        <th className="p-3">Role Identifier</th>
                        <th className="p-3">Custom Perms Config</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-stone-800 font-bold text-slate-700 dark:text-stone-300">
                      {roles.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-slate-400">No custom roles built yet. Create one above!</td>
                        </tr>
                      ) : (
                        roles.map((r) => {
                          let permCount = 0;
                          if (r.permissions_json) {
                            try {
                              const pObj = JSON.parse(r.permissions_json);
                              Object.values(pObj).forEach((v: any) => { permCount += v.length; });
                            } catch {}
                          }
                          return (
                            <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-stone-900/50">
                              <td className="p-3 text-slate-800 dark:text-white font-black">{r.role_name}</td>
                              <td className="p-3 font-normal text-slate-500">{permCount} active permission flags</td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingRole(r);
                                      let parsedPerms = {};
                                      try { parsedPerms = JSON.parse(r.permissions_json); } catch {}
                                      setRoleForm({
                                        role_name: r.role_name,
                                        permissions_json: parsedPerms
                                      });
                                      setShowRoleModal(true);
                                    }}
                                    className="p-1.5 text-slate-450 hover:text-brand-blue hover:bg-slate-50 rounded-lg cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRole(r.id, r.role_name)}
                                    className="p-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. SYSTEM CONFIGURATION */}
            {activeSection === "sysconfig" && (
              <div className="space-y-4">
                <div className="border-b pb-3 border-slate-100 dark:border-stone-800">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">System Configuration</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle live speech synthesis engine, RSS news tickers, and media updates status.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 dark:border-stone-850 bg-slate-50/20 dark:bg-stone-900 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white border-b pb-2">Speech Synthesizer Config</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-700 dark:text-stone-300">Live Speech Broadcast</p>
                          <span className="text-[9px] text-slate-400 block font-normal">Enable text-to-speech for alerts.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!config.speechEnabled}
                          onChange={(e) => saveConfigKey("speechEnabled", e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-700 dark:text-stone-300">Autoplay Speech</p>
                          <span className="text-[9px] text-slate-400 block font-normal">Play audio automatically on page load.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!config.autoplaySpeech}
                          onChange={(e) => saveConfigKey("autoplaySpeech", e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-stone-850 bg-slate-50/20 dark:bg-stone-900 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white border-b pb-2">Media & Alerts Feeds</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-700 dark:text-stone-300">Live CCTV Feeds</p>
                          <span className="text-[9px] text-slate-400 block font-normal">Display active traffic surveillance cameras on portal.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!config.liveCctv}
                          onChange={(e) => saveConfigKey("liveCctv", e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-700 dark:text-stone-300">Breaking News Flash</p>
                          <span className="text-[9px] text-slate-400 block font-normal">Enable top-level red breaking news banners.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!config.breakingNewsBanner}
                          onChange={(e) => saveConfigKey("breakingNewsBanner", e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SECURITY SETTINGS */}
            {activeSection === "security" && (
              <div className="space-y-4">
                <div className="border-b pb-3 border-slate-100 dark:border-stone-800">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Security Settings</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manage session timeout, password decay limits, and failed login parameters.</p>
                </div>
                <div className="border border-slate-200 dark:border-stone-850 p-5 rounded-2xl bg-white dark:bg-stone-950 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white">Enterprise Security Policy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Failed Logins Limit</label>
                      <select
                        value={config.failedLoginLimit || "5"}
                        onChange={(e) => saveConfigKey("failedLoginLimit", e.target.value)}
                        className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2 outline-none bg-white dark:bg-stone-900 dark:text-white"
                      >
                        <option value="3">3 Attempts</option>
                        <option value="5">5 Attempts (Recommended)</option>
                        <option value="10">10 Attempts</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Password Lifetime</label>
                      <select
                        value={config.passwordExpiryDays || "90"}
                        onChange={(e) => saveConfigKey("passwordExpiryDays", e.target.value)}
                        className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2 outline-none bg-white dark:bg-stone-900 dark:text-white"
                      >
                        <option value="30">30 Days</option>
                        <option value="90">90 Days (Standard)</option>
                        <option value="180">180 Days</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Inactivity Timeout</label>
                      <select
                        value={config.sessionTimeoutMinutes || "30"}
                        onChange={(e) => saveConfigKey("sessionTimeoutMinutes", e.target.value)}
                        className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2 outline-none bg-white dark:bg-stone-900 dark:text-white"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="60">60 Minutes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. AUDIT LOGS */}
            {activeSection === "logs" && (
              <div className="space-y-4">
                <div className="border-b pb-3 border-slate-100 dark:border-stone-800">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Audit Logs</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Trace login sessions, page edits, role switches, and console deletions.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search audit actions or users..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 border border-slate-200 dark:border-stone-800 rounded-xl text-xs outline-none bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                    />
                  </div>

                  <select
                    value={logModuleFilter}
                    onChange={(e) => setLogModuleFilter(e.target.value)}
                    className="border border-slate-200 dark:border-stone-800 p-1.5 rounded-xl text-xs outline-none bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                  >
                    <option value="all">All Modules</option>
                    <option value="Auth">Authentication</option>
                    <option value="UserManagement">User Management</option>
                    <option value="RoleManagement">Role Management</option>
                    <option value="SystemConfig">System Config</option>
                    <option value="Backup">Backup</option>
                  </select>
                </div>

                <div className="border border-slate-200 dark:border-stone-850 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-stone-950">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-stone-900 border-b border-slate-200 dark:border-stone-800 text-[10px] font-black uppercase text-slate-500 dark:text-stone-400 tracking-wider">
                        <th className="p-3">User & IP</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Action Description</th>
                        <th className="p-3">Agent</th>
                        <th className="p-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-stone-800 font-bold text-slate-700 dark:text-stone-300">
                      {logs
                        .filter((l) => {
                          const matchQuery = l.username?.toLowerCase().includes(logSearch.toLowerCase()) || l.action?.toLowerCase().includes(logSearch.toLowerCase());
                          const matchModule = logModuleFilter === "all" || l.module === logModuleFilter;
                          return matchQuery && matchModule;
                        })
                        .map((l) => (
                          <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-stone-900/50">
                            <td className="p-3">
                              <p className="text-slate-800 dark:text-white font-black">{l.username}</p>
                              <span className="text-[9px] text-slate-400 font-mono font-normal block">{l.ip_address}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-stone-800 text-slate-600 dark:text-stone-300 rounded text-[8px] font-black uppercase">
                                {l.module || "General"}
                              </span>
                            </td>
                            <td className="p-3 text-xs font-semibold text-slate-600 dark:text-stone-400 max-w-sm break-words leading-relaxed">
                              {l.action}
                              {(l.before_val || l.after_val) && (
                                <div className="mt-1 text-[9px] bg-slate-50 dark:bg-stone-900 p-1.5 rounded font-mono font-normal text-slate-400 max-h-24 overflow-y-auto">
                                  {l.before_val && <p><b>Before:</b> {l.before_val}</p>}
                                  {l.after_val && <p><b>After:</b> {l.after_val}</p>}
                                </div>
                              )}
                            </td>
                            <td className="p-3 font-normal text-slate-400 text-[10px] max-w-[120px] truncate" title={l.browser}>{l.browser || "Unknown"}</td>
                            <td className="p-3 font-normal text-slate-400 text-[10px] whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. BACKUP & RESTORE */}
            {activeSection === "backup" && (
              <div className="space-y-4">
                <div className="border-b pb-3 border-slate-100 dark:border-stone-800">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Database Backup & Restores</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Download full JSON snapshot backups of all Chennai Guardian tables or upload backups.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 dark:border-stone-850 p-5 rounded-2xl bg-slate-50/25 dark:bg-stone-900 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white border-b pb-2">Download Backup Snapshot</h4>
                      <p className="text-xs text-slate-550 dark:text-stone-400 leading-relaxed font-normal pt-2">
                        Download a complete, offline JSON snapshot of the local database tables including users, news, activity logs, and page layouts.
                      </p>
                    </div>
                    <button
                      onClick={triggerBackupDownload}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Backup (JSON)
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-stone-850 p-5 rounded-2xl bg-slate-50/25 dark:bg-stone-900 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white border-b pb-2">Restore Backup Snapshot</h4>
                      <p className="text-xs text-rose-650 dark:text-rose-450 leading-relaxed font-semibold pt-2">
                        CAUTION: Uploading and restoring a backup JSON file will drop and overwrite all current database tables. Ensure correct file format before committing.
                      </p>
                    </div>
                    <label className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-center">
                      <UploadIcon className="w-4 h-4" /> Upload & Restore Backup
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleRestoreBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 7. SMTP CONFIGURATION */}
            {activeSection === "smtp" && (
              <div className="space-y-4">
                <div className="border-b pb-3 border-slate-100 dark:border-stone-800">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">SMTP Configuration</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Configure outbound mail server settings for system alerts and newsletters.</p>
                </div>
                <div className="border border-slate-200 dark:border-stone-850 p-5 rounded-2xl bg-white dark:bg-stone-950 font-bold text-xs text-slate-600 dark:text-stone-400 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white border-b pb-2">Mail Server Connection Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">SMTP Host Address</label>
                      <input
                        type="text"
                        placeholder="smtp.mailtrap.io"
                        value={config.smtpHost || ""}
                        onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                        className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2.5 outline-none bg-white dark:bg-stone-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">SMTP Connection Port</label>
                      <input
                        type="text"
                        placeholder="587"
                        value={config.smtpPort || ""}
                        onChange={(e) => setConfig({ ...config, smtpPort: e.target.value })}
                        className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2.5 outline-none bg-white dark:bg-stone-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">SMTP Username</label>
                      <input
                        type="text"
                        placeholder="mail-user-key"
                        value={config.smtpUser || ""}
                        onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                        className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2.5 outline-none bg-white dark:bg-stone-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">SMTP Server Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={config.smtpPass || ""}
                        onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                        className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2.5 outline-none bg-white dark:bg-stone-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      saveConfigKey("smtpHost", config.smtpHost);
                      saveConfigKey("smtpPort", config.smtpPort);
                      saveConfigKey("smtpUser", config.smtpUser);
                      saveConfigKey("smtpPass", config.smtpPass);
                    }}
                    className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Save SMTP settings
                  </button>
                </div>
              </div>
            )}

            {/* 8. API KEYS */}
            {activeSection === "apikeys" && (
              <div className="space-y-4">
                <div className="border-b pb-3 border-slate-100 dark:border-stone-800">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">API Keys</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manage external credentials and keys for Spech synthesis and translation APIs.</p>
                </div>
                <div className="border border-slate-200 dark:border-stone-850 p-5 rounded-2xl bg-white dark:bg-stone-950 font-bold text-xs text-slate-600 dark:text-stone-400 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400">Google Cloud Translation API Key</label>
                    <input
                      type="password"
                      placeholder="AIzaSyA..."
                      value={config.gcpTranslateKey || ""}
                      onChange={(e) => setConfig({ ...config, gcpTranslateKey: e.target.value })}
                      className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2.5 outline-none bg-white dark:bg-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400">Google Cloud TTS Voice Key</label>
                    <input
                      type="password"
                      placeholder="AIzaSyB..."
                      value={config.gcpTtsKey || ""}
                      onChange={(e) => setConfig({ ...config, gcpTtsKey: e.target.value })}
                      className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2.5 outline-none bg-white dark:bg-stone-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      saveConfigKey("gcpTranslateKey", config.gcpTranslateKey);
                      saveConfigKey("gcpTtsKey", config.gcpTtsKey);
                    }}
                    className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Save API Integration Keys
                  </button>
                </div>
              </div>
            )}

            {/* 9. ENVIRONMENT VARIABLES */}
            {activeSection === "env" && (
              <div className="space-y-4">
                <div className="border-b pb-3 border-slate-100 dark:border-stone-800">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Environment Variables</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Review active Node.js system environment configurations.</p>
                </div>
                <div className="border border-slate-200 dark:border-stone-850 p-5 rounded-2xl bg-white dark:bg-stone-950 font-mono text-[10px] text-slate-600 dark:text-stone-400 space-y-2 max-h-96 overflow-y-auto">
                  <p><b>NODE_ENV:</b> {process.env.NODE_ENV}</p>
                  <p><b>NEXT_PUBLIC_APP_URL:</b> {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}</p>
                  <p><b>DB_HOST:</b> 127.0.0.1</p>
                  <p><b>DB_NAME:</b> chennai_guardian</p>
                  <p><b>PORT:</b> 3306</p>
                </div>
              </div>
            )}

            {/* 10. CONSOLE CONFIGURATION */}
            {activeSection === "branding" && (
              <div className="space-y-4">
                <div className="border-b pb-3 border-slate-100 dark:border-stone-800">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">Console Configuration</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Adjust theme configurations, branding headers, and logo presets.</p>
                </div>
                <div className="border border-slate-200 dark:border-stone-850 p-5 rounded-2xl bg-white dark:bg-stone-950 font-bold text-xs text-slate-600 dark:text-stone-400 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Portal Display Name (English)</label>
                      <input
                        type="text"
                        value={config.portalTitleEn || "Greater Chennai Police"}
                        onChange={(e) => setConfig({ ...config, portalTitleEn: e.target.value })}
                        className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2.5 outline-none bg-white dark:bg-stone-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Portal Display Name (Tamil)</label>
                      <input
                        type="text"
                        value={config.portalTitleTa || "பெருநகர சென்னை காவல்"}
                        onChange={(e) => setConfig({ ...config, portalTitleTa: e.target.value })}
                        className="w-full border border-slate-200 dark:border-stone-800 rounded-xl p-2.5 outline-none bg-white dark:bg-stone-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      saveConfigKey("portalTitleEn", config.portalTitleEn);
                      saveConfigKey("portalTitleTa", config.portalTitleTa);
                    }}
                    className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Save Branding Titles
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── USER FORM MODAL ── */}
      {showUserModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-stone-800 flex justify-between items-center bg-slate-50 dark:bg-stone-955 shrink-0">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">
                {editingUser ? `Edit User: ${editingUser.username}` : "Create Console User"}
              </h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-5 space-y-4 font-bold text-slate-600 dark:text-stone-300 text-xs overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Username *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full border border-slate-200 dark:border-stone-850 rounded-xl p-2.5 outline-none focus:border-[#1e40af] bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    {editingUser ? "New Password (Leave blank to keep current)" : "Password *"}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full border border-slate-200 dark:border-stone-850 rounded-xl p-2.5 outline-none focus:border-[#1e40af] bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full border border-slate-200 dark:border-stone-850 rounded-xl p-2.5 outline-none focus:border-[#1e40af] bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Mobile Number</label>
                  <input
                    type="text"
                    value={userForm.mobile}
                    onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                    className="w-full border border-slate-200 dark:border-stone-850 rounded-xl p-2.5 outline-none focus:border-[#1e40af] bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Profile Photo (Data URL or path)</label>
                <input
                  type="text"
                  placeholder="https://... or data:image/png;base64,..."
                  value={userForm.profile_photo}
                  onChange={(e) => setUserForm({ ...userForm, profile_photo: e.target.value })}
                  className="w-full border border-slate-200 dark:border-stone-850 rounded-xl p-2.5 outline-none focus:border-[#1e40af] bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full border border-slate-200 dark:border-stone-850 rounded-xl p-2.5 outline-none focus:border-[#1e40af] bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                    <option value="CONTENT_MANAGER">Content Manager</option>
                    <option value="NEWS_EDITOR">News Editor</option>
                    <option value="STATION_MANAGER">Station Manager</option>
                    <option value="MEDIA_MANAGER">Media Manager</option>
                    <option value="VIEWER">Viewer</option>
                    {roles.map((cr) => (
                      <option key={cr.id} value={cr.role_name}>{cr.role_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Status *</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full border border-slate-200 dark:border-stone-850 rounded-xl p-2.5 outline-none focus:border-[#1e40af] bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div className="flex flex-col justify-center gap-1.5 pt-4">
                  <label className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-stone-400">
                    <input
                      type="checkbox"
                      checked={userForm.locked}
                      onChange={(e) => setUserForm({ ...userForm, locked: e.target.checked })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span>Locked Out</span>
                  </label>
                  <label className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-stone-400">
                    <input
                      type="checkbox"
                      checked={userForm.force_password_change}
                      onChange={(e) => setUserForm({ ...userForm, force_password_change: e.target.checked })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span>Force Password Change</span>
                  </label>
                </div>
              </div>

              {/* Granular Matrix Override for User */}
              <div className="border border-slate-200 dark:border-stone-800 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Permission Matrix (Override)</h4>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full border-collapse text-[10px] font-bold text-slate-500 dark:text-stone-400">
                    <thead>
                      <tr className="border-b dark:border-stone-800 text-left bg-slate-50 dark:bg-stone-900">
                        <th className="p-1.5">Module</th>
                        {PERMISSIONS.map((p) => <th key={p.id} className="p-1.5 text-center">{p.label}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-stone-850">
                      {MODULES.map((m) => {
                        const mPerms = userForm.permissions_json[m.id] || [];
                        return (
                          <tr key={m.id}>
                            <td className="p-1.5 text-slate-800 dark:text-white font-black">{m.label}</td>
                            {PERMISSIONS.map((p) => {
                              const checked = mPerms.includes(p.id);
                              return (
                                <td key={p.id} className="p-1.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const updatedPerms = { ...userForm.permissions_json };
                                      if (e.target.checked) {
                                        updatedPerms[m.id] = [...(updatedPerms[m.id] || []), p.id];
                                      } else {
                                        updatedPerms[m.id] = (updatedPerms[m.id] || []).filter((x) => x !== p.id);
                                      }
                                      setUserForm({ ...userForm, permissions_json: updatedPerms });
                                    }}
                                    className="w-3.5 h-3.5 cursor-pointer mx-auto"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-stone-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 dark:text-stone-300 rounded-xl uppercase font-black text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e40af] text-white rounded-xl uppercase font-black text-[10px]"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CUSTOM ROLE BUILDER MODAL ── */}
      {showRoleModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-stone-800 flex justify-between items-center bg-slate-50 dark:bg-stone-955 shrink-0">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">
                {editingRole ? `Edit Role: ${editingRole.role_name}` : "Create Custom Role"}
              </h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveRole} className="p-5 space-y-4 font-bold text-slate-600 dark:text-stone-300 text-xs overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Role Identifier / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRAFFIC_EDITOR"
                  value={roleForm.role_name}
                  onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value.toUpperCase().replace(" ", "_") })}
                  className="w-full border border-slate-200 dark:border-stone-850 rounded-xl p-2.5 outline-none focus:border-[#1e40af] bg-white dark:bg-stone-950 text-stone-900 dark:text-white"
                />
              </div>

              {/* Permission Checklist Matrix */}
              <div className="border border-slate-200 dark:border-stone-800 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Permission matrix Config</h4>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full border-collapse text-[10px] font-bold text-slate-500 dark:text-stone-400">
                    <thead>
                      <tr className="border-b dark:border-stone-800 text-left bg-slate-50 dark:bg-stone-900">
                        <th className="p-1.5">Module</th>
                        {PERMISSIONS.map((p) => <th key={p.id} className="p-1.5 text-center">{p.label}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-stone-855">
                      {MODULES.map((m) => {
                        const mPerms = roleForm.permissions_json[m.id] || [];
                        return (
                          <tr key={m.id}>
                            <td className="p-1.5 text-slate-800 dark:text-white font-black">{m.label}</td>
                            {PERMISSIONS.map((p) => {
                              const checked = mPerms.includes(p.id);
                              return (
                                <td key={p.id} className="p-1.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const updatedPerms = { ...roleForm.permissions_json };
                                      if (e.target.checked) {
                                        updatedPerms[m.id] = [...(updatedPerms[m.id] || []), p.id];
                                      } else {
                                        updatedPerms[m.id] = (updatedPerms[m.id] || []).filter((x) => x !== p.id);
                                      }
                                      setRoleForm({ ...roleForm, permissions_json: updatedPerms });
                                    }}
                                    className="w-3.5 h-3.5 cursor-pointer mx-auto"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-stone-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 dark:text-stone-300 rounded-xl uppercase font-black text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e40af] text-white rounded-xl uppercase font-black text-[10px]"
                >
                  Save Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
