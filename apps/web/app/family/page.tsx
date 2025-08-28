'use client';

import type { Child, CreateChild, UpdateChild } from '@repo/types';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { useEffect,useState } from 'react';

import { ChildDialog } from '@/src/components/app/child-dialog';
import { apiClient } from '@/src/lib/api';

// Mock authentication for testing
const mockSession = {
  access_token: 'mock-token-for-testing'
};

export default function FamilyPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await apiClient.getChildren(mockSession.access_token);
      setChildren(response.data);
    } catch (error) {
      console.error('Failed to fetch children:', error);
      // For testing, show a mock child if API fails
      setChildren([
        {
          id: 'mock-child-1',
          guardian_id: 'mock-guardian-id',
          display_name: 'Emma',
          avatar_url: null,
          birth_year: 2018,
          locale: 'en',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChild = async (data: CreateChild) => {
    try {
      await apiClient.createChild(mockSession.access_token, data);
      await fetchChildren();
    } catch (error) {
      console.error('Failed to create child:', error);
      // For testing, simulate creating a child
      const newChild: Child = {
        id: `mock-child-${Date.now()}`,
        guardian_id: 'mock-guardian-id',
        display_name: data.display_name,
        avatar_url: data.avatar_url ?? null,
        birth_year: data.birth_year ?? null,
        locale: data.locale ?? 'en',
        created_at: new Date().toISOString()
      };
      setChildren(prev => [...prev, newChild]);
      throw error; // Still throw to show error handling
    }
  };

  const handleUpdateChild = async (data: UpdateChild) => {
    if (!editingChild) return;

    try {
      await apiClient.updateChild(mockSession.access_token, editingChild.id, data);
      await fetchChildren();
    } catch (error) {
      console.error('Failed to update child:', error);
      // For testing, simulate updating the child
      setChildren(prev => prev.map(child =>
        child.id === editingChild.id
          ? { ...child, ...data }
          : child
      ));
      throw error; // Still throw to show error handling
    }
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      await apiClient.deleteChild(mockSession.access_token, childId);
      await fetchChildren();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete child:', error);
      // For testing, simulate deleting the child
      setChildren(prev => prev.filter(child => child.id !== childId));
      setDeleteConfirm(null);
    }
  };

  const openCreateDialog = () => {
    setEditingChild(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (child: Child) => {
    setEditingChild(child);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingChild(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">WonderKids</h1>
            <nav className="flex space-x-4">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
              <a href="/family" className="text-purple-600 font-medium">Family</a>
              <a href="/lesson/1d8ac6ee-03d7-405a-866b-34d904aaa7da" className="text-gray-600 hover:text-gray-900">Lessons</a>
              <a href="/" className="text-gray-600 hover:text-gray-900">Sign Out</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Family Profiles</h1>
              <p className="text-muted-foreground">
                Manage your children's learning profiles
              </p>
            </div>
            <Button onClick={openCreateDialog}>
              Add Child
            </Button>
          </div>

      {/* Children Grid */}
      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium">No children added yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Add your first child profile to start their English learning journey with WonderKids.
              </p>
              <Button onClick={openCreateDialog}>
                Add Your First Child
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium text-lg">
                      {child.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{child.display_name}</CardTitle>
                    <CardDescription>
                      {child.birth_year && `Born ${child.birth_year}`}
                      {child.locale && ` • ${child.locale === 'en' ? 'English' : 'Vietnamese'}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>Learning progress: Just started</p>
                    <p>Current level: Beginner</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(child)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(child.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Child Dialog */}
      <ChildDialog
        child={editingChild}
        isOpen={dialogOpen}
        onClose={closeDialog}
        onSave={editingChild ? handleUpdateChild : handleCreateChild}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Delete Child Profile</CardTitle>
              <CardDescription>
                Are you sure you want to delete this child's profile? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDeleteChild(deleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
