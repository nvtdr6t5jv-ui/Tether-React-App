export interface Friend {
  id: string;
  name: string;
  photo: string | null;
  initials: string;
}

export interface Orbit {
  id: string;
  label: string;
  frequency: string;
}

export const mockContacts: Friend[] = [
  { id: '1', name: 'Alex Chen', photo: 'https://i.pravatar.cc/150?img=1', initials: 'AC' },
  { id: '2', name: 'Mom', photo: 'https://i.pravatar.cc/150?img=5', initials: 'M' },
  { id: '3', name: 'Sarah Jones', photo: 'https://i.pravatar.cc/150?img=9', initials: 'SJ' },
  { id: '4', name: 'David Kim', photo: 'https://i.pravatar.cc/150?img=3', initials: 'DK' },
  { id: '5', name: 'Emma Wilson', photo: 'https://i.pravatar.cc/150?img=10', initials: 'EW' },
  { id: '6', name: 'Dentist Office', photo: null, initials: 'D' },
  { id: '7', name: 'Landlord', photo: null, initials: 'L' },
  { id: '8', name: 'Mike Thompson', photo: 'https://i.pravatar.cc/150?img=12', initials: 'MT' },
  { id: '9', name: 'Lisa Park', photo: 'https://i.pravatar.cc/150?img=16', initials: 'LP' },
  { id: '10', name: 'Gym Trainer', photo: null, initials: 'G' },
];

export const orbits: Orbit[] = [
  { id: 'inner', label: 'Inner Circle', frequency: 'Every week' },
  { id: 'close', label: 'Close Friend', frequency: 'Every month' },
  { id: 'catchup', label: 'Catch Up', frequency: 'Every 3 months' },
];

export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const avatarColors = ['#81B29A', '#E07A5F', '#F2CC8F', '#3D405B', '#A8DADC'];

export const getAvatarColor = (index: number): string => {
  return avatarColors[index % avatarColors.length];
};
