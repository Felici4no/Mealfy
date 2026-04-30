export const isPubliclyVisibleFamily = (family: any): boolean => {
  // Family must be approved to be public
  if (family.status !== 'approved') return false;
  
  // Support status must be eligible (not suspended or rejected)
  return family.supportStatus !== 'rejected' && 
         family.supportStatus !== 'suspended';
};
