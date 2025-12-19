import { Share, Platform } from 'react-native';
import { Paths, File } from 'expo-file-system';
import { storageService } from './StorageService';

export interface ExportData {
  version: string;
  exportedAt: string;
  friends: any[];
  interactions: any[];
  notes: any[];
  calendarEvents: any[];
  userProfile: any;
  userSettings: any;
}

class ExportService {
  async exportAllData(): Promise<string> {
    const [friends, interactions, notes, calendarEvents, userProfile, userSettings] = await Promise.all([
      storageService.getFriends(),
      storageService.getInteractions(),
      storageService.getNotes(),
      storageService.getCalendarEvents(),
      storageService.getUserProfile(),
      storageService.getUserSettings(),
    ]);

    const exportData: ExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      friends,
      interactions,
      notes,
      calendarEvents,
      userProfile,
      userSettings,
    };

    return JSON.stringify(exportData, null, 2);
  }

  async shareExport(): Promise<boolean> {
    try {
      const data = await this.exportAllData();
      const fileName = `tether-backup-${new Date().toISOString().split('T')[0]}.json`;

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const file = new File(Paths.cache, fileName);
        await file.write(data);

        await Share.share({
          url: file.uri,
          title: 'Tether Backup',
          message: 'My Tether backup data',
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  }

  async getExportSummary(): Promise<{
    friendsCount: number;
    interactionsCount: number;
    notesCount: number;
    eventsCount: number;
  }> {
    const [friends, interactions, notes, calendarEvents] = await Promise.all([
      storageService.getFriends(),
      storageService.getInteractions(),
      storageService.getNotes(),
      storageService.getCalendarEvents(),
    ]);

    return {
      friendsCount: friends.length,
      interactionsCount: interactions.length,
      notesCount: notes.length,
      eventsCount: calendarEvents.length,
    };
  }
}

export const exportService = new ExportService();