// Script to clear corrupted localStorage data
// This should be run in browser console or as part of app startup in development

if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    // Clear auth-related items that might be corrupted
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Log remaining localStorage items for debugging
    console.log('Cleared auth localStorage. Remaining items:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value}`);
    }
}
