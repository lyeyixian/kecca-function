const isEmpty = (string) => {
  return string.trim() === "";
};

const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (email.match(emailRegEx)) {
    return true;
  } else {
    return false;
  }
};

const isName = (name) => {
  const nameRegEx = /^[a-zA-Z]+ [a-zA-Z]+ /;

  return nameRegEx.test(name);
};

exports.validateSignupData = (data) => {
  let errors = {};

  // Email
  const test = isEmail(data.email);
  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }

  // Password
  if (isEmpty(data.password)) {
    errors.password = "Must not be empty";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Password must match";
  }

  // Student card
  if (isEmpty(data.studentCard)) {
    errors.studentCard = "Must not be empty";
  }

  // Name
  if (isEmpty(data.name)) {
    errors.name = "Must not be empty";
  } else if (!isName(data.name)) {
    errors.name = "Must be full name";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateLoginData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  }

  if (isEmpty(data.password)) {
    errors.password = "Must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};
