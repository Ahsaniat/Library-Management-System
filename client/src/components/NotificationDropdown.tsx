import { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from '../hooks';
import { useAuthStore } from '../store';
import { formatDateTime } from '../utils';
import { cn } from '../utils';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  if (!isAuthenticated) return null;

  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'due_reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue_notice':
        return 'bg-red-100 text-red-800';
      case 'reservation_ready':
        return 'bg-green-100 text-green-800';
      case 'fine_notice':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : data?.notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                data?.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 border-b hover:bg-gray-50 transition-colors',
                      !notification.isRead && 'bg-blue-50'
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', getTypeColor(notification.type))}>
                            {notification.type.replace('_', ' ')}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
