'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import type { Child, CreateChild, UpdateChild } from '@repo/types';

const childSchema = z.object({
  display_name: z.string().min(1, 'Name is required'),
  birth_year: z.number().min(2010).max(2025).optional(),
  locale: z.enum(['en', 'vi']).optional(),
});

type ChildFormData = z.infer<typeof childSchema>;

interface ChildDialogProps {
  child?: Child;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateChild | UpdateChild) => Promise<void>;
}

export function ChildDialog({ child, isOpen, onClose, onSave }: ChildDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!child;

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      display_name: child?.display_name || '',
      birth_year: child?.birth_year || undefined,
      locale: (child?.locale as 'en' | 'vi') || 'en',
    },
  });

  useEffect(() => {
    if (child) {
      form.reset({
        display_name: child.display_name,
        birth_year: child.birth_year || undefined,
        locale: (child.locale as 'en' | 'vi') || 'en',
      });
    } else {
      form.reset({
        display_name: '',
        birth_year: undefined,
        locale: 'en',
      });
    }
  }, [child, form]);

  const onSubmit = async (data: ChildFormData) => {
    setLoading(true);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save child:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Child' : 'Add Child'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Update your child\'s information' : 'Create a new child profile'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Child's Name</Label>
              <Input
                id="display_name"
                placeholder="Enter child's name"
                {...form.register('display_name')}
              />
              {form.formState.errors.display_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.display_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_year">Birth Year (Optional)</Label>
              <Input
                id="birth_year"
                type="number"
                min="2010"
                max="2025"
                placeholder="2015"
                {...form.register('birth_year', { valueAsNumber: true })}
              />
              {form.formState.errors.birth_year && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.birth_year.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locale">Language</Label>
              <select
                id="locale"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('locale')}
              >
                <option value="en">English</option>
                <option value="vi">Vietnamese</option>
              </select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
