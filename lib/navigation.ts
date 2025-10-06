export const getNavigationByRole = (role: string | undefined) => {
  const isAdmin = role === 'admin';

  return {
    dashboard: isAdmin ? '/admin/dashboard' : '/dashboard',
    projects: isAdmin ? '/admin/projects' : '/projects',
    map: isAdmin ? '/admin/map' : '/map',
    contractors: isAdmin ? '/admin/contractors' : null,
    profile: isAdmin ? '/admin/profile' : '/profile',
    settings: isAdmin ? '/admin/settings' : '/settings',
  }
}

export const getBasePathByRole = (role: string | undefined) => {
  return role === 'admin' ? '/admin' : ''
}