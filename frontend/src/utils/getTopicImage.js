export const getTopicImage = (title) => {
  if (!title) return 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=225&fit=crop';
  
  const t = title.toLowerCase();
  
  if (t.includes('python') || t.includes('code') || t.includes('mosh') || t.includes('prog') || t.includes('java') || t.includes('react')) {
    // Coding / Software
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop';
  }
  
  if (t.includes('chem') || t.includes('iupac') || t.includes('organic') || t.includes('science')) {
    // Chemistry / Science (Beakers/lab)
    return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=225&fit=crop';
  }
  
  if (t.includes('math') || t.includes('calc') || t.includes('algebra')) {
    // Math
    return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop';
  }
  
  // Default clean fallback (soft abstract gradient)
  return 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=225&fit=crop';
};
