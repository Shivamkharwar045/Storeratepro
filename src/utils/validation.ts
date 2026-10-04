/**
 * Validation rules specified in Roxiler FSDI Assessment:
 * 1. Name: Min 20 characters, Max 60 characters
 * 2. Address: Max 400 characters
 * 3. Password: 8–16 characters, at least 1 uppercase letter, at least 1 special character
 * 4. Email: Standard email validation
 * 5. Rating: 1 to 5 integer
 */

export const validateName = (name: string): string | null => {
  if (!name || typeof name !== 'string') {
    return 'Name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return `Name must be at least 20 characters long (currently ${trimmed.length}).`;
  }
  if (trimmed.length > 60) {
    return `Name must not exceed 60 characters (currently ${trimmed.length}).`;
  }
  return null;
};

export const validateStoreName = (name: string): string | null => {
  if (!name || typeof name !== 'string') {
    return 'Store name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return 'Store name must be at least 3 characters long.';
  }
  if (trimmed.length > 100) {
    return 'Store name must not exceed 100 characters.';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email || typeof email !== 'string') {
    return 'Email is required.';
  }
  const trimmed = email.trim();
  // Standard email RFC 5322 regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address (e.g. name@domain.com).';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8 || password.length > 16) {
    return `Password must be between 8 and 16 characters (currently ${password.length}).`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least 1 uppercase letter.';
  }
  // Special characters: !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return 'Password must contain at least 1 special character (e.g., @, #, $, !).';
  }
  return null;
};

export const validateAddress = (address: string): string | null => {
  if (!address || typeof address !== 'string') {
    return 'Address is required.';
  }
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return 'Address cannot be empty.';
  }
  if (trimmed.length > 400) {
    return `Address must not exceed 400 characters (currently ${trimmed.length}).`;
  }
  return null;
};

export const validateRating = (rating: number): string | null => {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return 'Rating must be a numeric score.';
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
};
