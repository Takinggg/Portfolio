import React, { useState, useEffect } from 'react';
import { Mail, Settings, BarChart3, Send, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';

interface NotificationSettings {
  emailProvider: string;
  enableNotifications: boolean;
  enableReminders: boolean;
  reminderOffsets: string;
  fromEmail: string;
  fromName: string;
  ownerNotify: boolean;
  ownerEmail: string;
  smtpConfigured: boolean;
  resendConfigured: boolean;
  postmarkConfigured: boolean;
}

interface NotificationStats {
  notifications: {
    total: { count: number };
    sent: { count: number };
    failed: { count: number };
    pending: { count: number };
    byType: Array<{ notification_type: string; count: number }>;
    recent: Array<{
      notification_type: string;
      status: string;
      recipient_email: string;
      created_at: string;
      sent_at?: string;
      error_message?: string;
    }>;
  };
  reminders: {
    total: { count: number };
    pending: { count: number };
    sent: { count: number };
    failed: { count: number };
    upcomingToday: { count: number };
  };
}

export const NotificationsManager: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isProcessingReminders, setIsProcessingReminders] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [settingsRes, statsRes] = await Promise.all([
        fetch('/api/admin/scheduling/notifications/settings', {
          headers: {
            'Authorization': `Basic ${btoa(`${process.env.VITE_ADMIN_USERNAME}:${process.env.VITE_ADMIN_PASSWORD}`)}`
          }
        }),
        fetch('/api/admin/scheduling/notifications/stats', {
          headers: {
            'Authorization': `Basic ${btoa(`${process.env.VITE_ADMIN_USERNAME}:${process.env.VITE_ADMIN_PASSWORD}`)}`
          }
        })
      ]);

      if (settingsRes.ok && statsRes.ok) {
        const [settingsData, statsData] = await Promise.all([
          settingsRes.json(),
          statsRes.json()
        ]);
        setSettings(settingsData.settings);
        setStats(statsData.stats);
      } else {
        throw new Error('Failed to fetch notification data');
      }
    } catch (error) {
      console.error('Error fetching notification data:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSendingTest(true);
      const response = await fetch('/api/admin/scheduling/notifications/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${process.env.VITE_ADMIN_USERNAME}:${process.env.VITE_ADMIN_PASSWORD}`)}`
        },
        body: JSON.stringify({ to: testEmail })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Test email sent successfully!');
        setTestEmail('');
        // Refresh stats to show the sent email
        setTimeout(fetchData, 1000);
      } else {
        toast.error(result.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const processReminders = async () => {
    try {
      setIsProcessingReminders(true);
      const response = await fetch('/api/admin/scheduling/notifications/process-reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${process.env.VITE_ADMIN_USERNAME}:${process.env.VITE_ADMIN_PASSWORD}`)}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Processed ${result.processed} reminders`);
        // Refresh stats
        fetchData();
      } else {
        toast.error('Failed to process reminders');
      }
    } catch (error) {
      console.error('Error processing reminders:', error);
      toast.error('Failed to process reminders');
    } finally {
      setIsProcessingReminders(false);
    }
  };

  const getProviderBadge = (provider: string, configured: boolean) => {
    if (provider === 'log-only') {
      return <Badge variant="outline">Log Only (Development)</Badge>;
    }
    
    return (
      <Badge variant={configured ? "default" : "destructive"}>
        {provider.toUpperCase()} {configured ? '✓' : '✗'}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings || !stats) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-gray-600">Failed to load notification settings</p>
        <Button onClick={fetchData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Email Notifications
          </h1>
          <p className="text-gray-600">Manage email notifications and reminders</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Configuration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Email Provider</CardTitle>
          </CardHeader>
          <CardContent>
            {getProviderBadge(
              settings.emailProvider, 
              settings.emailProvider === 'smtp' ? settings.smtpConfigured :
              settings.emailProvider === 'resend' ? settings.resendConfigured :
              settings.emailProvider === 'postmark' ? settings.postmarkConfigured : true
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={settings.enableNotifications ? "default" : "secondary"}>
              {settings.enableNotifications ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={settings.enableReminders ? "default" : "secondary"}>
              {settings.enableReminders ? 'Enabled' : 'Disabled'}
            </Badge>
            {settings.enableReminders && (
              <p className="text-xs text-gray-500 mt-1">{settings.reminderOffsets}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Owner Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={settings.ownerNotify ? "default" : "secondary"}>
              {settings.ownerNotify ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4" />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.notifications.sent.count}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.notifications.failed.count}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.reminders.pending.count}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Today's Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.reminders.upcomingToday.count}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify your configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="max-w-sm"
            />
            <Button 
              onClick={sendTestEmail} 
              disabled={isSendingTest || !testEmail}
              className="flex items-center gap-2"
            >
              {isSendingTest ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Manual Reminder Processing
          </CardTitle>
          <CardDescription>
            Process pending reminders manually (normally runs automatically every 5 minutes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={processReminders} 
            disabled={isProcessingReminders}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isProcessingReminders ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <Clock className="h-4 w-4" />
            )}
            Process Reminders
          </Button>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.notifications.recent.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent notifications</p>
          ) : (
            <div className="space-y-3">
              {stats.notifications.recent.map((notification, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(notification.status)}
                    <div>
                      <p className="font-medium text-sm">
                        {notification.notification_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        to: {notification.recipient_email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                    {notification.error_message && (
                      <p className="text-xs text-red-500 max-w-xs truncate">
                        {notification.error_message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Email Settings</h4>
              <div className="space-y-1 text-gray-600">
                <p><strong>From Name:</strong> {settings.fromName}</p>
                <p><strong>From Email:</strong> {settings.fromEmail}</p>
                <p><strong>Provider:</strong> {settings.emailProvider}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Notification Settings</h4>
              <div className="space-y-1 text-gray-600">
                <p><strong>Notifications:</strong> {settings.enableNotifications ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Reminders:</strong> {settings.enableReminders ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Reminder Offsets:</strong> {settings.reminderOffsets}</p>
                <p><strong>Owner Notifications:</strong> {settings.ownerNotify ? 'Enabled' : 'Disabled'}</p>
                {settings.ownerNotify && settings.ownerEmail && (
                  <p><strong>Owner Email:</strong> {settings.ownerEmail}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};