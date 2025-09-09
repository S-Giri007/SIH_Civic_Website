import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building,
  Badge,
  Calendar,
  MoreVertical,
  UserPlus
} from 'lucide-react';

interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: 'officer' | 'citizen';
  isActive: boolean;
  isVerified?: boolean;
  officerId?: string;
  department?: string;
  designation?: string;
  createdAt: string;
  lastLogin?: string;
}

interface UserManagementProps {
  currentUser: any;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter, showUnverifiedOnly]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.officerId && user.officerId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(user => !user.isActive);
      }
    }

    if (showUnverifiedOnly) {
      filtered = filtered.filter(user => user.role === 'officer' && !user.isVerified);
    }

    setFilteredUsers(filtered);
  };

  const verifyOfficer = async (userId: string) => {
    try {
      const response = await fetch(`/api/auth/verify-officer/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify officer');
      }

      // Refresh users list
      await fetchUsers();
      alert('Officer verified successfully!');
    } catch (error) {
      console.error('Error verifying officer:', error);
      alert('Failed to verify officer');
    }
  };

  const deactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate user');
      }

      // Refresh users list
      await fetchUsers();
      alert('User deactivated successfully!');
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Failed to deactivate user');
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'officer' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    return role === 'officer' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const stats = {
    total: users.length,
    officers: users.filter(u => u.role === 'officer').length,
    citizens: users.filter(u => u.role === 'citizen').length,
    unverified: users.filter(u => u.role === 'officer' && !u.isVerified).length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage officers and citizens</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUnverifiedOnly(!showUnverifiedOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showUnverifiedOnly
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock className="w-4 h-4 mr-2 inline" />
                Unverified Only
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.officers}</p>
                <p className="text-sm text-gray-600">Officers</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <UserCheck className="w-6 h-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.citizens}</p>
                <p className="text-sm text-gray-600">Citizens</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.unverified}</p>
                <p className="text-sm text-gray-600">Unverified</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">{stats.inactive}</p>
                <p className="text-sm text-gray-600">Inactive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="officer">Officers</option>
                <option value="citizen">Citizens</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                          {user.officerId && (
                            <div className="text-xs text-blue-600">ID: {user.officerId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </span>
                      {user.role === 'officer' && (
                        <div className="mt-1">
                          {user.isVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Unverified
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      {user.lastLogin && (
                        <div className="text-xs text-gray-400 mt-1">
                          Last: {new Date(user.lastLogin).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.role === 'officer' && !user.isVerified && (
                          <button
                            onClick={() => verifyOfficer(user._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Verify Officer"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {user.isActive && user._id !== currentUser._id && (
                          <button
                            onClick={() => deactivateUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Deactivate User"
                          >
                            <UserX className="w-4 h-4" />
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">{selectedUser.name}</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="font-medium">Username:</span>
                      <span className="ml-2">{selectedUser.username}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{selectedUser.email}</span>
                    </div>
                    
                    {selectedUser.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="font-medium">Phone:</span>
                        <span className="ml-2">{selectedUser.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="font-medium">Role:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedUser.isActive)}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {selectedUser.role === 'officer' && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Officer Information</h4>
                      <div className="space-y-3 text-sm">
                        {selectedUser.officerId && (
                          <div className="flex items-center">
                            <Badge className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="font-medium">Officer ID:</span>
                            <span className="ml-2">{selectedUser.officerId}</span>
                          </div>
                        )}
                        
                        {selectedUser.department && (
                          <div className="flex items-center">
                            <Building className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="font-medium">Department:</span>
                            <span className="ml-2">{selectedUser.department}</span>
                          </div>
                        )}
                        
                        {selectedUser.designation && (
                          <div className="flex items-center">
                            <UserCheck className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="font-medium">Designation:</span>
                            <span className="ml-2">{selectedUser.designation}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="font-medium">Verification:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            selectedUser.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-3">Account Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="font-medium">Joined:</span>
                        <span className="ml-2">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {selectedUser.lastLogin && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="font-medium">Last Login:</span>
                          <span className="ml-2">{new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t flex space-x-3">
                {selectedUser.role === 'officer' && !selectedUser.isVerified && (
                  <button
                    onClick={() => {
                      verifyOfficer(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Verify Officer
                  </button>
                )}
                
                {selectedUser.isActive && selectedUser._id !== currentUser._id && (
                  <button
                    onClick={() => {
                      deactivateUser(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;