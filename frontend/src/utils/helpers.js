export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getDifficultyColor = (difficulty) => {
  const colors = {
    Beginner: 'var(--color-accent)',
    Intermediate: 'var(--color-warning)',
    Advanced: 'var(--color-danger)',
  };
  return colors[difficulty] || 'var(--color-text-secondary)';
};

export const getFocusColor = (score) => {
  if (score >= 80) return 'var(--color-focused)';
  if (score >= 50) return 'var(--color-reengaging)';
  return 'var(--color-distracted)';
};

export const getFocusLabel = (score) => {
  if (score >= 80) return 'Focused';
  if (score >= 50) return 'Re-engaging';
  return 'Distracted';
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
