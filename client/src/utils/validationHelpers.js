export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePhoneNumber = (phone) => {
  const regex = /^[0-9+\-\s()]*$/;
  return regex.test(phone) && phone.length >= 10;
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
