
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
              <p className="text-gray-500">@{profile?.username}</p>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <Input
                  value={profile?.username}
                  onChange={(e) => setProfile(prev => ({ ...prev!, username: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  value={profile?.full_name}
                  onChange={(e) => setProfile(prev => ({ ...prev!, full_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <Input
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev!, bio: e.target.value }))}
                />
              </div>
              <div className="flex space-x-4">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p>{profile?.bio || 'No bio yet'}</p>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
