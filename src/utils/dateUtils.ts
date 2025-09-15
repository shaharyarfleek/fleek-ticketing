export const formatDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes}m ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours}h ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const isOverdue = (dueDate?: Date): boolean => {
  if (!dueDate) return false;
  return new Date() > dueDate;
};