

export const markAllNotificationsAsRead_friend = async (userId: number) => {

  try {
    console.log('marking all notifications as read');
    const response = await fetch('https://localhost:8080/api/chat/notifications/friend_request/mark-as-read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.status) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
  }
};

export const markAllNotificationsAsRead_game = async (userId: number) => {
  try {
    console.log('marking all notifications as read');
    const response = await fetch('https://localhost:8080/api/chat/notifications/game/mark-as-read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.status) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
  }
};
